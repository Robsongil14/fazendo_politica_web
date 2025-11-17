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
    const body = await req.json().catch(() => ({}))
    const scope = body?.scope as 'all' | 'user' | undefined
    const userId = body?.userId as string | undefined

    const channel = admin.channel('app_control')
    const status = await channel.subscribe()
    if (status !== 'SUBSCRIBED') {
      return NextResponse.json({ error: 'Falha ao subscrever canal' }, { status: 500 })
    }

    const event = scope === 'user' && userId
      ? { event: 'logout_user', payload: { userId } }
      : { event: 'logout_all', payload: {} }

    const ok = await channel.send({ type: 'broadcast', ...event })

    try { admin.removeChannel(channel) } catch {}

    if (!ok) {
      return NextResponse.json({ error: 'Falha ao enviar broadcast' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, scope: scope || 'all' })
  } catch (err) {
    return NextResponse.json({ error: 'Erro inesperado' }, { status: 500 })
  }
}