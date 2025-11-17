import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const admin = serviceRoleKey && supabaseUrl
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

export async function POST(req: NextRequest) {
  if (!admin) {
    return NextResponse.json(
      { error: 'Configuração ausente: SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const { id, full_name, access_level, role, permissions, actor_id } = body || {}

    if (!id) {
      return NextResponse.json({ error: 'Campo "id" é obrigatório' }, { status: 400 })
    }

    const payload: any = {
      id,
      full_name: full_name ?? null,
      access_level: access_level ?? null,
      role: role ?? null,
      permissions: permissions ?? null,
      updated_at: new Date().toISOString(),
    }

    const { error: upsertError } = await admin.from('profiles').upsert(payload, { onConflict: 'id' })
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    // Tenta registrar log (se a tabela existir)
    try {
      await admin.from('admin_logs').insert({
        actor_id: actor_id ?? null,
        target_id: id,
        action: 'update_profile',
        changes: payload,
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      // Ignorar se a tabela não existir ou RLS impedir
      console.warn('Falha ao inserir log admin:', e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro inesperado ao atualizar perfil' }, { status: 500 })
  }
}