'use client'

import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, MapPin, User, Users, Loader2 } from 'lucide-react'

// Cores do PSD (baseado no manual da marca, usar como referência)
const PSD_BLUE = '#0065BD' // Azul principal
const PSD_GREEN = '#6AB232' // Verde
const PSD_YELLOW = '#FFA300' // Amarelo
const TEXT_COLOR_LIGHT = '#333333'
const TEXT_COLOR_DARK = '#666666'
const CARD_BG_COLOR = '#FFFFFF'

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
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Municípios da Bahia
        </h1>

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
                          Partido: {municipio.partido}
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