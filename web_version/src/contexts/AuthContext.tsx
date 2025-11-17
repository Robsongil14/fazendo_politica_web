'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  access_level?: number
  role?: string
  permissions?: { can_edit?: boolean; can_view?: boolean; is_admin?: boolean; can_manage_users?: boolean } | null
  full_name?: string | null
  avatar_url?: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  profile: Profile | null
  profileLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Listener Realtime para forçar logout de todos ou por usuário
  useEffect(() => {
    const channel = supabase
      .channel('app_control')
      .on('broadcast', { event: 'logout_all' }, async () => {
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.warn('Falha ao executar signOut no broadcast logout_all:', e)
        }
      })
      .on('broadcast', { event: 'logout_user' }, async (payload: any) => {
        try {
          const targetId = payload?.userId
          if (user && targetId && user.id === targetId) {
            await supabase.auth.signOut()
          }
        } catch (e) {
          console.warn('Falha ao executar signOut no broadcast logout_user:', e)
        }
      })

    channel.subscribe()

    return () => {
      try {
        supabase.removeChannel(channel)
      } catch {}
    }
  }, [user])

  // Carregar perfil do usuário (tabela public.profiles)
  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true)
      if (!user) {
        setProfile(null)
        setProfileLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, access_level, role, permissions, full_name, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          // Tentar criar perfil via rota interna (service role) se não existir
          try {
            const resp = await fetch('/api/create-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                name: (user as any)?.user_metadata?.name || (user as any)?.email || null,
              }),
            })
            if (resp.ok) {
              const { data: data2, error: error2 } = await supabase
                .from('profiles')
                .select('id, access_level, role, permissions, full_name, avatar_url')
                .eq('id', user.id)
                .single()
              if (!error2 && data2) {
                setProfile(data2 as Profile)
                setProfileLoading(false)
                return
              }
            }
          } catch (e) {
            console.warn('Falha ao criar perfil automaticamente:', e)
          }
          // Não bloquear aplicação por erro de perfil; apenas logar
          console.warn('Falha ao carregar perfil:', error)
          setProfile(null)
          setProfileLoading(false)
          return
        }
        setProfile(data as Profile)
        setProfileLoading(false)
      } catch (err) {
        console.warn('Erro inesperado ao carregar perfil:', err)
        setProfile(null)
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    profile,
    profileLoading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}