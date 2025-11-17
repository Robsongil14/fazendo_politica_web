import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const admin = serviceRoleKey && supabaseUrl
  ? createClient(supabaseUrl, serviceRoleKey)
  : null

export async function GET(req: NextRequest) {
  if (!admin) {
    return NextResponse.json(
      { error: 'Configuração ausente: SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    )
  }

  try {
    // Paginado simples
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const perPage = Number(searchParams.get('perPage') || 200)

    const { data: list, error: listError } = await admin.auth.admin.listUsers({ page, perPage })
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const users = list?.users || []
    const ids = users.map(u => u.id)

    const { data: profiles, error: profError } = await admin
      .from('profiles')
      .select('id, full_name, access_level, role, permissions')
      .in('id', ids)

    if (profError) {
      // Não bloquear - retornamos apenas auth users
      console.warn('Falha ao buscar profiles:', profError)
    }

    const profileMap = new Map<string, any>()
    for (const p of profiles || []) profileMap.set(p.id, p)

    const merged = users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: (u as any).created_at || null,
      profile: profileMap.get(u.id) || null,
    }))

    return NextResponse.json({ users: merged, page, perPage })
  } catch (err) {
    return NextResponse.json({ error: 'Erro inesperado ao listar usuários' }, { status: 500 })
  }
}