'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Phone, 
  Calendar, 
  Users, 
  MapPin, 
  Instagram, 
  ExternalLink,
  Edit,
  Save,
  X,
  Plus,
  RefreshCw,
  ChevronLeft,
  Building,
  Award,
  DollarSign,
  FileText,
  ArrowLeft,
  Radio,
  Download
} from 'lucide-react';
import { generateMunicipioDocument } from '@/lib/documentGenerator';

// Cores do PSD (baseado no manual da marca, usar como referência)
const PSD_BLUE = '#0065BD' // Azul principal
const PSD_GREEN = '#6AB232' // Verde
const PSD_YELLOW = '#FFA300' // Amarelo
const TEXT_COLOR_LIGHT = '#333333'
const TEXT_COLOR_DARK = '#666666'
const CARD_BG_COLOR = '#FFFFFF'

// Interfaces
interface MunicipioDetalhado {
  id: string;
  municipio: string;
  populacao?: string;
  eleitores?: string;
  prefeito?: string;
  vice_prefeito?: string;
  presidente_camara?: string;
  partido?: string;
  votos_recebidos?: string;
  foto_prefeito?: string;
  aniversario?: string;
  status_eleicao?: string;
  porcentagem_votacao?: number;
  telefone?: string;
  data_emancipacao?: string;
  instagram_prefeitura?: string;
  instagram_prefeito?: string;
  deputado_estadual_mais_votado?: string;
  votos_deputado_estadual?: number | null;
  deputado_federal_mais_votado?: string;
  votos_deputado_federal?: number | null;
  lideranca?: string;
  banda_b?: string;
  presidente_camara_partido?: string;
  presidente_camara_votos_vereador?: string;
  vice_prefeito_partido?: string;
  vice_prefeito_dep_estadual?: string;
  vice_prefeito_votos_dep_estadual?: string;
  vice_prefeito_dep_federal?: string;
  vice_prefeito_votos_dep_federal?: string;
  vice_prefeito_telefone?: string;
  observacoes_deputado_estadual?: string;
  observacoes_deputado_federal?: string;
  observacoes_municipio?: string;
}

interface Vereador {
  id: string;
  municipio_id: string;
  nome?: string;
  partido?: string;
  votos_recebidos?: string;
  deputado_apoiado?: string;
  telefone?: string;
  observacoes?: string;
}

interface TransferenciaGovernamental {
  id: string;
  ministerio: string;
  acao: string;
  proposta: string;
  municipio: string;
  situacao_proposta: string;
  valor: number;
  convenio: string;
  empenho: string;
  valor_empenho: number;
  data_emissao: string;
}

interface CandidatoPrefeito {
  id: number;
  municipio: string;
  posicao: number; // 1, 2 ou 3
  nome: string;
  nome_completo?: string;
  numero?: number;
  partido?: string;
  votos: number;
  porcentagem: number;
  situacao?: string;
  created_at?: string;
  updated_at?: string;
}

interface DeputadoFederal {
  id: string;
  municipio_id: string;
  posicao: number;
  nome?: string;
  partido?: string;
  votos_recebidos?: number;
  observacoes?: string;
}

interface DeputadoEstadual {
  id: string;
  municipio_id: string;
  posicao: number;
  nome?: string;
  partido?: string;
  votos_recebidos?: number;
  observacoes?: string;
}

interface MidiaLocal {
  id: string;
  municipio_id: string;
  nome?: string;
  tipo?: string;
  contato?: string;
  observacoes?: string;
}

interface EstatisticasTransferencias {
  total_transferencias: number;
  valor_total: number;
  valor_total_empenhado: number;
  por_ministerio: { [key: string]: number };
  por_situacao: { [key: string]: number };
}

// Componente InfoCard
interface InfoCardProps {
  title: string;
  value: any;
  icon?: React.ReactNode;
  onPress?: () => void;
  onEditPress?: () => void;
  isEditable?: boolean;
  isLink?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  value, 
  icon, 
  onPress, 
  onEditPress, 
  isEditable = false, 
  isLink = false 
}) => {
  const handleClick = () => {
    if (isLink && value && typeof value === 'string') {
      if (value.includes('instagram.com')) {
        window.open(value.startsWith('http') ? value : `https://${value}`, '_blank');
      } else if (value.includes('@')) {
        window.open(`mailto:${value}`, '_blank');
      } else if (value.match(/^\d+$/)) {
        window.open(`tel:${value}`, '_blank');
      }
    } else if (onPress) {
      onPress();
    }
  };



  return (
    <div 
      className={`p-4 mb-3 rounded-lg shadow-sm hover:shadow-md transition-shadow relative ${
        isEditable ? 'border-2' : 'border'
      } ${onPress ? 'cursor-pointer' : ''}`}
      style={{ 
        backgroundColor: CARD_BG_COLOR,
        borderColor: isEditable ? PSD_BLUE : '#E5E7EB'
      }}
      onClick={handleClick}
    >
      <div className="flex items-center">
        {icon && (
          <div className="mr-4 w-8 text-center" style={{ color: PSD_BLUE }}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-1" style={{ color: TEXT_COLOR_DARK }}>
            {title}
          </h3>
          <p 
            className={`text-base font-semibold ${isLink ? 'underline' : ''}`}
            style={{ color: isLink ? PSD_BLUE : TEXT_COLOR_LIGHT }}
          >
            {value || 'Não informado'}
          </p>
        </div>
        {onPress && (
          <ExternalLink className="ml-2" size={16} style={{ color: TEXT_COLOR_DARK }} />
        )}
      </div>
      {isEditable && onEditPress && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditPress();
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity"
          style={{ backgroundColor: PSD_BLUE }}
        >
          <Edit size={12} />
        </button>
      )}
    </div>
  );
};

// Componente principal
export default function MunicipioDetalhes() {
  const params = useParams();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [municipio, setMunicipio] = useState<MunicipioDetalhado | null>(null);
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [deputadosFederais, setDeputadosFederais] = useState<DeputadoFederal[]>([]);
  const [deputadosEstaduais, setDeputadosEstaduais] = useState<DeputadoEstadual[]>([]);
  const [midiasLocais, setMidiasLocais] = useState<MidiaLocal[]>([]);
  const [candidatosPrefeito, setCandidatosPrefeito] = useState<CandidatoPrefeito[]>([]);
  const [transferencias, setTransferencias] = useState<TransferenciaGovernamental[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasTransferencias | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTransferencias, setLoadingTransferencias] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingDeputado, setEditingDeputado] = useState<{type: 'federal' | 'estadual' | 'vereador', id: string, field: string} | null>(null);
  const [editingDeputadoValue, setEditingDeputadoValue] = useState('');

  const municipioId = params.id as string;

  const renderEditDeputadoField = (deputado: any, field: string, label: string, type: 'federal' | 'estadual' | 'vereador') => {
    const isEditing = editingDeputado?.type === type && editingDeputado?.id === deputado.id && editingDeputado?.field === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="text"
            value={editingDeputadoValue}
            onChange={(e) => setEditingDeputadoValue(e.target.value)}
            className="flex-1 px-2 py-1 border rounded text-sm"
            placeholder={label}
            autoFocus
          />
          <button
            onClick={handleSaveDeputado}
            disabled={isSaving}
            className="bg-green-600 text-white rounded px-2 py-1 text-xs hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={12} />
          </button>
          <button
            onClick={() => {
              setEditingDeputado(null);
              setEditingDeputadoValue('');
            }}
            className="bg-gray-600 text-white rounded px-2 py-1 text-xs hover:bg-gray-700"
          >
            <X size={12} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-600">{label}: {deputado[field] || 'Não informado'}</span>
        <button
          onClick={() => handleEditDeputado(type, deputado.id, field, deputado[field] || '')}
          className="text-blue-600 hover:text-blue-800 ml-2"
        >
          <Edit size={12} />
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (municipioId) {
      fetchMunicipioDetalhes();
      fetchVereadores();
      fetchTransferencias();
    }
  }, [municipioId]);

  const fetchMunicipioDetalhes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('municipios')
        .select('*')
        .eq('id', municipioId)
        .single();

      if (error) throw error;
      setMunicipio(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do município:', error);
      setError('Erro ao carregar os dados do município');
    } finally {
      setLoading(false);
    }
  };

  const fetchVereadores = async () => {
    try {
      const { data, error } = await supabase
        .from('vereadores')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('nome');

      if (error) throw error;
      setVereadores(data || []);

      // Buscar deputados federais
      const { data: deputadosFederaisData, error: deputadosFederaisError } = await supabase
        .from('deputados_federais_mais_votados')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('posicao', { ascending: true });

      if (deputadosFederaisError) {
        console.error('Erro ao buscar deputados federais:', deputadosFederaisError);
      } else {
        setDeputadosFederais(deputadosFederaisData || []);
      }

      // Buscar deputados estaduais
      const { data: deputadosEstaduaisData, error: deputadosEstaduaisError } = await supabase
        .from('deputados_estaduais_mais_votados')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('posicao', { ascending: true });

      if (deputadosEstaduaisError) {
        console.error('Erro ao buscar deputados estaduais:', deputadosEstaduaisError);
      } else {
        setDeputadosEstaduais(deputadosEstaduaisData || []);
      }

      // Buscar mídias locais
      const { data: midiasData, error: midiasError } = await supabase
        .from('midias_locais')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('nome');

      if (midiasError) {
        console.error('Erro ao buscar mídias locais:', midiasError);
      } else {
        setMidiasLocais(midiasData || []);
      }

      // Buscar candidatos a prefeito
      const { data: candidatosData, error: candidatosError } = await supabase
        .from('candidatos_prefeito_ba_2024')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('votos', { ascending: false });
      
      if (candidatosError) {
        console.error('Erro ao buscar candidatos a prefeito:', candidatosError);
      } else {
        // Adicionar posição e porcentagem aos candidatos
        const totalVotos = (candidatosData || []).reduce((sum, c) => sum + (c.votos || 0), 0);
        const candidatosComPosicao = (candidatosData || []).map((candidato, index) => ({
          ...candidato,
          posicao: index + 1,
          porcentagem: totalVotos > 0 ? (candidato.votos / totalVotos) * 100 : 0
        }));
        setCandidatosPrefeito(candidatosComPosicao);
      }
    } catch (error) {
      console.error('Erro ao buscar vereadores:', error);
    }
  };

  const fetchTransferencias = async () => {
    try {
      setLoadingTransferencias(true);
      
      // Primeiro buscar o nome do município
      const { data: municipioData, error: municipioError } = await supabase
        .from('municipios')
        .select('municipio')
        .eq('id', municipioId)
        .single();

      if (municipioError) throw municipioError;
      
      // Buscar transferências
      const { data: transferenciasData, error: transferenciasError } = await supabase
        .from('transferencias_governamentais_test')
        .select('*')
        .ilike('municipio', `%${municipioData.municipio}%`)
        .order('data_emissao', { ascending: false });

      if (transferenciasError) throw transferenciasError;
      
      setTransferencias(transferenciasData || []);

      // Calcular estatísticas
      if (transferenciasData && transferenciasData.length > 0) {
        const stats: EstatisticasTransferencias = {
          total_transferencias: transferenciasData.length,
          valor_total: transferenciasData.reduce((sum, t) => sum + (t.valor || 0), 0),
          valor_total_empenhado: transferenciasData.reduce((sum, t) => sum + (t.valor_empenho || 0), 0),
          por_ministerio: {},
          por_situacao: {}
        };

        // Agrupar por ministério (valor total por ministério)
        transferenciasData.forEach(t => {
          const ministerio = t.ministerio || 'Não informado';
          stats.por_ministerio[ministerio] = (stats.por_ministerio[ministerio] || 0) + (t.valor || 0);
        });

        // Agrupar por situação (quantidade por situação)
        transferenciasData.forEach(t => {
          const situacao = t.situacao_proposta || 'Não informado';
          stats.por_situacao[situacao] = (stats.por_situacao[situacao] || 0) + 1;
        });

        setEstatisticas(stats);
      }
    } catch (error) {
      console.error('Erro ao buscar transferências:', error);
    } finally {
      setLoadingTransferencias(false);
    }
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveField = async () => {
    if (!editingField || !municipio) return;

    setIsSaving(true);
    try {
      let valueToSave: any = editValue;
      
      // Validação e conversão para campos numéricos
      if (editingField === 'populacao' || editingField === 'eleitores') {
        // Remove pontos de formatação e converte para número
        const cleanValue = editValue.replace(/\./g, '').replace(/\D/g, '');
        const numericValue = parseInt(cleanValue);
        if (isNaN(numericValue) || numericValue < 0) {
          alert('Por favor, insira um número válido.');
          setIsSaving(false);
          return;
        }
        valueToSave = numericValue;
      }

      // Validação para campos de texto
      if (editingField === 'nome_prefeito') {
        if (editValue.trim().length < 2) {
          alert('O nome do prefeito deve ter pelo menos 2 caracteres.');
          setIsSaving(false);
          return;
        }
        valueToSave = editValue.trim();
      }

      // Atualizar no Supabase
      const { error } = await supabase
        .from('municipios')
        .update({ [editingField]: valueToSave })
        .eq('id', municipio.id);

      if (error) throw error;

      // Atualizar estado local
      setMunicipio(prev => prev ? { ...prev, [editingField]: valueToSave } : null);
      
      // Fechar modal
      setEditingField(null);
      setEditValue('');
      
      // Mensagem de sucesso personalizada
      const fieldNames: { [key: string]: string } = {
        'populacao': 'População',
        'eleitores': 'Número de Eleitores',
        'data_emancipacao': 'Data de Emancipação',
        'data_aniversario': 'Data de Aniversário',
        'nome_prefeito': 'Nome do Prefeito',
        'vice_prefeito': 'Vice-Prefeito',
        'presidente_camara': 'Presidente da Câmara',
        'presidente_camara_partido': 'Partido do Presidente da Câmara',
        'observacoes_municipio': 'Observações do Município',
        'lideranca': 'Liderança',
        'banda_b': 'Banda B'
      };
      
      const fieldName = fieldNames[editingField] || 'Campo';
      alert(`${fieldName} atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar campo:', error);
      alert('Erro ao atualizar campo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!municipio) return;

    try {
      // Transform candidatos to ensure partido is never undefined
      const candidatosFormatados = candidatosPrefeito.map(candidato => ({
        nome: candidato.nome,
        partido: candidato.partido || 'Não informado',
        votos: candidato.votos,
        porcentagem: candidato.porcentagem,
        posicao: candidato.posicao
      }));

      const documentData = {
        municipio: municipio.municipio,
        prefeito: municipio.prefeito,
        partido: municipio.partido,
        votos_recebidos: municipio.votos_recebidos,
        porcentagem_votacao: municipio.porcentagem_votacao,
        foto_prefeito: municipio.foto_prefeito,
        instagram_prefeito: municipio.instagram_prefeito,
        instagram_prefeitura: municipio.instagram_prefeitura,
        candidatos: candidatosFormatados,
        transferencias: estatisticas || undefined
      };

      const success = await generateMunicipioDocument(documentData);
      
      if (success) {
        alert('Documento gerado com sucesso!');
      } else {
        alert('Erro ao gerar documento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      alert('Erro ao gerar documento. Tente novamente.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao.toLowerCase()) {
      case 'empenhado':
      case 'pago':
        return 'bg-green-500';
      case 'em andamento':
      case 'aprovado':
        return 'bg-blue-500';
      case 'cancelado':
      case 'rejeitado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleEditDeputado = (type: 'federal' | 'estadual' | 'vereador', id: string, field: string, currentValue: string) => {
    setEditingDeputado({ type, id, field });
    setEditingDeputadoValue(currentValue);
  };

  const handleSaveDeputado = async () => {
    if (!editingDeputado) return;

    setIsSaving(true);
    try {
      let tableName = '';
      switch (editingDeputado.type) {
        case 'federal':
          tableName = 'deputados_federais_mais_votados';
          break;
        case 'estadual':
          tableName = 'deputados_estaduais_mais_votados';
          break;
        case 'vereador':
          tableName = 'vereadores';
          break;
      }

      let valueToSave: any = editingDeputadoValue;
      
      // Conversão para campos numéricos
      if (editingDeputado.field === 'votos_recebidos') {
        const numericValue = parseInt(editingDeputadoValue.replace(/\D/g, ''));
        if (isNaN(numericValue) || numericValue < 0) {
          alert('Por favor, insira um número válido para os votos.');
          return;
        }
        valueToSave = numericValue;
      }

      const { error } = await supabase
        .from(tableName)
        .update({ [editingDeputado.field]: valueToSave })
        .eq('id', editingDeputado.id);

      if (error) throw error;

      // Atualizar o estado local
      if (editingDeputado.type === 'federal') {
        setDeputadosFederais(prev => prev.map(dep => 
          dep.id === editingDeputado.id 
            ? { ...dep, [editingDeputado.field]: valueToSave }
            : dep
        ));
      } else if (editingDeputado.type === 'estadual') {
        setDeputadosEstaduais(prev => prev.map(dep => 
          dep.id === editingDeputado.id 
            ? { ...dep, [editingDeputado.field]: valueToSave }
            : dep
        ));
      } else if (editingDeputado.type === 'vereador') {
        setVereadores(prev => prev.map(ver => 
          ver.id === editingDeputado.id 
            ? { ...ver, [editingDeputado.field]: valueToSave }
            : ver
        ));
      }

      setEditingDeputado(null);
      setEditingDeputadoValue('');
      
      const fieldNames: { [key: string]: string } = {
        'nome': 'Nome',
        'partido': 'Partido',
        'votos_recebidos': 'Votos Recebidos',
        'observacoes': 'Observações',
        'telefone': 'Telefone',
        'deputado_apoiado': 'Deputado Apoiado'
      };
      
      const fieldName = fieldNames[editingDeputado.field] || 'Campo';
      alert(`${fieldName} atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar deputado:', error);
      alert('Erro ao atualizar deputado. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PSD_BLUE }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando detalhes do município...</p>
        </div>
      </div>
    );
  }

  if (error || !municipio) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PSD_BLUE }}>
        <div className="text-center">
          <p className="text-white mb-4">{error || 'Município não encontrado'}</p>
          <button
            onClick={() => router.push('/municipios')}
            className="px-6 py-3 rounded-lg text-gray-800 font-bold"
            style={{ backgroundColor: PSD_YELLOW }}
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PSD_BLUE }}>
      {/* Header */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/municipios')}
            className="flex items-center text-white hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            <span className="text-lg">Voltar</span>
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          {municipio.municipio}
        </h1>
      </div>

      <div className="px-4 pb-6">
        {/* Foto do Prefeito */}
        {municipio.foto_prefeito && (
          <div className="text-center mb-6">
            <div 
              className="inline-block p-2 rounded-full"
              style={{ backgroundColor: PSD_YELLOW }}
            >
              <img
                src={municipio.foto_prefeito}
                alt={`Foto de ${municipio.prefeito}`}
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              title="População"
              value={municipio.populacao}
              icon={<Users />}
              isEditable={true}
              onEditPress={() => handleEditField('populacao', municipio.populacao || '')}
            />
            <InfoCard
              title="Eleitores"
              value={municipio.eleitores}
              icon={<Users />}
              isEditable={true}
              onEditPress={() => handleEditField('eleitores', municipio.eleitores || '')}
            />
            <InfoCard
              title="Data de Emancipação"
              value={municipio.data_emancipacao}
              icon={<Calendar />}
              isEditable={true}
              onEditPress={() => handleEditField('data_emancipacao', municipio.data_emancipacao || '')}
            />
            <InfoCard
              title="Aniversário"
              value={municipio.aniversario}
              icon={<Calendar />}
              isEditable={true}
              onEditPress={() => handleEditField('aniversario', municipio.aniversario || '')}
            />
          </div>
          
          {/* Observações do Município */}
          {municipio.observacoes_municipio && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Observações do Município</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{municipio.observacoes_municipio}</p>
              <button 
                onClick={() => handleEditField('observacoes_municipio', municipio.observacoes_municipio || '')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Editar observações
              </button>
            </div>
          )}
          
          {!municipio.observacoes_municipio && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Nenhuma observação cadastrada</p>
                <button 
                  onClick={() => handleEditField('observacoes_municipio', '')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Adicionar observações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Informações do Prefeito */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Prefeito</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              title="Nome"
              value={municipio.prefeito}
              icon={<User />}
              isEditable={true}
              onEditPress={() => handleEditField('prefeito', municipio.prefeito || '')}
            />
            <InfoCard
              title="Vice-Prefeito"
              value={municipio.vice_prefeito}
              icon={<User />}
              isEditable={true}
              onEditPress={() => handleEditField('vice_prefeito', municipio.vice_prefeito || '')}
            />
            <InfoCard
              title="Partido"
              value={municipio.partido}
              icon={<Building />}
              isEditable={true}
              onEditPress={() => handleEditField('partido', municipio.partido || '')}
            />
            <InfoCard
              title="Votos Recebidos"
              value={municipio.votos_recebidos}
              icon={<Award />}
              isEditable={true}
              onEditPress={() => handleEditField('votos_recebidos', municipio.votos_recebidos || '')}
            />
            <InfoCard
              title="Telefone"
              value={municipio.telefone}
              icon={<Phone />}
              isLink={true}
              isEditable={true}
              onEditPress={() => handleEditField('telefone', municipio.telefone || '')}
            />
            <InfoCard
              title="Instagram do Prefeito"
              value={municipio.instagram_prefeito}
              icon={<Instagram />}
              isEditable={true}
              isLink={true}
              onEditPress={() => handleEditField('instagram_prefeito', municipio.instagram_prefeito || '')}
            />
            <InfoCard
              title="Instagram da Prefeitura"
              value={municipio.instagram_prefeitura}
              icon={<Instagram />}
              isEditable={true}
              isLink={true}
              onEditPress={() => handleEditField('instagram_prefeitura', municipio.instagram_prefeitura || '')}
            />
            <InfoCard
              title="Liderança"
              value={municipio.lideranca}
              icon={<User />}
              isEditable={true}
              onEditPress={() => handleEditField('lideranca', municipio.lideranca || '')}
            />
            <InfoCard
              title="Banda B"
              value={municipio.banda_b}
              icon={<Radio />}
              isEditable={true}
              onEditPress={() => handleEditField('banda_b', municipio.banda_b || '')}
            />
          </div>
        </div>

        {/* Candidatos a Prefeito - Eleições 2024 */}
        {candidatosPrefeito.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Eleições 2024 - Candidatos a Prefeito</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidatosPrefeito.filter(c => c.posicao === 1).map(candidato => (
                <div key={candidato.id} className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-4 text-white">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🏆</span>
                    <h3 className="font-bold text-lg">1º Colocado (Eleito)</h3>
                  </div>
                  <p className="font-semibold text-lg">{candidato.nome}</p>
                  <p className="text-sm opacity-90">{candidato.partido}</p>
                  <p className="text-sm font-medium mt-2">
                    {candidato.votos.toLocaleString('pt-BR')} votos ({candidato.porcentagem.toFixed(2)}%)
                  </p>
                </div>
              ))}
              
              {candidatosPrefeito.filter(c => c.posicao === 2).map(candidato => (
                <div key={candidato.id} className="bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg p-4 text-white">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🥈</span>
                    <h3 className="font-bold text-lg">2º Colocado</h3>
                  </div>
                  <p className="font-semibold text-lg">{candidato.nome}</p>
                  <p className="text-sm opacity-90">{candidato.partido}</p>
                  <p className="text-sm font-medium mt-2">
                    {candidato.votos.toLocaleString('pt-BR')} votos ({candidato.porcentagem.toFixed(2)}%)
                  </p>
                </div>
              ))}
              
              {candidatosPrefeito.filter(c => c.posicao === 3).map(candidato => (
                <div key={candidato.id} className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-4 text-white">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🥉</span>
                    <h3 className="font-bold text-lg">3º Colocado</h3>
                  </div>
                  <p className="font-semibold text-lg">{candidato.nome}</p>
                  <p className="text-sm opacity-90">{candidato.partido}</p>
                  <p className="text-sm font-medium mt-2">
                    {candidato.votos.toLocaleString('pt-BR')} votos ({candidato.porcentagem.toFixed(2)}%)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transferências Governamentais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-psd-blue">Transferências Governamentais</h2>
            <button
              onClick={fetchTransferencias}
              className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
              disabled={loadingTransferencias}
            >
              <RefreshCw size={20} className={`text-psd-blue ${loadingTransferencias ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingTransferencias ? (
            <div className="flex items-center justify-center py-8 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-psd-blue mr-3"></div>
              <span className="text-gray-600">Carregando transferências...</span>
            </div>
          ) : (
            <>
              {/* Estatísticas */}
              {estatisticas && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-psd-blue mb-4 text-center">Resumo</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-psd-blue">{estatisticas.total_transferencias}</div>
                      <div className="text-sm text-gray-600">Total de Transferências</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-psd-blue">{formatCurrency(estatisticas.valor_total)}</div>
                      <div className="text-sm text-gray-600">Valor Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-psd-blue">{formatCurrency(estatisticas.valor_total_empenhado)}</div>
                      <div className="text-sm text-gray-600">Total Empenhado</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-psd-blue">{Object.keys(estatisticas.por_ministerio).length}</div>
                      <div className="text-sm text-gray-600">Ministérios</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Transferências */}
              {transferencias.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transferencias.map((transferencia) => (
                    <div key={transferencia.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-psd-blue flex-1 mr-3">{transferencia.ministerio}</h4>
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-bold ${getSituacaoColor(transferencia.situacao_proposta)}`}>
                          {transferencia.situacao_proposta}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{transferencia.acao}</p>
                      <p className="text-sm text-gray-600 mb-3">{transferencia.proposta}</p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-gray-500">Valor:</span>
                          <div className="font-bold text-green-600">{formatCurrency(transferencia.valor)}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Empenhado:</span>
                          <div className="font-bold text-green-600">{formatCurrency(transferencia.valor_empenho)}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Convênio: {transferencia.convenio}</p>
                        <p>Empenho: {transferencia.empenho}</p>
                        <p>Data: {new Date(transferencia.data_emissao).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-100 rounded-lg">
                  <DollarSign size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Nenhuma transferência encontrada</p>
                  <p className="text-sm text-gray-500 italic">Os dados podem não estar disponíveis para este município</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Deputados Federais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Top 5 Deputados Federais Mais Votados</h2>
          {deputadosFederais.length > 0 ? (
            <div className="space-y-3">
              {deputadosFederais.map((deputado) => (
                <div key={deputado.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center flex-1">
                      <span className="bg-psd-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {deputado.posicao}º
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{deputado.nome || 'Nome não informado'}</h4>
                          <button
                            onClick={() => handleEditDeputado('federal', deputado.id, 'nome', deputado.nome || '')}
                            className="text-blue-600 hover:text-blue-800 ml-2"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                        {renderEditDeputadoField(deputado, 'nome', 'Nome', 'federal')}
                        {renderEditDeputadoField(deputado, 'partido', 'Partido', 'federal')}
                        {renderEditDeputadoField(deputado, 'votos_recebidos', 'Votos Recebidos', 'federal')}
                      </div>
                    </div>
                  </div>
                  {deputado.observacoes && (
                    <div className="mt-2 ml-11">
                      <p className="text-xs text-gray-500 italic">{deputado.observacoes}</p>
                    </div>
                  )}
                  <div className="ml-11">
                    {renderEditDeputadoField(deputado, 'observacoes', 'Observações', 'federal')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <Building size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhum deputado federal cadastrado</p>
              <p className="text-sm text-gray-500 italic">Clique no botão + para adicionar deputados federais</p>
            </div>
          )}
        </div>

        {/* Deputados Estaduais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Top 5 Deputados Estaduais Mais Votados</h2>
          {deputadosEstaduais.length > 0 ? (
            <div className="space-y-3">
              {deputadosEstaduais.map((deputado) => (
                <div key={deputado.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center flex-1">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {deputado.posicao}º
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{deputado.nome || 'Nome não informado'}</h4>
                          <button
                            onClick={() => handleEditDeputado('estadual', deputado.id, 'nome', deputado.nome || '')}
                            className="text-green-600 hover:text-green-800 ml-2"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                        {renderEditDeputadoField(deputado, 'nome', 'Nome', 'estadual')}
                        {renderEditDeputadoField(deputado, 'partido', 'Partido', 'estadual')}
                        {renderEditDeputadoField(deputado, 'votos_recebidos', 'Votos Recebidos', 'estadual')}
                      </div>
                    </div>
                  </div>
                  {deputado.observacoes && (
                    <div className="mt-2 ml-11">
                      <p className="text-xs text-gray-500 italic">{deputado.observacoes}</p>
                    </div>
                  )}
                  <div className="ml-11">
                    {renderEditDeputadoField(deputado, 'observacoes', 'Observações', 'estadual')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <Building size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhum deputado estadual cadastrado</p>
              <p className="text-sm text-gray-500 italic">Clique no botão + para adicionar deputados estaduais</p>
            </div>
          )}
        </div>

        {/* Mídias Locais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Mídias Locais</h2>
          {midiasLocais.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {midiasLocais.map((midia) => (
                <div key={midia.id} className="border rounded-lg p-3 flex justify-between items-center bg-purple-50">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{midia.nome || 'Nome não informado'}</h4>
                    <p className="text-sm text-gray-600">{midia.tipo || 'Tipo não informado'}</p>
                    {midia.contato && (
                      <p className="text-xs text-gray-500">Contato: {midia.contato}</p>
                    )}
                    {midia.observacoes && (
                      <p className="text-xs text-gray-500 italic mt-1">{midia.observacoes}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => alert('Funcionalidade de edição de mídias em desenvolvimento')}
                    className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-purple-700"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <Radio size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhuma mídia local cadastrada</p>
              <p className="text-sm text-gray-500 italic">Clique no botão + para adicionar rádios e blogs</p>
            </div>
          )}
        </div>

        {/* Vereadores */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-psd-blue">Vereadores</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{vereadores.length} vereador(es) cadastrado(s)</span>
              <button 
                onClick={() => alert('Funcionalidade de adicionar vereadores em desenvolvimento.\n\nEm breve você poderá:\n• Adicionar novos vereadores\n• Definir partido e votos\n• Adicionar informações de contato\n• Incluir observações')}
                className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-700"
              >
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          </div>
          
          {/* Presidente da Câmara */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Presidente da Câmara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                title="Nome"
                value={municipio.presidente_camara}
                icon={<User />}
                isEditable={true}
                onEditPress={() => handleEditField('presidente_camara', municipio.presidente_camara || '')}
            />
            <InfoCard
              title="Partido do Presidente da Câmara"
              value={municipio.presidente_camara_partido}
              icon={<Building />}
              isEditable={true}
              onEditPress={() => handleEditField('presidente_camara_partido', municipio.presidente_camara_partido || '')}
              />
            </div>
          </div>
          {vereadores.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vereadores.map((vereador) => (
                <div key={vereador.id} className="border rounded-lg p-4 bg-yellow-50">
                  <h4 className="font-bold text-gray-900 mb-2">{vereador.nome || 'Nome não informado'}</h4>
                  <div className="space-y-2">
                    {renderEditDeputadoField(vereador, 'nome', 'Nome', 'vereador')}
                    {renderEditDeputadoField(vereador, 'partido', 'Partido', 'vereador')}
                    {renderEditDeputadoField(vereador, 'votos_recebidos', 'Votos Recebidos', 'vereador')}
                    {renderEditDeputadoField(vereador, 'deputado_apoiado', 'Deputado Apoiado', 'vereador')}
                    {renderEditDeputadoField(vereador, 'telefone', 'Telefone', 'vereador')}
                    {renderEditDeputadoField(vereador, 'observacoes', 'Observações', 'vereador')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <Users size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhum vereador cadastrado</p>
              <p className="text-sm text-gray-500 italic">Clique no botão + para adicionar vereadores</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-psd-blue mb-4">
              Editar {editingField === 'populacao' ? 'População' : 
                     editingField === 'eleitores' ? 'Eleitores' :
                     editingField === 'data_emancipacao' ? 'Data de Emancipação' :
                     editingField === 'data_aniversario' ? 'Data de Aniversário' :
                     editingField === 'nome_prefeito' ? 'Nome do Prefeito' :
                     'Campo'}
            </h3>
            {editingField === 'populacao' || editingField === 'eleitores' ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => {
                  // Permitir apenas números e formatar
                  const value = e.target.value.replace(/\D/g, '');
                  const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                  setEditValue(formattedValue);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                placeholder={editingField === 'populacao' ? 'Ex: 50000' : 'Ex: 35000'}
              />
            ) : (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 min-h-[100px]"
                placeholder={editingField === 'data_emancipacao' ? 'Ex: 1962-07-11' :
                           editingField === 'data_aniversario' ? 'Ex: 11 de julho' :
                           editingField === 'nome_prefeito' ? 'Ex: João Silva' :
                           'Digite o novo valor...'}
              />
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingField(null);
                  setEditValue('');
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveField}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Download */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT_COLOR_LIGHT }}>
            Exportar Dados do Município
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Baixe um documento Word com as principais informações do município, incluindo dados do prefeito, votação e recursos governamentais.
          </p>
          <button
            onClick={handleDownloadDocument}
            className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: PSD_BLUE }}
          >
            <Download size={20} className="mr-2" />
            Baixar Documento Word
          </button>
        </div>
      </div>
    </div>
  );
}