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
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

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

  // Carregar perfil do usuário (tabela public.profiles)
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null)
        return
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, access_level, role, permissions, full_name, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          // Não bloquear aplicação por erro de perfil; apenas logar
          console.warn('Falha ao carregar perfil:', error)
          setProfile(null)
          return
        }
        setProfile(data as Profile)
      } catch (err) {
        console.warn('Erro inesperado ao carregar perfil:', err)
        setProfile(null)
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