'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const PSD_BLUE = '#0065BD'
const PSD_YELLOW = '#FFA300'

interface ProfileRow {
  id: string
  full_name?: string | null
  email?: string | null
  access_level?: number | null
  role?: string | null
  permissions?: {
    is_admin?: boolean
    can_edit?: boolean
    can_delete?: boolean
    [key: string]: any
  } | null
  blocked?: boolean | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, profile, profileLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profiles, setProfiles] = useState<ProfileRow[]>([])

  const isAdmin = useMemo(() => {
    return profile?.access_level === 4 || profile?.permissions?.is_admin === true
  }, [profile])

  useEffect(() => {
    // Aguarda o perfil estar disponível antes de decidir
    if (profileLoading || !profile) return
    if (!isAdmin) {
      // Não redireciona automaticamente; apenas mostra mensagem e evita carregar
      setLoading(false)
      return
    }
    loadProfiles()
  }, [profile, isAdmin, profileLoading])

  async function loadProfiles() {
    try {
      setLoading(true)
      setError('')
      // Primeiro tenta buscar incluindo 'blocked'; se coluna não existir, faz fallback sem ela
      let { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, access_level, role, permissions, blocked')
        .order('full_name', { nullsFirst: true })
      if (error) {
        const msg = (error.message || '').toLowerCase()
        if (msg.includes('blocked') || msg.includes('does not exist') || (error as any).code === '42703') {
          const res2 = await supabase
            .from('profiles')
            .select('id, full_name, email, access_level, role, permissions')
            .order('full_name', { nullsFirst: true })
          if (res2.error) throw res2.error
          // adicionar blocked=false por padrão
          setProfiles((res2.data || []).map((p: any) => ({ ...p, blocked: false })))
        } else {
          throw error
        }
      } else {
        setProfiles(data || [])
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }

  async function toggleBlocked(p: ProfileRow) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ blocked: !p.blocked, updated_at: new Date().toISOString() })
        .eq('id', p.id)
      if (error) throw error
      await loadProfiles()
    } catch (e: any) {
      alert(e?.message || 'Erro ao atualizar bloqueio')
    }
  }

  // Dialog state
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProfileRow | null>(null)
  const [form, setForm] = useState<ProfileRow>({ id: '' })
  const [saving, setSaving] = useState(false)

  // Create-by-UID state
  const [newUid, setNewUid] = useState('')
  const [newName, setNewName] = useState('')
  const [newLevel, setNewLevel] = useState(1)
  const [newRole, setNewRole] = useState('viewer')
  const [newPerms, setNewPerms] = useState<{ is_admin?: boolean; can_edit?: boolean; can_delete?: boolean }>({})
  const [creating, setCreating] = useState(false)

  // Generate magic login links
  const [generatingLinks, setGeneratingLinks] = useState(false)
  const [loginLinks, setLoginLinks] = useState<{ email: string; url?: string; error?: string }[]>([])
  const [showGenerateLinks, setShowGenerateLinks] = useState(false)

  async function generateLoginLinks() {
    try {
      setGeneratingLinks(true)
      setLoginLinks([])
      const res = await fetch('/api/admin/generate-login-links', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Falha ${res.status}`)
      }
      const data = await res.json()
      setLoginLinks(data?.links || [])
    } catch (e: any) {
      alert(e?.message || 'Erro ao gerar links de login')
    } finally {
      setGeneratingLinks(false)
    }
  }

  function openEdit(p: ProfileRow) {
    setEditing(p)
    setForm({
      id: p.id,
      full_name: p.full_name ?? '',
      access_level: p.access_level ?? 1,
      role: p.role ?? 'viewer',
      permissions: {
        is_admin: p.permissions?.is_admin ?? (p.access_level === 4),
        can_edit: p.permissions?.can_edit ?? false,
        can_delete: p.permissions?.can_delete ?? false,
        ...((p.permissions || {}) as any),
      },
    })
    setModalOpen(true)
  }

  async function save() {
    if (!form?.id) return
    try {
      setSaving(true)
      const payload: any = {
        id: form.id,
        full_name: form.full_name ?? null,
        access_level: form.access_level ?? null,
        role: form.role ?? null,
        permissions: form.permissions ?? null,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
      if (error) throw error
      setModalOpen(false)
      setEditing(null)
      await loadProfiles()
    } catch (e: any) {
      alert(e?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function createProfileByUid() {
    const uid = newUid.trim()
    if (!uid) {
      alert('Informe o UID do usuário.')
      return
    }
    try {
      setCreating(true)
      const payload: any = {
        id: uid,
        full_name: newName.trim() ? newName.trim() : null,
        access_level: newLevel ?? null,
        role: newRole ?? null,
        permissions: newPerms && Object.keys(newPerms).length ? newPerms : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from('profiles')
        .insert(payload)
      if (error) {
        if ((error as any).code === '23505' || (error.message || '').toLowerCase().includes('duplicate')) {
          alert('Já existe perfil para este UID.')
        } else {
          throw error
        }
      } else {
        alert('Perfil criado com sucesso.')
        setNewUid('')
        setNewName('')
        setNewLevel(1)
        setNewRole('viewer')
        setNewPerms({})
        await loadProfiles()
      }
    } catch (e: any) {
      alert(e?.message || 'Erro ao criar perfil')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PSD_BLUE }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Administração de Usuários</h1>
          <button
            onClick={() => router.push('/municipios')}
            className="px-4 py-2 rounded font-bold text-gray-800 shadow-md hover:shadow-lg"
            style={{ backgroundColor: PSD_YELLOW }}
          >
            Voltar para Municípios
          </button>
        </div>
        <p className="text-white/90 mb-6">Gerencie níveis de acesso e permissões.</p>

        {/* Lista e edição de perfis */}

        {profileLoading ? (
          <div className="text-white">Carregando perfil...</div>
        ) : profile && !isAdmin ? (
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-red-600">Você não tem permissão para acessar esta área.</p>
          </div>
        ) : loading ? (
          <div className="text-white">Carregando perfis...</div>
        ) : error ? (
          <div className="text-red-200">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Nível</th>
                  <th className="px-4 py-3">Função</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id} className={`border-t ${p.blocked ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">{p.full_name || p.email || '-'}</td>
                    <td className="px-4 py-3">{p.email || '-'}</td>
                    <td className="px-4 py-3">{p.access_level ?? '-'}</td>
                    <td className="px-4 py-3">{p.role ?? '-'}</td>
                    <td className="px-4 py-3">{p.blocked ? 'Bloqueado' : 'Ativo'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 rounded bg-yellow-400 font-bold text-gray-800 hover:bg-yellow-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleBlocked(p)}
                        className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        {p.blocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Criar perfil por UID (visível após a tabela) */}
        <div className="bg-white rounded-lg shadow-md p-4 mt-6 mb-6">
          <h2 className="text-lg font-bold mb-2">Criar perfil por UID (casos raros)</h2>
          <p className="text-sm text-gray-600 mb-4">Use quando o usuário existe em Auth mas não possui registro em profiles. Copie o UID do Supabase Studio.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">UID</label>
              <input
                type="text"
                value={newUid}
                onChange={e => setNewUid(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="ex.: cb98...3a79c"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome completo</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nível de acesso</label>
              <select
                value={newLevel}
                onChange={e => setNewLevel(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              >
                <option value={1}>1 - Viewer</option>
                <option value={2}>2 - Editor</option>
                <option value={3}>3 - Gestor</option>
                <option value={4}>4 - Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Função</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="viewer">viewer</option>
                <option value="editor">editor</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </select>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(newPerms.is_admin)}
                onChange={e => setNewPerms(prev => ({ ...prev, is_admin: e.target.checked }))}
              />
              <span>is_admin</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(newPerms.can_edit)}
                onChange={e => setNewPerms(prev => ({ ...prev, can_edit: e.target.checked }))}
              />
              <span>can_edit</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(newPerms.can_delete)}
                onChange={e => setNewPerms(prev => ({ ...prev, can_delete: e.target.checked }))}
              />
              <span>can_delete</span>
            </label>
          </div>
          <div className="mt-4">
            <button
              onClick={createProfileByUid}
              disabled={creating}
              className="px-4 py-2 rounded font-bold text-gray-800 shadow-md hover:shadow-lg"
              style={{ backgroundColor: PSD_YELLOW }}
            >
              {creating ? 'Criando...' : 'Criar perfil por UID'}
            </button>
          </div>
        </div>

        {/* Gerar links de login para todos (recolhível abaixo) */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <button
            onClick={() => setShowGenerateLinks(v => !v)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={showGenerateLinks}
          >
            <span className="text-lg font-bold">Gerar links de login para todos</span>
            <span className="text-sm">{showGenerateLinks ? '▲' : '▼'}</span>
          </button>
          {showGenerateLinks && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-4">Gera Magic Links de login para todos usuários com e-mail. Requer chave Service Role no servidor.</p>
              <div className="flex gap-3">
                <button
                  onClick={generateLoginLinks}
                  disabled={generatingLinks}
                  className="px-4 py-2 rounded font-bold text-gray-800 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: PSD_YELLOW }}
                >
                  {generatingLinks ? 'Gerando...' : 'Gerar links de login'}
                </button>
              </div>
              {loginLinks.length > 0 && (
                <div className="mt-4">
                  <div className="overflow-auto border rounded">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Link</th>
                          <th className="px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginLinks.map((row, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2 text-sm">{row.email}</td>
                            <td className="px-4 py-2 text-xs break-all">
                              {row.error ? (
                                <span className="text-red-600">Erro: {row.error}</span>
                              ) : row.url ? (
                                <a href={row.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{row.url}</a>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => row.url && navigator.clipboard.writeText(row.url)}
                                disabled={!row.url}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                              >
                                Copiar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal simples */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Editar usuário</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={form.full_name ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nível de acesso</label>
                  <select
                    value={form.access_level ?? 1}
                    onChange={e => setForm(prev => ({ ...prev, access_level: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value={1}>1 - Viewer</option>
                    <option value={2}>2 - Editor</option>
                    <option value={3}>3 - Gestor</option>
                    <option value={4}>4 - Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Função</label>
                  <select
                    value={form.role ?? 'viewer'}
                    onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                    <option value="manager">manager</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Permissões</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(form.permissions?.is_admin)}
                        onChange={e => setForm(prev => ({
                          ...prev,
                          permissions: { ...(prev.permissions || {}), is_admin: e.target.checked },
                        }))}
                      />
                      <span>is_admin</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(form.permissions?.can_edit)}
                        onChange={e => setForm(prev => ({
                          ...prev,
                          permissions: { ...(prev.permissions || {}), can_edit: e.target.checked },
                        }))}
                      />
                      <span>can_edit</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(form.permissions?.can_delete)}
                        onChange={e => setForm(prev => ({
                          ...prev,
                          permissions: { ...(prev.permissions || {}), can_delete: e.target.checked },
                        }))}
                      />
                      <span>can_delete</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => { setModalOpen(false); setEditing(null) }}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 rounded font-bold text-gray-800"
                  style={{ backgroundColor: PSD_YELLOW }}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}