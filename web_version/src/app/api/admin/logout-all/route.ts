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
    await new Promise<void>((resolve, reject) => {
      try {
        channel.subscribe((status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CHANNEL_ERROR' | 'CLOSED') => {
          if (status === 'SUBSCRIBED') {
            resolve()
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            reject(new Error(`Falha ao subscrever canal: ${status}`))
          }
        })
      } catch (e) {
        reject(e as any)
      }
    })

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