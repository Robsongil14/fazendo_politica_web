'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

// Cores do PSD (baseado no manual da marca, usar como referência)
const PSD_BLUE = '#0065BD' // Azul principal
const PSD_GREEN = '#6AB232' // Verde
const PSD_YELLOW = '#FFA300' // Amarelo

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, preencha o email e a senha.')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message || 'Erro ao fazer login')
        return
      }
      
      // Sucesso - o redirecionamento será feito pelo AuthContext
      router.push('/municipios')
    } catch (error) {
      setError('Erro inesperado ao tentar fazer login.')
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
            Fazendo Política
          </h1>
          <p className="text-white opacity-90">
            Transparência e participação democrática
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

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

          <div className="text-right mb-5">
            <button
              type="button"
              className="text-white text-sm hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-lg text-gray-800 text-lg font-bold shadow-lg hover:shadow-xl transition-shadow min-h-[50px] flex items-center justify-center"
            style={{ backgroundColor: PSD_YELLOW }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white text-sm">
            Não tem uma conta?{' '}
            <Link 
              href="/auth/signup" 
              className="font-bold hover:underline"
              style={{ color: PSD_YELLOW }}
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}