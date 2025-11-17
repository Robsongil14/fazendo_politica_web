import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Env vars ausentes: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    )
  }

  const supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const perPage = 100
  let page = 1
  const links: { email: string; url?: string; error?: string }[] = []

  try {
    // Paginar usuários até acabar
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      const users = data?.users || []
      for (const u of users) {
        const email = (u.email || '').trim()
        if (!email) continue
        const { data: gen, error: genErr } = await supabaseAdmin.auth.admin.generateLink({ type: 'magiclink', email })
        if (genErr) {
          links.push({ email, error: genErr.message })
        } else {
          const actionLink = (gen?.properties as any)?.action_link || (gen as any)?.action_link || ''
          links.push({ email, url: String(actionLink) })
        }
      }
      if (users.length < perPage) break
      page += 1
    }
    return NextResponse.json({ links })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Falha ao gerar links' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'