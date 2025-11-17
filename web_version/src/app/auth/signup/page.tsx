'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

// Cores do PSD (baseado no manual da marca, usar como referência)
const PSD_BLUE = '#0065BD' // Azul principal
const PSD_GREEN = '#6AB232' // Verde
const PSD_YELLOW = '#FFA300' // Amarelo

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

  try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Após confirmar o email, redirecionar para a página de login
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/login`,
        },
      })
      
      if (error) {
        setError(error.message || 'Erro ao criar conta')
        return
      }
      
      // Criar/atualizar perfil na tabela public.profiles via cliente Supabase (sem service role)
      try {
        const userId = data?.user?.id
        if (userId) {
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

          // Política RLS permite INSERT quando id = auth.uid()
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(profilePayload, { onConflict: 'id' })

          if (upsertError) {
            console.warn('Falha ao criar/atualizar perfil:', upsertError)
          }
        }
      } catch (e) {
        // Não bloquear UX por falha no perfil; log para diagnóstico
        console.warn('Erro inesperado ao criar perfil do usuário:', e)
      }

      setSuccess(true)
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      setError('Erro inesperado ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PSD_BLUE }}>
      <div className="w-full max-w-md px-8 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center border-4"
            style={{ 
              backgroundColor: PSD_GREEN,
              borderColor: PSD_YELLOW 
            }}
          >
            <div className="text-white text-center font-bold">
              <div className="text-lg">FAZENDO</div>
              <div className="text-lg">POLÍTICA</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Criar Conta
          </h1>
          <p className="text-white opacity-90">
            Junte-se à nossa plataforma
          </p>
        </div>

        {/* Form */}
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-6 rounded-lg flex flex-col items-center">
            <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2">Cadastro realizado!</h3>
            <p className="text-center mb-4">
              Cadastro finalizado! Vá até seu email e clique no link de confirmação para autenticar sua conta.
            </p>
            <p className="text-sm text-center">
              Redirecionando para a página de login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg text-gray-800 text-lg font-bold shadow-lg hover:shadow-xl transition-shadow min-h-[50px] flex items-center justify-center mt-6"
              style={{ backgroundColor: PSD_YELLOW }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
              ) : (
                'Cadastrar'
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white text-sm">
            Já tem uma conta?{' '}
            <Link 
              href="/auth/login" 
              className="font-bold hover:underline"
              style={{ color: PSD_YELLOW }}
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}