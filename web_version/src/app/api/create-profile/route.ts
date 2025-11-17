import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente Admin (service role) para operações que precisam ignorar RLS
const supabaseAdmin = serviceRoleKey && supabaseUrl
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Configuração ausente: SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const { userId, name } = body || {}

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Parâmetro inválido: userId é obrigatório.' },
        { status: 400 }
      )
    }

    const profilePayload = {
      id: userId,
      full_name: typeof name === 'string' ? name : null,
      role: 'viewer',
      access_level: 1,
      permissions: {
        can_edit: false,
        can_view: true,
        is_admin: false,
        can_manage_users: false,
      },
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Erro inesperado ao criar perfil.' },
      { status: 500 }
    )
  }
}