'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLogoutPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogoutAll = async () => {
    try {
      setLoading(true)
      setMessage(null)
      setError(null)

      const resp = await fetch('/api/admin/logout-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'all' }),
      })

      const json = await resp.json()
      if (!resp.ok) {
        setError(json?.error || 'Falha ao deslogar todos os usuários')
        return
      }
      setMessage('Broadcast enviado. Usuários serão deslogados imediatamente.')
    } catch (e: any) {
      setError('Erro inesperado ao enviar broadcast')
    } finally {
      setLoading(false)
    }
  }

  if (!profile?.permissions?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full border rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Acesso restrito</h1>
          <p>Esta página é exclusiva para administradores.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Ferramentas de Administração</h1>
        <p className="mb-6">Deslogar todos os usuários ativos agora.</p>
        <button
          onClick={handleLogoutAll}
          disabled={loading}
          className="w-full py-3 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
        >
          {loading ? 'Enviando...' : 'Deslogar todos agora'}
        </button>

        {message && (
          <div className="mt-4 p-3 rounded bg-green-100 text-green-800">{message}</div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded bg-red-100 text-red-800">{error}</div>
        )}
      </div>
    </div>
  )
}