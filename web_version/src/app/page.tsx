'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          router.push('/municipios')
        } else {
          router.push('/auth/login')
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-psd-blue flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        {/* Logo/Mapa da Bahia */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-8 bg-psd-green rounded-full flex items-center justify-center border-4 border-psd-yellow shadow-2xl">
          <div className="text-white font-bold text-sm sm:text-base md:text-lg text-center px-4">
            Mapa da Bahia
            <br />
            (Estilizado)
          </div>
        </div>
        
        {/* Título */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Fazendo Política
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8">
          Gestão Política da Bahia
        </p>
        
        {/* Loading indicator */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-psd-yellow"></div>
        </div>
      </div>
    </div>
  )
}