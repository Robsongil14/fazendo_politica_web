'use client'

import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, MapPin, User, Users, Loader2, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Cores do PSD (baseado no manual da marca, usar como referência)
const PSD_BLUE = '#0065BD' // Azul principal
const PSD_GREEN = '#6AB232' // Verde
const PSD_YELLOW = '#FFA300' // Amarelo
const TEXT_COLOR_LIGHT = '#333333'
const TEXT_COLOR_DARK = '#666666'
const CARD_BG_COLOR = '#FFFFFF'

// Cor do texto por partido (cores oficiais aproximadas)
const partidoTextColor = (p?: string) => {
  const s = (p || '').trim().toUpperCase()
  const map: Record<string, string> = {
    'PT': '#C8102E',
    'PSD': PSD_BLUE, // usa azul principal para texto
    'MDB': '#00923D',
    'PSDB': '#1B5CAB',
    'PL': '#1E40AF',
    'PDT': '#C62828',
    'PSB': '#FFCC00',
    'REPUBLICANOS': '#1B75BB',
    'PODEMOS': '#0056A7',
    'AVANTE': '#FF6A00',
    'UNIÃO BRASIL': '#003399',
    'UNIAO BRASIL': '#003399',
    'UNIÃO': '#003399',
    'UNIAO': '#003399',
    'PP': '#0099D6',
    'PROGRESSISTAS': '#0099D6',
    'DEM': '#00843D',
    'NOVO': '#F26522',
    'PCDOB': '#C8102E',
    'PSOL': '#FFD700',
    'PV': '#2E7D32',
    'CIDADANIA': '#F36D21',
    'SOLIDARIEDADE': '#F36F21',
    'PROS': '#FF7A00',
    'PATRIOTA': '#00695C',
    'PSC': '#006400',
    'REDE': '#009688',
    'PRTB': '#1D4ED8',
    'PTB': '#CC0000'
  }
  return map[s] || TEXT_COLOR_DARK
}

// Renderiza o nome do partido com estilo especial (PSD com letras coloridas)
const renderPartidoName = (p?: string) => {
  const s = (p || '').trim().toUpperCase()
  if (s === 'PSD') {
    return (
      <span className="font-bold tracking-tight" aria-label="PSD">
        <span style={{ color: PSD_BLUE }}>P</span>
        <span style={{ color: PSD_GREEN }}>S</span>
        <span style={{ color: PSD_YELLOW }}>D</span>
      </span>
    )
  }
  return <span style={{ color: partidoTextColor(p) }}>{p}</span>
}

interface Municipio {
  municipio: any
  id: string
  nome: string
  prefeito?: string
  partido?: string
  populacao?: number
  regiao?: string
}

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [filteredMunicipios, setFilteredMunicipios] = useState<Municipio[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { signOut, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchMunicipios()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = municipios.filter(municipio =>
        municipio.municipio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (municipio.prefeito && municipio.prefeito.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (municipio.partido && municipio.partido.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredMunicipios(filtered)
    } else {
      setFilteredMunicipios(municipios)
    }
  }, [searchTerm, municipios])

  // Adiciona log para depuração
  useEffect(() => {
    console.log('Municípios carregados:', municipios)
  }, [municipios])

  const fetchMunicipios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('municipios')
        .select('*')
        .order('municipio')

      if (error) {
        console.error('Erro ao buscar municípios:', error)
        setError('Erro ao carregar municípios')
        return
      }

      setMunicipios(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      setError('Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PSD_BLUE }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Carregando municípios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PSD_BLUE }}>
        <div className="text-center">
          <div className="text-red-300 mb-4">
            <MapPin className="w-16 h-16 mx-auto mb-2" />
          </div>
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={fetchMunicipios}
            className="px-6 py-3 rounded-lg text-gray-800 font-bold"
            style={{ backgroundColor: PSD_YELLOW }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PSD_BLUE }}>
      {/* Header */}
      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white mb-0">
            Municípios da Bahia
          </h1>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={async () => {
                try {
                  await signOut()
                } finally {
                  router.push('/auth/login')
                }
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg text-gray-800 font-bold shadow-md hover:shadow-lg transition-shadow"
              style={{ backgroundColor: PSD_YELLOW }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
            {profile?.access_level === 4 || profile?.permissions?.is_admin ? (
              <button
                onClick={() => router.push('/admin/users')}
                className="inline-flex items-center px-4 py-2 rounded-lg text-gray-800 font-bold shadow-md hover:shadow-lg transition-shadow"
                style={{ backgroundColor: PSD_YELLOW }}
              >
                Administração
              </button>
            ) : null}
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar município, prefeito ou partido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {filteredMunicipios.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-white opacity-50 mx-auto mb-4" />
            <p className="text-white text-lg">
              {searchTerm ? 'Nenhum município encontrado' : 'Nenhum município cadastrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {filteredMunicipios.map((municipio) => (
              <Link
                key={municipio.id}
                href={`/municipio/${municipio.id}`}
                className="block"
              >
                <div 
                  className="p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: CARD_BG_COLOR }}
                >
                  <div className="flex flex-col">
                    <h3
                      className="text-xl font-bold text-blue-700"
                      style={{ color: PSD_BLUE }}
                    >
                      {municipio.municipio ? municipio.municipio : '(Sem nome)'}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-base text-gray-800">
                        Prefeito: {municipio.prefeito ? municipio.prefeito : 'N/A'}
                      </span>
                      {municipio.partido && (
                        <span className="text-base font-bold text-gray-800">
                          Partido: {renderPartidoName(municipio.partido)}
                        </span>
                      )}
                    </div>
                    {municipio.populacao && (
                      <div className="mt-1 text-sm text-gray-600">
                        População: {municipio.populacao.toLocaleString('pt-BR')}
                      </div>
                    )}
                    {municipio.regiao && (
                      <div className="mt-1 text-sm text-gray-600">
                        Região: {municipio.regiao}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}