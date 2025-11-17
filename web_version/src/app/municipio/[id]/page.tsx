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
// Listas de órgãos para seleção nas Emendas/Programas
const SECRETARIAS_ESTADUAIS = [
  { sigla: 'SESAB', nome: 'Secretaria da Saúde do Estado da Bahia', area: 'Saúde' },
  { sigla: 'SEC', nome: 'Secretaria da Educação do Estado da Bahia', area: 'Educação' },
  { sigla: 'SEINFRA', nome: 'Secretaria de Infraestrutura da Bahia', area: 'Obras, estradas, energia' },
  { sigla: 'SEDUR', nome: 'Secretaria de Desenvolvimento Urbano', area: 'Habitação, saneamento, urbanismo' },
  { sigla: 'SEPLAN', nome: 'Secretaria do Planejamento', area: 'Planejamento e orçamento' },
  { sigla: 'CAR', nome: 'Companhia de Desenvolvimento e Ação Regional', area: 'Agricultura familiar, desenvolvimento rural' },
  { sigla: 'SUDESB', nome: 'Superintendência dos Desportos do Estado da Bahia', area: 'Esporte e lazer' },
  { sigla: 'SETRE', nome: 'Secretaria do Trabalho, Emprego, Renda e Esporte', area: 'Emprego e capacitação' },
  { sigla: 'SDR', nome: 'Secretaria de Desenvolvimento Rural', area: 'Agricultura e economia rural' },
  { sigla: 'SEMA', nome: 'Secretaria do Meio Ambiente', area: 'Meio ambiente e recursos hídricos' },
  { sigla: 'SECTI', nome: 'Secretaria de Ciência, Tecnologia e Inovação', area: 'Tecnologia e inovação' },
  { sigla: 'SDE', nome: 'Secretaria de Desenvolvimento Econômico', area: 'Indústria, comércio e energia' },
  { sigla: 'SJDHDS', nome: 'Secretaria de Justiça, Direitos Humanos e Desenvolvimento Social', area: 'Assistência social' },
  { sigla: 'SAEB', nome: 'Secretaria da Administração do Estado da Bahia', area: 'Gestão pública' },
  { sigla: 'SECULT', nome: 'Secretaria de Cultura', area: 'Cultura e patrimônio' },
  { sigla: 'SERIN', nome: 'Secretaria de Relações Institucionais', area: 'Relação com municípios e parlamento' }
];

const MINISTERIOS_FEDERAIS = [
  { sigla: 'MS', nome: 'Ministério da Saúde', area: 'Saúde' },
  { sigla: 'MEC', nome: 'Ministério da Educação', area: 'Escolas, creches, universidades' },
  { sigla: 'MDR', nome: 'Ministério do Desenvolvimento Regional', area: 'Obras, infraestrutura, saneamento' },
  { sigla: 'MAPA', nome: 'Ministério da Agricultura, Pecuária e Abastecimento', area: 'Agricultura, agroindústria' },
  { sigla: 'MDS', nome: 'Ministério do Desenvolvimento e Assistência Social', area: 'Assistência social' },
  { sigla: 'MTur', nome: 'Ministério do Turismo', area: 'Turismo, eventos, obras turísticas' },
  { sigla: 'ME', nome: 'Ministério da Economia / Fazenda', area: 'Repasses e controle orçamentário' },
  { sigla: 'MMA', nome: 'Ministério do Meio Ambiente', area: 'Sustentabilidade e recursos naturais' },
  { sigla: 'MinC', nome: 'Ministério da Cultura', area: 'Projetos culturais' },
  { sigla: 'MCom', nome: 'Ministério das Comunicações', area: 'Internet, TV, conectividade' },
  { sigla: 'MInfra', nome: 'Ministério da Infraestrutura', area: 'Estradas, transportes' },
  { sigla: 'MJSP', nome: 'Ministério da Justiça e Segurança Pública', area: 'Segurança pública' },
  { sigla: 'MPO', nome: 'Ministério do Planejamento e Orçamento', area: 'Planejamento federal' }
];

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
  familia_prefeito?: string;
  primeira_dama?: string;
  filhos_prefeito?: string;
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
    url?: string;
    observacoes?: string;
  }

  // Família do Prefeito: itens individuais (ex.: primeira-dama, filho)
  interface FamiliaMembro {
    id: string;
    municipio_id: string;
    tipo?: string; // 'primeira_dama' | 'filho'
    nome?: string;
    observacoes?: string;
  }

  // Helper para mapear registros privados (dados_editaveis_nivel1) para FamiliaMembro
  const mapPrivadoParaFamilia = (row: any): FamiliaMembro => ({
    id: row.id,
    municipio_id: row.municipio_id,
    tipo: row.conteudo?.tipo || '',
    nome: row.conteudo?.nome || '',
    observacoes: row.conteudo?.observacoes || ''
  });

  const mapPrivadoParaMidia = (row: any): MidiaLocal => ({
    id: row.id,
    municipio_id: row.municipio_id,
    nome: row.conteudo?.nome || '',
    tipo: row.conteudo?.tipo || '',
    url: row.conteudo?.url || '',
    observacoes: row.conteudo?.observacoes || ''
  });

  // Mapeamentos para dados privados de outras seções
  const mapPrivadoParaPrograma = (row: any): ProgramaEmenda => ({
    id: row.id,
    municipio_id: row.municipio_id,
    esfera: row.conteudo?.esfera === 'federal' ? 'federal' : 'estadual',
    parlamentar_tipo: row.conteudo?.parlamentar_tipo || null,
    parlamentar_nome: row.conteudo?.parlamentar_nome || null,
    orgao_sigla: row.conteudo?.orgao_sigla || null,
    orgao_nome: row.conteudo?.orgao_nome || null,
    area: row.conteudo?.area || null,
    observacoes: row.conteudo?.observacoes || null
  });

  const mapPrivadoParaLideranca = (row: any): LiderancaPessoa => ({
    id: row.id,
    municipio_id: row.municipio_id,
    nome: row.conteudo?.nome || '',
    partido: row.conteudo?.partido || '',
    votos_recebidos: row.conteudo?.votos_recebidos ?? undefined,
    historico: row.conteudo?.historico || undefined,
    observacoes: row.conteudo?.observacoes || ''
  });

  const mapPrivadoParaBandaBLocal = (row: any): BandaBLocal => ({
    id: row.id,
    municipio_id: row.municipio_id,
    nome: row.conteudo?.nome || '',
    partido: row.conteudo?.partido || '',
    votos_recebidos: row.conteudo?.votos_recebidos ?? undefined,
    historico: row.conteudo?.historico || undefined,
    observacoes: row.conteudo?.observacoes || ''
  });

  const mapPrivadoParaBandaBPolitico = (row: any): BandaBPolitico => ({
    id: row.id,
    municipio_id: row.municipio_id,
    nome: row.conteudo?.nome || '',
    esfera: row.conteudo?.esfera === 'estadual' ? 'estadual' : 'federal',
    partido: row.conteudo?.partido || '',
    votos_recebidos: row.conteudo?.votos_recebidos ?? undefined,
    historico: row.conteudo?.historico || undefined,
    observacoes: row.conteudo?.observacoes || ''
  });

// Programas/Emendas: itens com parlamentar e órgão
  interface ProgramaEmenda {
    id: string;
    municipio_id: string;
    esfera: 'estadual' | 'federal';
    parlamentar_tipo?: 'deputado_federal' | 'deputado_estadual' | 'senador' | null;
    parlamentar_nome?: string | null;
    orgao_sigla?: string | null;
    orgao_nome?: string | null;
    area?: string | null;
    observacoes?: string | null;
  }

// Lideranças locais relevantes para o município
interface LiderancaPessoa {
  id: string;
  municipio_id: string;
  nome?: string;
  partido?: string;
  votos_recebidos?: number;
  historico?: 'prefeito' | 'candidato_perdeu' | 'vereador' | 'vice' | 'vice_atual';
  observacoes?: string;
}

// Políticos da "Banda B" (deputados federais ou estaduais)
interface BandaBPolitico {
  id: string;
  municipio_id: string;
  nome?: string;
  esfera: 'federal' | 'estadual';
  partido?: string;
  votos_recebidos?: number;
  historico?: 'prefeito' | 'candidato_perdeu' | 'vereador' | 'vice' | 'vice_atual';
  observacoes?: string;
}
interface BandaBLocal {
  id: string;
  municipio_id: string;
  nome?: string;
  partido?: string;
  votos_recebidos?: number;
  historico?: 'prefeito' | 'candidato_perdeu' | 'vereador' | 'vice' | 'vice_atual';
  observacoes?: string;
}
interface VicePrefeitoItem {
  id: string;
  municipio_id: string;
  nome?: string;
  partido?: string;
  telefone?: string;
  historico?: 'prefeito' | 'candidato_perdeu' | 'vereador' | 'vice' | 'vice_atual' | 'lideranca' | 'outros';
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
      const lowerTitle = (title || '').toLowerCase();
      const v = value.trim();
      const isInstagram = lowerTitle.includes('instagram') || v.includes('instagram.com') || v.startsWith('@');
      if (isInstagram) {
        const link = v.includes('instagram.com')
          ? (v.startsWith('http') ? v : `https://${v}`)
          : `https://instagram.com/${v.replace(/^@/, '')}`;
        window.open(link, '_blank');
        return;
      }
      if (v.includes('@')) {
        window.open(`mailto:${v}`, '_blank');
        return;
      }
      if (v.match(/^\d+$/)) {
        window.open(`tel:${v}`, '_blank');
        return;
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
            className={`font-semibold ${isLink ? 'underline' : ''} ${typeof value === 'string' && value.length > 36 ? 'text-sm' : 'text-base'} break-words whitespace-normal leading-snug`}
            style={{ color: isLink ? PSD_BLUE : TEXT_COLOR_LIGHT, wordBreak: 'break-word', overflowWrap: 'anywhere' }}
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
  const { user, signOut, profile } = useAuth();
  const [municipio, setMunicipio] = useState<MunicipioDetalhado | null>(null);
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [deputadosFederais, setDeputadosFederais] = useState<DeputadoFederal[]>([]);
  const [deputadosEstaduais, setDeputadosEstaduais] = useState<DeputadoEstadual[]>([]);
  const [midiasLocais, setMidiasLocais] = useState<MidiaLocal[]>([]);
  const [familiaLista, setFamiliaLista] = useState<FamiliaMembro[]>([]);
  const [editingFamiliaItemId, setEditingFamiliaItemId] = useState<string | null>(null);
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
  const [userNivel, setUserNivel] = useState<number>(profile?.access_level ?? 1);
  useEffect(() => {
    if (profile && typeof profile.access_level === 'number') {
      setUserNivel(profile.access_level)
    }
  }, [profile])
  // Form state for editing Presidente da Câmara as a grouped area
  const [presidenteForm, setPresidenteForm] = useState<{ nome: string; partido: string; votos: string }>(
    { nome: '', partido: '', votos: '' }
  );
  // Form state para Família do Prefeito (agrupado)
  const [familiaForm, setFamiliaForm] = useState<{ primeira_dama: string; filhos_prefeito: string }>({
    primeira_dama: '',
    filhos_prefeito: ''
  });
  const [vicePrefeitos, setVicePrefeitos] = useState<VicePrefeitoItem[]>([]);
  const [showAddViceModal, setShowAddViceModal] = useState(false);
  const [editingVice, setEditingVice] = useState<VicePrefeitoItem | null>(null);
  const [viceForm, setViceForm] = useState<Partial<VicePrefeitoItem>>({});
  // Modal state for editing a vereador (grouped editor)
  const [editingVereador, setEditingVereador] = useState<Vereador | null>(null);
  const [vereadorForm, setVereadorForm] = useState<{
    nome: string;
    partido: string;
    votos_recebidos: string;
    deputado_apoiado: string;
    telefone: string;
    observacoes: string;
  }>({ nome: '', partido: '', votos_recebidos: '', deputado_apoiado: '', telefone: '', observacoes: '' });

  const handleOpenVereadorModal = (vereador: Vereador) => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem editar.');
      return;
    }
    setEditingVereador(vereador);
    setVereadorForm({
      nome: vereador.nome || '',
      partido: vereador.partido || '',
      votos_recebidos: vereador.votos_recebidos || '',
      deputado_apoiado: vereador.deputado_apoiado || '',
      telefone: vereador.telefone || '',
      observacoes: vereador.observacoes || ''
    });
  };

  const handleSaveVereador = async () => {
    if (!editingVereador) return;
    setIsSaving(true);
    try {
      const updates: any = {
        nome: vereadorForm.nome || null,
        partido: vereadorForm.partido || null,
        votos_recebidos: vereadorForm.votos_recebidos || null,
        deputado_apoiado: vereadorForm.deputado_apoiado || null,
        telefone: vereadorForm.telefone || null,
        observacoes: vereadorForm.observacoes || null
      };

      const { error } = await supabase
        .from('vereadores')
        .update(updates)
        .eq('id', editingVereador.id);

      if (error) throw error;

      // Update local state
      setVereadores(prev => prev.map(v => v.id === editingVereador.id ? { ...v, ...updates } as Vereador : v));
      setEditingVereador(null);
      alert('Vereador atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar vereador:', err);
      alert('Erro ao atualizar vereador. Tente novamente.');
  } finally {
    setIsSaving(false);
  }
  };

  // Vereadores: excluir
  const handleDeleteVereador = async (id: string) => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem excluir.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este vereador?')) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('vereadores')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setVereadores(prev => prev.filter(v => v.id !== id));
      alert('Vereador excluído!');
    } catch (err) {
      console.error('Erro ao excluir vereador:', err);
      alert('Erro ao excluir vereador. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lideranças: abrir modal de adição
  const handleOpenAddLideranca = () => {
    setEditingLideranca(null);
    setLiderancaForm({});
    setShowAddLiderancaModal(true);
  };

  // Lideranças: abrir modal em modo edição
  const handleOpenEditLideranca = (item: LiderancaPessoa) => {
    setEditingLideranca(item);
    setLiderancaForm({
      nome: item.nome || undefined,
      partido: item.partido || undefined,
      votos_recebidos: item.votos_recebidos || undefined,
      historico: item.historico || undefined,
      observacoes: item.observacoes || undefined,
    });
    setShowAddLiderancaModal(true);
  };

  // Lideranças: salvar (inserir/atualizar)
  const handleSaveLideranca = async () => {
    if (!municipio) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const conteudo = {
          nome: liderancaForm.nome || null,
          partido: liderancaForm.partido || null,
          votos_recebidos: liderancaForm.votos_recebidos || null,
          historico: liderancaForm.historico || null,
          observacoes: liderancaForm.observacoes || null,
        };

        if (editingLideranca) {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .update({ titulo: 'lideranca', conteudo })
            .eq('id', editingLideranca.id)
            .eq('user_id', user.id)
            .select()
            .single();
          if (error) throw error;
          const mapped = mapPrivadoParaLideranca(data);
          setLiderancas(prev => prev.map(l => l.id === mapped.id ? mapped : l));
        } else {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .insert({
              user_id: user.id,
              municipio_id: municipio.id,
              categoria: 'liderancas',
              titulo: 'lideranca',
              conteudo
            })
            .select()
            .single();
          if (error) throw error;
          const mapped = mapPrivadoParaLideranca(data);
          setLiderancas(prev => [mapped, ...(prev || [])]);
        }
      } else {
        const payload: any = {
          municipio_id: municipio.id,
          nome: liderancaForm.nome || null,
          partido: liderancaForm.partido || null,
          votos_recebidos: liderancaForm.votos_recebidos || null,
          historico: liderancaForm.historico || null,
          observacoes: liderancaForm.observacoes || null,
        };

        if (editingLideranca) {
          const { error } = await supabase
            .from('liderancas')
            .update(payload)
            .eq('id', editingLideranca.id);
          if (error) throw error;
          setLiderancas(prev => prev.map(l => l.id === editingLideranca.id ? { ...l, ...payload } as LiderancaPessoa : l));
        } else {
          const { data, error } = await supabase
            .from('liderancas')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          setLiderancas(prev => [data as LiderancaPessoa, ...(prev || [])]);
        }
      }

      setShowAddLiderancaModal(false);
      setEditingLideranca(null);
      alert('Liderança salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar liderança:', err);
      alert('Erro ao salvar liderança. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lideranças: excluir
  const handleDeleteLideranca = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta liderança?')) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const { error } = await supabase
          .from('dados_editaveis_nivel1')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('liderancas')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setLiderancas(prev => prev.filter(l => l.id !== id));
      alert('Liderança excluída!');
    } catch (err) {
      console.error('Erro ao excluir liderança:', err);
      alert('Erro ao excluir liderança. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Banda B (Locais): abrir modal de adição
  const handleOpenAddBandaBLocal = () => {
    setEditingBandaBLocal(null);
    setBandaBLocalForm({});
    setShowAddBandaBLocalModal(true);
  };

  // Banda B (Locais): abrir modal em modo edição
  const handleOpenEditBandaBLocal = (item: BandaBLocal) => {
    setEditingBandaBLocal(item);
    setBandaBLocalForm({
      nome: item.nome || undefined,
      partido: item.partido || undefined,
      votos_recebidos: item.votos_recebidos || undefined,
      historico: item.historico || undefined,
      observacoes: item.observacoes || undefined,
    });
    setShowAddBandaBLocalModal(true);
  };

  // Banda B (Locais): salvar (inserir/atualizar)
  const handleSaveBandaBLocal = async () => {
    if (!municipio) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const conteudo = {
          nome: bandaBLocalForm.nome || null,
          partido: bandaBLocalForm.partido || null,
          votos_recebidos: bandaBLocalForm.votos_recebidos || null,
          historico: bandaBLocalForm.historico || null,
          observacoes: bandaBLocalForm.observacoes || null,
        };

        if (editingBandaBLocal) {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .update({ titulo: 'banda_b_local', conteudo })
            .eq('id', editingBandaBLocal.id)
            .eq('user_id', user.id)
            .select()
            .single();
          if (error) throw error;
          const mapped = mapPrivadoParaBandaBLocal(data);
          setBandaBLocais(prev => prev.map(b => b.id === mapped.id ? mapped : b));
        } else {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .insert({
              user_id: user.id,
              municipio_id: municipio.id,
              categoria: 'banda_b_local',
              titulo: 'banda_b_local',
              conteudo
            })
            .select()
            .single();
          if (error) throw error;
          const mapped = mapPrivadoParaBandaBLocal(data);
          setBandaBLocais(prev => [mapped, ...(prev || [])]);
        }
      } else {
        const payload: any = {
          municipio_id: municipio.id,
          nome: bandaBLocalForm.nome || null,
          partido: bandaBLocalForm.partido || null,
          votos_recebidos: bandaBLocalForm.votos_recebidos || null,
          historico: bandaBLocalForm.historico || null,
          observacoes: bandaBLocalForm.observacoes || null,
        };

        if (editingBandaBLocal) {
          const { error } = await supabase
            .from('banda_b')
            .update(payload)
            .eq('id', editingBandaBLocal.id);
          if (error) throw error;
          setBandaBLocais(prev => prev.map(b => b.id === editingBandaBLocal.id ? { ...b, ...payload } as BandaBLocal : b));
        } else {
          const { data, error } = await supabase
            .from('banda_b')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          setBandaBLocais(prev => [data as BandaBLocal, ...(prev || [])]);
        }
      }

      setShowAddBandaBLocalModal(false);
      setEditingBandaBLocal(null);
      alert('Banda B (Local) salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar Banda B (Local):', err);
      alert('Erro ao salvar Banda B. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Banda B (Locais): excluir
  const handleDeleteBandaBLocal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item da Banda B?')) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const { error } = await supabase
          .from('dados_editaveis_nivel1')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banda_b')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setBandaBLocais(prev => prev.filter(b => b.id !== id));
      alert('Item da Banda B excluído!');
    } catch (err) {
      console.error('Erro ao excluir Banda B (Local):', err);
      alert('Erro ao excluir Banda B. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Banda B: abrir modal de adição
  const handleOpenAddBandaB = () => {
    setEditingBandaB(null);
    setBandaBForm({ esfera: 'federal' });
    setShowAddBandaBModal(true);
  };

  // Banda B: abrir modal em modo edição
  const handleOpenEditBandaB = (item: BandaBPolitico) => {
    setEditingBandaB(item);
    setBandaBForm({
      nome: item.nome || undefined,
      esfera: item.esfera || 'federal',
      partido: item.partido || undefined,
      votos_recebidos: item.votos_recebidos || undefined,
      historico: item.historico || undefined,
      observacoes: item.observacoes || undefined,
    });
    setShowAddBandaBModal(true);
  };

  // Banda B: salvar (inserir/atualizar)
  const handleSaveBandaB = async () => {
    if (!municipio) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const conteudo = {
          nome: bandaBForm.nome || null,
          esfera: (bandaBForm.esfera as 'federal' | 'estadual') || 'federal',
          partido: bandaBForm.partido || null,
          votos_recebidos: bandaBForm.votos_recebidos || null,
          historico: bandaBForm.historico || null,
          observacoes: bandaBForm.observacoes || null,
        };

        if (editingBandaB) {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .update({ titulo: 'deputado_banda_b', conteudo })
            .eq('id', editingBandaB.id)
            .eq('user_id', user.id)
            .select()
            .single();
          if (error) throw error;
          const mapped = mapPrivadoParaBandaBPolitico(data);
          setBandaBPoliticos(prev => prev.map(b => b.id === mapped.id ? mapped : b));
        } else {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .insert({
              user_id: user.id,
              municipio_id: municipio.id,
              categoria: 'banda_b_politicos',
              titulo: 'deputado_banda_b',
              conteudo
            })
            .select()
            .single();
          if (error) throw error;
          const mapped = mapPrivadoParaBandaBPolitico(data);
          setBandaBPoliticos(prev => [mapped, ...(prev || [])]);
        }
      } else {
        const payload: any = {
          municipio_id: municipio.id,
          nome: bandaBForm.nome || null,
          esfera: (bandaBForm.esfera as 'federal' | 'estadual') || 'federal',
          partido: bandaBForm.partido || null,
          votos_recebidos: bandaBForm.votos_recebidos || null,
          historico: bandaBForm.historico || null,
          observacoes: bandaBForm.observacoes || null,
        };

        if (editingBandaB) {
          const { error } = await supabase
            .from('banda_b_politicos')
            .update(payload)
            .eq('id', editingBandaB.id);
          if (error) throw error;
          setBandaBPoliticos(prev => prev.map(b => b.id === editingBandaB.id ? { ...b, ...payload } as BandaBPolitico : b));
        } else {
          const { data, error } = await supabase
            .from('banda_b_politicos')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          setBandaBPoliticos(prev => [data as BandaBPolitico, ...(prev || [])]);
        }
      }

      setShowAddBandaBModal(false);
      setEditingBandaB(null);
      alert('Deputado Banda B salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar Banda B:', err);
      alert('Erro ao salvar Banda B. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Banda B: excluir
  const handleDeleteBandaB = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este deputado Banda B?')) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const { error } = await supabase
          .from('dados_editaveis_nivel1')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banda_b_politicos')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setBandaBPoliticos(prev => prev.filter(b => b.id !== id));
      alert('Deputado Banda B excluído!');
    } catch (err) {
      console.error('Erro ao excluir Banda B:', err);
      alert('Erro ao excluir Banda B. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Mapear valores de histórico para rótulos amigáveis
  const historicoLabel = (h?: string) => {
    switch (h) {
      case 'prefeito':
        return 'Ex-prefeito(a)';
      case 'candidato_perdeu':
        return 'Não eleito(a)';
      case 'vereador':
        return 'Vereador(a)';
      case 'vice':
        return 'Vice-prefeito(a)';
      case 'vice_atual':
        return 'Vice-prefeito(a) atual';
      case 'lideranca':
        return 'Liderança';
      case 'outros':
        return 'Outros';
      default:
        return h || '';
    }
  };
  // Mapeamento de cores por partido (chips/badges)
  const partidoClass = (p?: string) => {
    const s = (p || '').trim().toUpperCase();
    switch (s) {
      case 'PT':
        return 'bg-red-600 text-white';
      case 'AVANTE':
        return 'bg-orange-500 text-white';
      case 'PODEMOS':
        return 'bg-purple-600 text-white';
      case 'MDB':
        return 'bg-green-600 text-white';
      case 'PSDB':
        return 'bg-blue-700 text-white';
      case 'PL':
        return 'bg-blue-600 text-white';
      case 'PDT':
        return 'bg-red-500 text-white';
      case 'PSB':
        return 'bg-yellow-400 text-black';
      case 'REPUBLICANOS':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Gradientes especiais (ex.: PSD com verde, azul e amarelo)
  const partidoStyle = (p?: string): React.CSSProperties | undefined => {
    const s = (p || '').trim().toUpperCase();
    if (s === 'PSD') {
      return { background: `linear-gradient(90deg, ${PSD_GREEN}, ${PSD_BLUE} 50%, ${PSD_YELLOW})`, color: '#111', fontWeight: 700 };
    }
    if (s === 'UNIÃO BRASIL' || s === 'UNIAO BRASIL' || s === 'UNIÃO' || s === 'UNIAO') {
      return { background: 'linear-gradient(90deg, #003399, #FFCC00)', color: '#111', fontWeight: 700 };
    }
    const MAP: Record<string, string> = {
      PT: '#C8102E',
      MDB: '#00923D',
      PSDB: '#1B5CAB',
      PL: '#1E40AF',
      PDT: '#C62828',
      PSB: '#FFCC00',
      REPUBLICANOS: '#1B75BB',
      PODEMOS: '#0056A7',
      AVANTE: '#FF6A00',
      PP: '#0099D6',
      PROGRESSISTAS: '#0099D6',
      DEM: '#00843D',
      NOVO: '#F26522',
      PCDOB: '#C8102E',
      PSOL: '#FFD700',
      PV: '#2E7D32',
      CIDADANIA: '#F36D21',
      SOLIDARIEDADE: '#F36F21',
      PROS: '#FF7A00',
      PATRIOTA: '#00695C',
      PSC: '#006400',
      REDE: '#009688',
      PRTB: '#1D4ED8',
      PTB: '#CC0000'
    };
    const hex = MAP[s];
    return hex ? { backgroundColor: hex } : undefined;
  };

  // Cor do texto por partido (para usos sem badge)
  const partidoTextColor = (p?: string) => {
    const s = (p || '').trim().toUpperCase();
    const map: Record<string, string> = {
      PT: '#C8102E',
      PSD: PSD_BLUE,
      MDB: '#1E8449',
      PSDB: '#1B5CAB',
      PL: '#1E40AF',
      PDT: '#C62828',
      PSB: '#F59E0B',
      REPUBLICANOS: '#1E40AF',
      PODEMOS: '#0056A7',
      AVANTE: '#FF6A00',
      'UNIÃO BRASIL': '#003399',
      'UNIAO BRASIL': '#003399',
      UNIÃO: '#003399',
      UNIAO: '#003399',
      PP: '#0099D6',
      PROGRESSISTAS: '#0099D6',
      DEM: '#00843D',
      NOVO: '#F26522',
      PCDOB: '#C8102E',
      PSOL: '#FFD700',
      PV: '#2E7D32',
      CIDADANIA: '#F36D21',
      SOLIDARIEDADE: '#F36F21',
      PROS: '#FF7A00',
      PATRIOTA: '#00695C',
      PSC: '#006400',
      REDE: '#009688',
      PRTB: '#1D4ED8',
      PTB: '#CC0000'
    };
    return map[s] || TEXT_COLOR_DARK;
  };

  // Renderiza o nome do partido com estilo especial (PSD com letras coloridas)
  const renderPartidoName = (p?: string) => {
    const s = (p || '').trim().toUpperCase();
    if (s === 'PSD') {
      return (
        <span className="font-bold tracking-tight" aria-label="PSD">
          <span style={{ color: PSD_BLUE }}>P</span>
          <span style={{ color: PSD_GREEN }}>S</span>
          <span style={{ color: PSD_YELLOW }}>D</span>
        </span>
      );
    }
    return <span style={{ color: partidoTextColor(p) }}>{p}</span>;
  };

  // Mídias locais: add media modal state and handlers
  const [showAddMidiaModal, setShowAddMidiaModal] = useState(false);
  const [midiaForm, setMidiaForm] = useState<{ nome: string; tipo: string; url: string; observacoes: string }>({
    nome: '', tipo: '', url: '', observacoes: ''
  });

  // Família do Prefeito: modal de adição e form
  const [showAddFamiliaModal, setShowAddFamiliaModal] = useState(false);
  const [familiaItemForm, setFamiliaItemForm] = useState<{ tipo: string; nome: string; observacoes: string }>({
    tipo: '', nome: '', observacoes: ''
  });

  // Emendas/Programas: modal e estado
  const [showAddProgramaModal, setShowAddProgramaModal] = useState(false);
  const [programasEmendas, setProgramasEmendas] = useState<ProgramaEmenda[]>([]);
  const [editingPrograma, setEditingPrograma] = useState<ProgramaEmenda | null>(null);
  const [showDeleteProgramaModal, setShowDeleteProgramaModal] = useState(false);
  const [programaToDelete, setProgramaToDelete] = useState<ProgramaEmenda | null>(null);
  const [programaForm, setProgramaForm] = useState<{ esfera: 'estadual' | 'federal'; parlamentar_tipo: 'deputado_federal' | 'deputado_estadual' | 'senador'; parlamentar_nome: string; orgao_sigla: string; orgao_nome: string; area: string; observacoes: string }>({
    esfera: 'estadual',
    parlamentar_tipo: 'deputado_estadual',
    parlamentar_nome: '',
    orgao_sigla: '',
    orgao_nome: '',
    area: '',
    observacoes: ''
  });

  // Lideranças: lista, modal e formulário
  const [liderancas, setLiderancas] = useState<LiderancaPessoa[]>([]);
  const [showAddLiderancaModal, setShowAddLiderancaModal] = useState(false);
  const [editingLideranca, setEditingLideranca] = useState<LiderancaPessoa | null>(null);
  const [liderancaForm, setLiderancaForm] = useState<Partial<LiderancaPessoa>>({});

  // Banda B (Locais): lista, modal e formulário — igual Lideranças
  const [bandaBLocais, setBandaBLocais] = useState<BandaBLocal[]>([]);
  const [showAddBandaBLocalModal, setShowAddBandaBLocalModal] = useState(false);
  const [editingBandaBLocal, setEditingBandaBLocal] = useState<BandaBLocal | null>(null);
  const [bandaBLocalForm, setBandaBLocalForm] = useState<Partial<BandaBLocal>>({});

  // Banda B: lista, modal e formulário
  const [bandaBPoliticos, setBandaBPoliticos] = useState<BandaBPolitico[]>([]);
  const [showAddBandaBModal, setShowAddBandaBModal] = useState(false);
  const [editingBandaB, setEditingBandaB] = useState<BandaBPolitico | null>(null);
  const [bandaBForm, setBandaBForm] = useState<Partial<BandaBPolitico>>({ esfera: 'federal' });

  const handleOpenAddMidia = () => {
    // Para Nível 1, exigir usuário autenticado antes de abrir o modal
    if (userNivel === 1 && !user?.id) {
      alert('Faça login para adicionar seus dados privados (Nível 1).');
      return;
    }
    setMidiaForm({ nome: '', tipo: '', url: '', observacoes: '' });
    setShowAddMidiaModal(true);
  };

  const handleSaveMidia = async () => {
    if (!municipio) return;
    // Validação mínima para evitar erro de schema (campos obrigatórios)
    if (!midiaForm.nome || !midiaForm.tipo) {
      alert('Informe o nome e o tipo da mídia.');
      return;
    }
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const { data, error } = await supabase
          .from('dados_editaveis_nivel1')
          .insert({
            user_id: user.id,
            municipio_id: municipio.id,
            categoria: 'midia',
            titulo: 'midia_local',
            conteudo: {
              nome: midiaForm.nome || null,
              tipo: midiaForm.tipo || null,
              url: midiaForm.url || null,
              observacoes: midiaForm.observacoes || null
            }
          })
          .select()
          .single();

        if (error) throw error;

        const mapped = mapPrivadoParaMidia(data);
        setMidiasLocais(prev => [mapped, ...(prev || [])]);
        setShowAddMidiaModal(false);
        alert('Mídia local adicionada com sucesso!');
      } else {
        const newMidia = {
          municipio_id: municipio.id,
          nome: midiaForm.nome,
          tipo: midiaForm.tipo,
          url: midiaForm.url || null
        };

        const { data, error } = await supabase
          .from('midias_locais')
          .insert(newMidia)
          .select()
          .single();

        if (error) throw error;

        setMidiasLocais(prev => [data, ...(prev || [])]);
        setShowAddMidiaModal(false);
        alert('Mídia local adicionada com sucesso!');
      }
    } catch (err: any) {
      console.error('Erro ao adicionar mídia:', err);
      alert(`Erro ao adicionar mídia: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Mídias Locais: excluir
  const handleDeleteMidiaLocal = async (id: string) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir esta mídia local?')) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const { error } = await supabase
          .from('dados_editaveis_nivel1')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('midias_locais')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      setMidiasLocais(prev => (prev || []).filter(m => m.id !== id));
      alert('Mídia local excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir mídia local:', err);
      alert('Erro ao excluir mídia. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Emendas/Programas: abrir modal
  const handleOpenAddPrograma = () => {
    // Para Nível 1, exigir usuário autenticado antes de abrir o modal
    if (userNivel === 1 && !user?.id) {
      alert('Faça login para adicionar seus dados privados (Nível 1).');
      return;
    }
    setEditingPrograma(null);
    setProgramaForm({
      esfera: 'estadual',
      parlamentar_tipo: 'deputado_estadual',
      parlamentar_nome: '',
      orgao_sigla: '',
      orgao_nome: '',
      area: '',
      observacoes: ''
    });
    setShowAddProgramaModal(true);
  };

  // Emendas/Programas: abrir modal em modo edição
  const handleOpenEditPrograma = (p: ProgramaEmenda) => {
    setEditingPrograma(p);
    setProgramaForm({
      esfera: p.esfera,
      parlamentar_tipo: (p.parlamentar_tipo as any) || 'deputado_estadual',
      parlamentar_nome: p.parlamentar_nome || '',
      orgao_sigla: p.orgao_sigla || '',
      orgao_nome: p.orgao_nome || '',
      area: p.area || '',
      observacoes: p.observacoes || ''
    });
    setShowAddProgramaModal(true);
  };

  // Emendas/Programas: salvar
  const handleSavePrograma = async () => {
    if (!municipio) return;
    if (!programaForm.parlamentar_nome) {
      alert('Informe o nome do parlamentar.');
      return;
    }
    if (!programaForm.orgao_sigla) {
      alert('Selecione o órgão.');
      return;
    }
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const conteudo = {
          esfera: programaForm.esfera,
          parlamentar_tipo: programaForm.parlamentar_tipo || null,
          parlamentar_nome: programaForm.parlamentar_nome || null,
          orgao_sigla: programaForm.orgao_sigla || null,
          orgao_nome: programaForm.orgao_nome || null,
          area: programaForm.area || null,
          observacoes: programaForm.observacoes || null
        };
        const { data, error } = await supabase
          .from('dados_editaveis_nivel1')
          .insert({
            user_id: user.id,
            municipio_id: municipio.id,
            categoria: 'programas_emendas',
            titulo: 'programa_emenda',
            conteudo
          })
          .select()
          .single();
        if (error) throw error;
        const mapped = mapPrivadoParaPrograma(data);
        setProgramasEmendas(prev => [mapped, ...(prev || [])]);
      } else {
        const newItem = {
          municipio_id: municipio.id,
          esfera: programaForm.esfera,
          parlamentar_tipo: programaForm.parlamentar_tipo || null,
          parlamentar_nome: programaForm.parlamentar_nome || null,
          orgao_sigla: programaForm.orgao_sigla || null,
          orgao_nome: programaForm.orgao_nome || null,
          area: programaForm.area || null,
          observacoes: programaForm.observacoes || null
        };

        const { data, error } = await supabase
          .from('programas_emendas')
          .insert(newItem)
          .select()
          .single();

        if (error) throw error;
        setProgramasEmendas(prev => [data, ...(prev || [])]);
      }
      setShowAddProgramaModal(false);
      alert('Emenda/Programa adicionada com sucesso!');
    } catch (err) {
      console.error('Erro ao adicionar emenda/programa:', err);
      const msg = (err as any)?.message || (err as any)?.error?.message || 'Erro ao adicionar. Tente novamente.';
      alert(`Erro ao adicionar: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // (removido duplicado) a função handleOpenAddPrograma já está definida acima com gate de login

  // Emendas/Programas: atualizar
  const handleUpdatePrograma = async () => {
    if (!editingPrograma) return;
    if (!programaForm.parlamentar_nome) {
      alert('Informe o nome do parlamentar.');
      return;
    }
    if (!programaForm.orgao_sigla) {
      alert('Selecione o órgão.');
      return;
    }
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const conteudo = {
          esfera: programaForm.esfera,
          parlamentar_tipo: (programaForm.parlamentar_tipo as any) || null,
          parlamentar_nome: programaForm.parlamentar_nome || null,
          orgao_sigla: programaForm.orgao_sigla || null,
          orgao_nome: programaForm.orgao_nome || null,
          area: programaForm.area || null,
          observacoes: programaForm.observacoes || null
        };
        const { data, error } = await supabase
          .from('dados_editaveis_nivel1')
          .update({ titulo: 'programa_emenda', conteudo })
          .eq('id', editingPrograma.id)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        const mapped = mapPrivadoParaPrograma(data);
        setProgramasEmendas(prev => prev.map(item => item.id === mapped.id ? mapped : item));
      } else {
        const updates: Partial<ProgramaEmenda> = {
          esfera: programaForm.esfera,
          parlamentar_tipo: (programaForm.parlamentar_tipo as any) || null,
          parlamentar_nome: programaForm.parlamentar_nome || null,
          orgao_sigla: programaForm.orgao_sigla || null,
          orgao_nome: programaForm.orgao_nome || null,
          area: programaForm.area || null,
          observacoes: programaForm.observacoes || null
        };

        const { error } = await supabase
          .from('programas_emendas')
          .update(updates)
          .eq('id', editingPrograma.id);

        if (error) throw error;

        setProgramasEmendas(prev => prev.map(item => item.id === editingPrograma.id ? { ...item, ...updates } as ProgramaEmenda : item));
      }
      setShowAddProgramaModal(false);
      setEditingPrograma(null);
      alert('Emenda/Programa atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar emenda/programa:', err);
      alert('Erro ao atualizar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Emendas/Programas: abrir modal de exclusão
  const handleOpenDeletePrograma = (p: ProgramaEmenda) => {
    setProgramaToDelete(p);
    setShowDeleteProgramaModal(true);
  };

  // Emendas/Programas: excluir
  const handleDeletePrograma = async () => {
    if (!programaToDelete) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const { error } = await supabase
          .from('dados_editaveis_nivel1')
          .delete()
          .eq('id', programaToDelete.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('programas_emendas')
          .delete()
          .eq('id', programaToDelete.id);
        if (error) throw error;
      }

      setProgramasEmendas(prev => prev.filter(item => item.id !== programaToDelete.id));
      setShowDeleteProgramaModal(false);
      setProgramaToDelete(null);
      alert('Emenda/Programa excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir emenda/programa:', err);
      alert('Erro ao excluir. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Família do Prefeito: abrir modal de adição
  const handleOpenAddFamilia = () => {
    // Para Nível 1, exigir usuário autenticado antes de abrir o modal
    if (userNivel === 1 && !user?.id) {
      alert('Faça login para adicionar seus dados privados (Nível 1).');
      return;
    }
    setFamiliaItemForm({ tipo: '', nome: '', observacoes: '' });
    setEditingFamiliaItemId(null);
    setShowAddFamiliaModal(true);
  };

  // Família do Prefeito: abrir modal em modo edição
  const handleOpenEditFamilia = (item: FamiliaMembro) => {
    setFamiliaItemForm({
      tipo: item.tipo || '',
      nome: item.nome || '',
      observacoes: item.observacoes || ''
    });
    setEditingFamiliaItemId(item.id);
    setShowAddFamiliaModal(true);
  };

  // Família do Prefeito: salvar novo item
  const handleSaveFamiliaItem = async () => {
    if (!municipio) return;
    if (!familiaItemForm.tipo || !familiaItemForm.nome) {
      alert('Selecione o tipo e informe o nome.');
      return;
    }
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        // Fluxo privado (dados_editaveis_nivel1)
        if (!user?.id) throw new Error('Usuário não autenticado.');
        if (editingFamiliaItemId) {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .update({
              titulo: 'membro_familia',
              conteudo: {
                tipo: familiaItemForm.tipo || null,
                nome: familiaItemForm.nome || null,
                observacoes: familiaItemForm.observacoes || null
              }
            })
            .eq('id', editingFamiliaItemId)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) throw error;
          const mapped = mapPrivadoParaFamilia(data);
          setFamiliaLista(prev => prev.map(it => it.id === mapped.id ? mapped : it));
          setShowAddFamiliaModal(false);
          setEditingFamiliaItemId(null);
          alert('Membro da família atualizado com sucesso!');
        } else {
          const { data, error } = await supabase
            .from('dados_editaveis_nivel1')
            .insert({
              user_id: user.id,
              municipio_id: municipio.id,
              categoria: 'familia_prefeito',
              titulo: 'membro_familia',
              conteudo: {
                tipo: familiaItemForm.tipo || null,
                nome: familiaItemForm.nome || null,
                observacoes: familiaItemForm.observacoes || null
              }
            })
            .select()
            .single();

          if (error) throw error;
          const mapped = mapPrivadoParaFamilia(data);
          setFamiliaLista(prev => [mapped, ...(prev || [])]);
          setShowAddFamiliaModal(false);
          alert('Membro da família adicionado com sucesso!');
        }
      } else {
        // Fluxo padrão (tabela pública familia_prefeito)
        if (editingFamiliaItemId) {
          // Atualização de item existente
          const updates = {
            tipo: familiaItemForm.tipo || null,
            nome: familiaItemForm.nome || null,
            observacoes: familiaItemForm.observacoes || null
          };

          const { data, error } = await supabase
            .from('familia_prefeito')
            .update(updates)
            .eq('id', editingFamiliaItemId)
            .select()
            .single();

          if (error) throw error;
          setFamiliaLista(prev => prev.map(it => it.id === data.id ? data : it));
          setShowAddFamiliaModal(false);
          setEditingFamiliaItemId(null);
          alert('Membro da família atualizado com sucesso!');
        } else {
          // Inserção de novo item
          const newItem = {
            municipio_id: municipio.id,
            tipo: familiaItemForm.tipo || null,
            nome: familiaItemForm.nome || null,
            observacoes: familiaItemForm.observacoes || null
          };

          const { data, error } = await supabase
            .from('familia_prefeito')
            .insert(newItem)
            .select()
            .single();

          if (error) throw error;

          setFamiliaLista(prev => [data, ...(prev || [])]);
          setShowAddFamiliaModal(false);
          alert('Membro da família adicionado com sucesso!');
        }
      }
    } catch (err) {
      console.error('Erro ao adicionar membro da família:', err);
      const msg = (err as any)?.message || (err as any)?.error?.message || 'Erro ao adicionar membro da família. Tente novamente.';
      alert(`Erro ao adicionar membro da família: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Família do Prefeito: excluir item
  const handleDeleteFamilia = async (id: string) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir este membro da família?')) return;
    setIsSaving(true);
    try {
      if (userNivel === 1) {
        if (!user?.id) throw new Error('Usuário não autenticado.');
        const { error } = await supabase
          .from('dados_editaveis_nivel1')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('familia_prefeito')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }

      setFamiliaLista(prev => (prev || []).filter(item => item.id !== id));
      alert('Membro da família excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir membro da família:', err);
      alert('Erro ao excluir. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

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
    if (!municipioId) return;
    console.log('municipioId:', municipioId, 'userNivel:', userNivel, 'userId:', user?.id);
    fetchMunicipioDetalhes();
    // Para usuários de nível 1, aguarde o carregamento do user.id
    if (userNivel !== 1 || user?.id) {
      fetchVereadores();
    }
    fetchTransferencias();
  }, [municipioId, user?.id, userNivel]);

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
      if (userNivel === 1) {
        if (user?.id) {
          const { data: privMidias, error: privMidiasError } = await supabase
            .from('dados_editaveis_nivel1')
            .select('id, municipio_id, categoria, conteudo')
            .eq('municipio_id', municipioId)
            .eq('user_id', user.id)
            .eq('categoria', 'midia')
            .order('id', { ascending: false });

          if (privMidiasError) {
            console.error('Erro ao buscar mídias locais privadas:', privMidiasError);
          } else {
            setMidiasLocais((privMidias || []).map(mapPrivadoParaMidia));
          }
        } else {
          setMidiasLocais([]);
        }
      } else {
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
      }

      // Buscar Família do Prefeito (itens individuais)
      if (userNivel === 1) {
        if (user?.id) {
          const { data: privFamilia, error: privFamiliaError } = await supabase
            .from('dados_editaveis_nivel1')
            .select('id, municipio_id, categoria, conteudo')
            .eq('municipio_id', municipioId)
            .eq('user_id', user.id)
            .eq('categoria', 'familia_prefeito')
            .order('id', { ascending: false });
          if (privFamiliaError) {
            console.error('Erro ao buscar família privada do prefeito:', privFamiliaError);
          } else {
            setFamiliaLista((privFamilia || []).map(mapPrivadoParaFamilia));
          }
        } else {
          // Usuário ainda não carregado; não exibir dados públicos para nível 1
          setFamiliaLista([]);
        }
      } else {
        const { data: familiaData, error: familiaError } = await supabase
          .from('familia_prefeito')
          .select('*')
          .eq('municipio_id', municipioId);
        if (familiaError) {
          console.error('Erro ao buscar família do prefeito:', familiaError);
        } else {
          setFamiliaLista(familiaData || []);
        }
      }

      // Buscar Lideranças
      if (userNivel === 1) {
        if (user?.id) {
          const { data: privLiderancas, error: privLiderancasError } = await supabase
            .from('dados_editaveis_nivel1')
            .select('id, municipio_id, categoria, conteudo')
            .eq('municipio_id', municipioId)
            .eq('user_id', user.id)
            .eq('categoria', 'liderancas')
            .order('id', { ascending: false });
          if (privLiderancasError) {
            console.error('Erro ao buscar lideranças privadas:', privLiderancasError);
          } else {
            setLiderancas((privLiderancas || []).map(mapPrivadoParaLideranca));
          }
        } else {
          setLiderancas([]);
        }
      } else {
        const { data: liderancasData, error: liderancasError } = await supabase
          .from('liderancas')
          .select('*')
          .eq('municipio_id', municipioId)
          .order('nome');
        if (liderancasError) {
          console.error('Erro ao buscar lideranças:', liderancasError);
        } else {
          setLiderancas(liderancasData || []);
        }
      }

      // Buscar Banda B (locais)
      if (userNivel === 1) {
        if (user?.id) {
          const { data: privBandaBLocais, error: privBandaBLocaisError } = await supabase
            .from('dados_editaveis_nivel1')
            .select('id, municipio_id, categoria, conteudo')
            .eq('municipio_id', municipioId)
            .eq('user_id', user.id)
            .eq('categoria', 'banda_b_local')
            .order('id', { ascending: false });
          if (privBandaBLocaisError) {
            console.error('Erro ao buscar Banda B locais privados:', privBandaBLocaisError);
          } else {
            setBandaBLocais((privBandaBLocais || []).map(mapPrivadoParaBandaBLocal));
          }
        } else {
          setBandaBLocais([]);
        }
      } else {
        const { data: bandaBLocaisData, error: bandaBLocaisError } = await supabase
          .from('banda_b')
          .select('*')
          .eq('municipio_id', municipioId)
          .order('nome');
        if (bandaBLocaisError) {
          console.error('Erro ao buscar Banda B (locais):', bandaBLocaisError);
        } else {
          setBandaBLocais(bandaBLocaisData || []);
        }
      }

      // Buscar Banda B (deputados)
      if (userNivel === 1) {
        if (user?.id) {
          const { data: privBandaB, error: privBandaBError } = await supabase
            .from('dados_editaveis_nivel1')
            .select('id, municipio_id, categoria, conteudo')
            .eq('municipio_id', municipioId)
            .eq('user_id', user.id)
            .eq('categoria', 'banda_b_politicos')
            .order('id', { ascending: false });
          if (privBandaBError) {
            console.error('Erro ao buscar Banda B (deputados) privados:', privBandaBError);
          } else {
            setBandaBPoliticos((privBandaB || []).map(mapPrivadoParaBandaBPolitico));
          }
        } else {
          setBandaBPoliticos([]);
        }
      } else {
        const { data: bandaBData, error: bandaBError } = await supabase
          .from('banda_b_politicos')
          .select('*')
          .eq('municipio_id', municipioId)
          .order('esfera');
        if (bandaBError) {
          console.error('Erro ao buscar Banda B:', bandaBError);
        } else {
          setBandaBPoliticos(bandaBData || []);
        }
      }

      // Buscar Vice-Prefeitos
      const { data: viceData, error: viceError } = await supabase
        .from('vice_prefeitos')
        .select('*')
        .eq('municipio_id', municipioId)
        .order('created_at', { ascending: false });
      if (viceError) {
        console.error('Erro ao buscar vice-prefeitos:', viceError);
      } else {
        setVicePrefeitos(viceData || []);
      }

      // Buscar Emendas/Programas
      if (userNivel === 1) {
        if (user?.id) {
          const { data: privProgramas, error: privProgramasError } = await supabase
            .from('dados_editaveis_nivel1')
            .select('id, municipio_id, categoria, conteudo')
            .eq('municipio_id', municipioId)
            .eq('user_id', user.id)
            .eq('categoria', 'programas_emendas')
            .order('id', { ascending: false });
          if (privProgramasError) {
            console.error('Erro ao buscar emendas/programas privados:', privProgramasError);
          } else {
            setProgramasEmendas((privProgramas || []).map(mapPrivadoParaPrograma));
          }
        } else {
          setProgramasEmendas([]);
        }
      } else {
        const { data: programasData, error: programasError } = await supabase
          .from('programas_emendas')
          .select('*')
          .eq('municipio_id', municipioId)
          .order('created_at', { ascending: false });
        if (programasError) {
          console.error('Erro ao buscar emendas/programas:', programasError);
        } else {
          setProgramasEmendas(programasData || []);
        }
      }

      // Buscar candidatos a prefeito
      let candidatosData: CandidatoPrefeito[] | null = null;
      let candidatosError: any = null;

      // Tentar por municipio_id (numérico), se aplicável
      const municipioIdNum = /^\d+$/.test(municipioId) ? parseInt(municipioId, 10) : null;
      if (municipioIdNum !== null) {
        const res = await supabase
          .from('candidatos_prefeito_ba_2024')
          .select('*')
          .eq('municipio_id', municipioIdNum)
          .order('votos', { ascending: false });
        candidatosData = (res.data || []) as any;
        candidatosError = res.error;
      }

      // Se não veio dado pelo ID, tenta por nome do município (igualdade exata)
      if (!candidatosData || candidatosData.length === 0) {
        const { data: municipioNomeData, error: municipioNomeError } = await supabase
          .from('municipios')
          .select('municipio')
          .eq('id', municipioId)
          .single();

        if (!municipioNomeError && municipioNomeData?.municipio) {
          const resByName = await supabase
            .from('candidatos_prefeito_ba_2024')
            .select('*')
            .eq('municipio', municipioNomeData.municipio)
            .order('votos', { ascending: false });

          if (!resByName.error) {
            const nomeAlvo = String(municipioNomeData.municipio || '').trim();
            const apenasMesmoMunicipio = (resByName.data || []).filter((c: any) => String(c.municipio || '').trim() === nomeAlvo);
            candidatosData = (apenasMesmoMunicipio || []) as any;
            candidatosError = null;
          } else {
            candidatosError = resByName.error;
          }
        } else {
          candidatosError = municipioNomeError;
        }
      }

      console.log('Candidatos a prefeito:', candidatosData, 'Erro:', candidatosError);
      if (candidatosError) {
        console.error('Erro ao buscar candidatos a prefeito:', candidatosError);
        setCandidatosPrefeito([]);
      } else {
        // Garantir porcentagem e posicao como fallback se não vierem da tabela
        const lista = candidatosData || [];
        const totalVotos = lista.reduce((s: number, c: any) => s + (Number(c.votos) || 0), 0);
        const enriquecidos = lista.map((c: any, i: number) => {
          // Usar o valor de porcentagem já presente na tabela (variações de nome), com fallback de cálculo
          const rawPct = (
            c.porcentagem ?? c.percentual ?? c.percentual_votos ?? c.percentualTotal ?? c.porcent_votos ?? c.pct
          );

          let pctNum: number | null = null;
          if (typeof rawPct === 'number' && Number.isFinite(rawPct)) {
            pctNum = rawPct;
          } else if (typeof rawPct === 'string') {
            const normalized = rawPct.replace('%', '').replace(',', '.').trim();
            const parsed = parseFloat(normalized);
            if (Number.isFinite(parsed)) pctNum = parsed;
          }

          const finalPct = pctNum !== null
            ? pctNum
            : (totalVotos > 0 ? ((Number(c.votos) || 0) / totalVotos) * 100 : 0);

          return {
            ...c,
            posicao: c.posicao ?? i + 1,
            porcentagem: finalPct,
            partido: c.partido || '—'
          };
        });
        setCandidatosPrefeito(enriquecidos);
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
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem editar.');
      return;
    }
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleEditPresidente = () => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem editar.');
      return;
    }
    // Prefill form with existing values
    setPresidenteForm({
      nome: municipio?.presidente_camara || '',
      partido: municipio?.presidente_camara_partido || '',
      votos: municipio?.presidente_camara_votos_vereador || ''
    });
    setEditingField('presidente_camara_group');
  };

  const handleOpenFamilia = () => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem editar.');
      return;
    }
    setFamiliaForm({
      primeira_dama: municipio?.primeira_dama || '',
      filhos_prefeito: municipio?.filhos_prefeito || ''
    });
    setEditingField('familia_prefeito_group');
  };

  const handleSavePresidente = async () => {
    if (!municipio) return;
    setIsSaving(true);
    try {
      const updates: any = {
        presidente_camara: presidenteForm.nome || null,
        presidente_camara_partido: presidenteForm.partido || null,
        presidente_camara_votos_vereador: presidenteForm.votos || null
      };

      const { error } = await supabase
        .from('municipios')
        .update(updates)
        .eq('id', municipio.id);

      if (error) throw error;

      setMunicipio(prev => prev ? { ...prev, ...updates } as MunicipioDetalhado : prev);
      setEditingField(null);
      alert('Presidente da Câmara atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar presidente da câmara:', err);
      alert('Erro ao atualizar Presidente da Câmara. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFamilia = async () => {
    if (!municipio) return;
    setIsSaving(true);
    try {
      const updates: any = {
        primeira_dama: familiaForm.primeira_dama || null,
        filhos_prefeito: familiaForm.filhos_prefeito || null
      };

      const { error } = await supabase
        .from('municipios')
        .update(updates)
        .eq('id', municipio.id);

      if (error) throw error;

      setMunicipio(prev => prev ? { ...prev, ...updates } as MunicipioDetalhado : prev);
      setEditingField(null);
      alert('Família do Prefeito atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar família do prefeito:', err);
      alert('Erro ao atualizar Família do Prefeito. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddVicePrefeito = () => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem adicionar.');
      return;
    }
    setEditingVice(null);
    setViceForm({});
    setShowAddViceModal(true);
  };

  const handleOpenEditVicePrefeito = (item: VicePrefeitoItem) => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem editar.');
      return;
    }
    setEditingVice(item);
    setViceForm({
      nome: item.nome || undefined,
      partido: item.partido || undefined,
      telefone: item.telefone || undefined,
      historico: item.historico || undefined,
      observacoes: item.observacoes || undefined,
    });
    setShowAddViceModal(true);
  };

  const handleSaveVicePrefeito = async () => {
    if (!municipio) return;
    setIsSaving(true);
    try {
      const payload: any = {
        municipio_id: municipio.id,
        nome: viceForm.nome || null,
        partido: viceForm.partido || null,
        telefone: viceForm.telefone || null,
        historico: viceForm.historico || null,
        observacoes: viceForm.observacoes || null,
      };

      if (editingVice) {
        const { error } = await supabase
          .from('vice_prefeitos')
          .update(payload)
          .eq('id', editingVice.id);
        if (error) throw error;
        setVicePrefeitos(prev => prev.map(v => v.id === editingVice.id ? { ...v, ...payload } as VicePrefeitoItem : v));
      } else {
        const { data, error } = await supabase
          .from('vice_prefeitos')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setVicePrefeitos(prev => [data as VicePrefeitoItem, ...(prev || [])]);
      }

      setShowAddViceModal(false);
      setEditingVice(null);
      alert('Vice-Prefeito salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar Vice-Prefeito:', err);
      alert('Erro ao salvar Vice-Prefeito. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVicePrefeito = async (id: string) => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem excluir.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este Vice-Prefeito?')) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('vice_prefeitos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setVicePrefeitos(prev => prev.filter(v => v.id !== id));
      alert('Vice-Prefeito excluído!');
    } catch (err) {
      console.error('Erro ao excluir Vice-Prefeito:', err);
      alert('Erro ao excluir. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
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
        'aniversario': 'Aniversário do Prefeito',
        'nome_prefeito': 'Nome do Prefeito',
        'vice_prefeito': 'Vice-Prefeito',
        'presidente_camara': 'Presidente da Câmara',
        'presidente_camara_partido': 'Partido do Presidente da Câmara',
        'observacoes_municipio': 'Observações do Município',
        'familia_prefeito': 'Família do Prefeito',
        'primeira_dama': 'Primeira-dama(o)',
        'filhos_prefeito': 'Filhos do Prefeito',
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

  // Formata datas em ordem dia/mês/ano. Aceita formatos como YYYY-MM-DD, DD/MM/YYYY ou "11 de julho de 1980".
  const formatDateDMY = (raw?: string | null) => {
    if (!raw) return 'Não informado';
    const v = String(raw).trim();
    // ISO: 1980-07-11
    const isoMatch = v.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoMatch) {
      const [y, m, d] = v.substring(0, 10).split('-');
      return `${d}/${m}/${y}`;
    }
    // dd/mm/yyyy
    const dmyMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmyMatch) {
      const d = dmyMatch[1].padStart(2, '0');
      const m = dmyMatch[2].padStart(2, '0');
      const y = dmyMatch[3];
      return `${d}/${m}/${y}`;
    }
    // "11 de julho" ou "11 de julho de 1980"
    const monthNames: { [k: string]: string } = {
      'janeiro': '01','fevereiro': '02','março': '03','marco': '03','abril': '04','maio': '05','junho': '06','julho': '07','agosto': '08','setembro': '09','outubro': '10','novembro': '11','dezembro': '12'
    };
    const textoMatch = v.toLowerCase().match(/^(\d{1,2})\s+de\s+([a-zçãéíóú]+)(?:\s+de\s+(\d{4}))?$/);
    if (textoMatch) {
      const d = textoMatch[1].padStart(2, '0');
      const m = monthNames[textoMatch[2]] || '';
      const y = textoMatch[3];
      if (m) {
        return y ? `${d}/${m}/${y}` : `${d}/${m}`;
      }
    }
    // Fallback: retorna o original
    return v;
  };

  const handleEditDeputado = (type: 'federal' | 'estadual' | 'vereador', id: string, field: string, currentValue: string) => {
    if (userNivel === 1) {
      alert('Usuários de nível 1 não podem editar.');
      return;
    }
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
            <p className="mt-3 text-white font-semibold">
              {municipio.prefeito || 'Prefeito não informado'}
            </p>
          </div>
        )}

        {/* Informações Básicas do Município */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Informações Básicas do Município</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              title="População"
              value={municipio.populacao}
              icon={<Users />}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('populacao', municipio.populacao || '') : undefined}
            />
            <InfoCard
              title="Eleitores"
              value={municipio.eleitores}
              icon={<Users />}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('eleitores', municipio.eleitores || '') : undefined}
            />
            <InfoCard
              title="Instagram da Prefeitura"
              value={municipio.instagram_prefeitura}
              icon={<Instagram />}
              isEditable={userNivel !== 1}
              isLink={true}
              onEditPress={() => handleEditField('instagram_prefeitura', municipio.instagram_prefeitura || '')}
            />
            <InfoCard
              title="Data de Emancipação"
              value={municipio.data_emancipacao}
              icon={<Users />}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('data_emancipacao', municipio.data_emancipacao || '') : undefined}
            />
          </div>
          
        </div>

        {/* Observações Adicionais */}
        <details className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <summary className="flex items-center justify-between mb-4 cursor-pointer">
            <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Observações Adicionais</h2>
          </summary>

          {municipio.observacoes_municipio ? (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-gray-700 whitespace-pre-wrap">{municipio.observacoes_municipio}</p>
              {userNivel !== 1 && (
                <button 
                  onClick={() => handleEditField('observacoes_municipio', municipio.observacoes_municipio || '')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Editar observações
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Nenhuma observação cadastrada</p>
                {userNivel !== 1 && (
                  <button
                    onClick={() => handleEditField('observacoes_municipio', '')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar observação
                  </button>
                )}
              </div>
            </div>
          )}
        </details>

        {/* Informações do Prefeito */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-psd-blue mb-4 text-center">Informações do Prefeito</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              title="Nome"
              value={municipio.prefeito}
              icon={<User />}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('prefeito', municipio.prefeito || '') : undefined}
            />
            <InfoCard
              title="Partido"
              value={municipio.partido}
              icon={<Building />}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('partido', municipio.partido || '') : undefined}
            />
            <InfoCard
              title="Aniversário do Prefeito"
              value={formatDateDMY(municipio.aniversario)}
              icon={<Calendar />}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('aniversario', municipio.aniversario || '') : undefined}
            />
            <InfoCard
              title="Votos Recebidos"
              value={municipio.votos_recebidos}
              icon={<Award />}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('votos_recebidos', municipio.votos_recebidos || '') : undefined}
            />
            <InfoCard
              title="Telefone"
              value={municipio.telefone}
              icon={<Phone />}
              isLink={true}
              isEditable={userNivel !== 1}
              onEditPress={userNivel !== 1 ? () => handleEditField('telefone', municipio.telefone || '') : undefined}
            />
            <InfoCard
              title="Instagram do Prefeito"
              value={municipio.instagram_prefeito}
              icon={<Instagram />}
              isEditable={userNivel !== 1}
              isLink={true}
              onEditPress={() => handleEditField('instagram_prefeito', municipio.instagram_prefeito || '')}
            />
            {/* Card removido conforme solicitação: Liderança será gerenciada na seção inferior */}
            {/* Card removido conforme solicitação: Deputados Banda B será gerenciado na seção inferior */}
            {/* Card removido conforme solicitação: Família do Prefeito será gerenciado na seção inferior */}
          </div>
        </div>

        {/* Vice-Prefeito — seção oculta com lista e botão adicionar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Vice-Prefeito</h2>
              {userNivel !== 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddVicePrefeito}
                    className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                    title="Adicionar Vice-Prefeito"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </summary>
            <div className="mt-2">
              {vicePrefeitos && vicePrefeitos.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {vicePrefeitos.map((v) => (
                    <div key={v.id} className="border rounded-lg p-3 bg-blue-50 relative">
                      {userNivel !== 1 && (
                        <div className="absolute right-3 top-3 flex gap-2">
                          <button
                            onClick={() => handleOpenEditVicePrefeito(v)}
                            className="bg-white border border-blue-200 text-psd-blue rounded-full w-7 h-7 flex items-center justify-center shadow"
                            aria-label={`Editar ${v.nome || 'vice-prefeito'}`}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteVicePrefeito(v.id)}
                            className="bg-white border border-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow"
                            aria-label={`Excluir ${v.nome || 'vice-prefeito'}`}
                            title="Excluir"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{v.nome || 'Nome não informado'}</h4>
                            {v.partido && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${partidoClass(v.partido)}`}
                                style={partidoStyle(v.partido)}
                              >
                                {v.partido}
                              </span>
                            )}
                            {v.historico && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-200 text-yellow-800">{historicoLabel(v.historico)}</span>
                            )}
                          </div>
                          {v.telefone && (
                            <p className="text-sm text-gray-700">Telefone: {v.telefone}</p>
                          )}
                          {v.observacoes && (
                            <p className="text-xs text-gray-500 italic mt-1">{v.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm italic">Clique no botão + para adicionar dados do Vice-Prefeito</p>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Candidatos a Prefeito - Eleições 2024 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Eleições 2024 - Candidatos a Prefeito</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchVereadores}
                className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                title="Atualizar candidatos"
              >
                <RefreshCw size={18} className="text-psd-blue" />
              </button>
            </div>
          </div>

          {candidatosPrefeito.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidatosPrefeito.map((candidato) => {
                const pos = Number(candidato.posicao) || 0;
                const icon = pos === 1 ? '🏆' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '';
                const situacaoLabel = candidato.situacao ? `(${String(candidato.situacao)})` : (pos === 1 ? '(Eleito)' : '');
                const votosFmt = Number(candidato.votos || 0).toLocaleString('pt-BR');
                const pct = typeof candidato.porcentagem === 'number' ? candidato.porcentagem : 0;
                const pctText = `${pct.toFixed(2)}%`;
                const pctBarWidth = `${Math.min(Math.max(pct, 0), 100)}%`;
                return (
                  <div key={candidato.id} className="bg-white border border-gray-200 rounded-lg p-4 text-psd-dark relative group">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{icon}</span>
                      <h3 className="font-semibold text-gray-700">
                        {pos}º Colocado <span className="text-sm font-normal text-gray-500">{situacaoLabel}</span>
                      </h3>
                    </div>

                    <div className="mt-1">
                      <p className="font-bold text-lg text-psd-dark">
                        {String(candidato.nome || '—').toUpperCase()} <span className="font-normal">({String(candidato.partido || '—').toUpperCase()})</span>
                      </p>
                      {candidato.nome_completo && (
                        <p className="text-xs text-gray-500 mt-1">{candidato.nome_completo}</p>
                      )}
                      <div className="mt-3 grid grid-cols-2 gap-2 items-center">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">{votosFmt} votos</p>
                          <p className="text-sm text-gray-600 font-medium">{pctText}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          {typeof candidato.numero === 'number' && (
                            <span className="px-2 py-1 border rounded text-xs text-gray-700">Nº {candidato.numero}</span>
                          )}
                        </div>
                      </div>

                      {/* Barra de percentual */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded h-2">
                          <div className="bg-psd-blue h-2 rounded" style={{ width: pctBarWidth }} />
                        </div>
                      </div>

                      {/* Detalhes extras */}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-blue-700">Mais detalhes</summary>
                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                          <p><span className="text-gray-500">Situação:</span> {candidato.situacao || '—'}</p>
                          <p><span className="text-gray-500">Município:</span> {candidato.municipio || '—'}</p>
                          {candidato.updated_at && (
                            <p><span className="text-gray-500">Atualizado em:</span> {new Date(String(candidato.updated_at)).toLocaleString('pt-BR')}</p>
                          )}
                          {candidato.created_at && (
                            <p><span className="text-gray-500">Criado em:</span> {new Date(String(candidato.created_at)).toLocaleString('pt-BR')}</p>
                          )}
                        </div>
                      </details>
                    </div>

                    {pos === 3 && (
                      <div className="absolute -top-2 right-2 hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-md p-3 text-xs w-64 z-10">
                        <p className="font-semibold mb-1">3º colocado — detalhes</p>
                        <p><span className="text-gray-500">Nome:</span> {String(candidato.nome || '—')}</p>
                        <p>
                          <span className="text-gray-500">Partido:</span>{' '}
                          {candidato.partido ? renderPartidoName(candidato.partido) : '—'}
                        </p>
                        <p><span className="text-gray-500">Votos:</span> {votosFmt}</p>
                        <p><span className="text-gray-500">Percentual:</span> {pctText}</p>
                        {typeof candidato.numero === 'number' && (
                          <p><span className="text-gray-500">Número:</span> {candidato.numero}</p>
                        )}
                        {candidato.situacao && (
                          <p><span className="text-gray-500">Situação:</span> {candidato.situacao}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Nenhum candidato a prefeito cadastrado para este município.</div>
          )}
        </div>

        {/* Transferências Governamentais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between">
              <h2 className="text-xl font-bold text-psd-blue">Transferências Governamentais</h2>
              <button
                onClick={fetchTransferencias}
                className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                disabled={loadingTransferencias}
              >
                <RefreshCw size={20} className={`text-psd-blue ${loadingTransferencias ? 'animate-spin' : ''}`} />
              </button>
            </summary>
            <div className="mt-4">
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
          </details>
        </div>

        {/* Emendas e Programas */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Emendas e Programas</h2>
              <button
                onClick={handleOpenAddPrograma}
                className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                title="Adicionar emenda/programa"
              >
                <Plus size={16} />
              </button>
            </summary>
            <div className="mt-4">
              {programasEmendas && programasEmendas.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {programasEmendas.map((p) => (
                    <div key={p.id} className="border rounded-lg p-3 bg-indigo-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-psd-blue mr-2">{p.esfera === 'estadual' ? 'Estadual' : 'Federal'}</span>
                            {p.parlamentar_tipo ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full mr-2">
                                {p.parlamentar_tipo === 'deputado_federal' ? 'Deputado Federal' : p.parlamentar_tipo === 'deputado_estadual' ? 'Deputado Estadual' : 'Senador'}
                              </span>
                            ) : null}
                          </p>
                          <h4 className="font-bold text-gray-900">{p.parlamentar_nome || '—'}</h4>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">{p.orgao_sigla || ''}</span>
                            {p.orgao_nome ? ` • ${p.orgao_nome}` : ''}
                          </p>
                          {p.area && (
                            <p className="text-xs text-gray-500">Área: {p.area}</p>
                          )}
                          {p.observacoes && (
                            <p className="text-xs text-gray-500 italic mt-1">{p.observacoes}</p>
                          )}
                        </div>
                        <div className="flex items-center ml-3">
                          <button
                            onClick={() => handleOpenEditPrograma(p)}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            title="Editar emenda/programa"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDeletePrograma(p)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir emenda/programa"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-100 rounded-lg">
                  <FileText size={36} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Nenhuma emenda/programa cadastrado</p>
                  <p className="text-sm text-gray-500 italic">Use o botão + para adicionar</p>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Deputados Federais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Top 5 Deputados Federais Mais Votados</h2>
              <span className="text-sm text-gray-500 ml-2">Clique para expandir</span>
            </summary>
            <div className="mt-4">
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
          </details>
        </div>

        {/* Deputados Estaduais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Top 5 Deputados Estaduais Mais Votados</h2>
              <span className="text-sm text-gray-500 ml-2">Clique para expandir</span>
            </summary>
            <div className="mt-4">
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
          </details>
        </div>

        {/* Mídias Locais */}
        {/* Família do Prefeito (lista de membros) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Família do Prefeito</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddFamilia}
                  className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                  title="Adicionar membro da família"
                >
                  <Plus size={16} />
                </button>
              </div>
            </summary>
            <div className="mt-2">
              {familiaLista.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {familiaLista.map((m) => (
                    <div key={m.id} className="border rounded-lg p-3 bg-blue-50 relative">
                      {/* Ações: editar e excluir */}
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          onClick={() => handleOpenEditFamilia(m)}
                          className="bg-white border border-blue-200 text-psd-blue rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Editar ${m.nome || 'membro da família'}`}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteFamilia(m.id)}
                          className="bg-white border border-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Excluir ${m.nome || 'membro da família'}`}
                          title="Excluir"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{m.nome || 'Nome não informado'}</h4>
                            {m.tipo && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-200 text-blue-800">
{m.tipo === 'primeira_dama' ? 'Primeira dama(o)' : m.tipo === 'filho' ? 'Filho(a)' : m.tipo}
                              </span>
                            )}
                          </div>
                          {m.observacoes && (
                            <p className="text-sm text-gray-600 mt-1">{m.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm italic">Clique no botão + para adicionar membros da família</p>
                </div>
              )}
            </div>
          </details>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Mídias Locais</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddMidia}
                  className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-purple-700"
                  title="Adicionar mídia local (rádio/blog)"
                >
                  <Plus size={16} />
                </button>
              </div>
            </summary>
            <div className="mt-2">
              {midiasLocais.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {midiasLocais.map((midia) => (
                    <div key={midia.id} className="border rounded-lg p-3 bg-purple-50 relative">
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          onClick={() => alert('Funcionalidade de edição de mídias em desenvolvimento')}
                          className="bg-white border border-purple-200 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Editar ${midia.nome || 'mídia local'}`}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteMidiaLocal(midia.id)}
                          className="bg-white border border-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Excluir ${midia.nome || 'mídia local'}`}
                          title="Excluir"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{midia.nome || 'Nome não informado'}</h4>
                            {midia.tipo && (
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-200 text-purple-800">{midia.tipo}</span>
                            )}
                          </div>
                          {/* Link clicável */}
                          {midia.url && (
                            (() => {
                              const raw = String(midia.url).trim();
                              const isUrl = /^(https?:\/\/)/i.test(raw) || /^www\./i.test(raw) || /\.[a-z]{2,}$/i.test(raw);
                              const href = isUrl ? (raw.startsWith('http') ? raw : `https://${raw}`) : '';
                              return (
                                <div className="mt-1">
                                  {href ? (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline">
                                      {raw}
                                    </a>
                                  ) : (
                                    <p className="text-sm text-gray-600">Contato: {raw}</p>
                                  )}
                                </div>
                              );
                            })()
                          )}
                          {midia.observacoes && (
                            <p className="text-xs text-gray-500 italic mt-1">{midia.observacoes}</p>
                          )}
                        </div>
                      </div>
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
          </details>
        </div>

        {/* Banda B (Locais) — embaixo de Mídias Locais e acima de Lideranças */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Banda B</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddBandaBLocal}
                  className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                  title="Adicionar Banda B"
                >
                  <Plus size={16} />
                </button>
              </div>
            </summary>
            <div className="mt-2">
              {bandaBLocais && bandaBLocais.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bandaBLocais.map((b) => (
                    <div key={b.id} className="border rounded-lg p-3 bg-blue-50 relative">
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          onClick={() => handleOpenEditBandaBLocal(b)}
                          className="bg-white border border-blue-200 text-psd-blue rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Editar ${b.nome || 'Banda B'}`}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBandaBLocal(b.id)}
                          className="bg-white border border-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Excluir ${b.nome || 'Banda B'}`}
                          title="Excluir"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{b.nome || 'Nome não informado'}</h4>
            {b.partido && (
              <span
                className={`text-xs px-2 py-0.5 rounded ${partidoClass(b.partido)}`}
                style={partidoStyle(b.partido)}
              >
                {b.partido}
              </span>
            )}
                            {b.historico && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-200 text-yellow-800">{historicoLabel(b.historico)}</span>
                            )}
                          </div>
                          {typeof b.votos_recebidos === 'number' && (
                            <p className="text-sm text-gray-700">Votos: {b.votos_recebidos}</p>
                          )}
                          {b.observacoes && (
                            <p className="text-xs text-gray-500 italic mt-1">{b.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm italic">Clique no botão + para adicionar itens da Banda B</p>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Lideranças Locais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Lideranças Locais</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddLideranca}
                  className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                  title="Adicionar liderança"
                >
                  <Plus size={16} />
                </button>
              </div>
            </summary>
            <div className="mt-2">
              {liderancas && liderancas.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {liderancas.map((l) => (
                    <div key={l.id} className="border rounded-lg p-3 bg-blue-50 relative">
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          onClick={() => handleOpenEditLideranca(l)}
                          className="bg-white border border-blue-200 text-psd-blue rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Editar ${l.nome || 'liderança'}`}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLideranca(l.id)}
                          className="bg-white border border-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Excluir ${l.nome || 'liderança'}`}
                          title="Excluir"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{l.nome || 'Nome não informado'}</h4>
            {l.partido && (
              <span
                className={`text-xs px-2 py-0.5 rounded ${partidoClass(l.partido)}`}
                style={partidoStyle(l.partido)}
              >
                {l.partido}
              </span>
            )}
                            {l.historico && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-200 text-yellow-800">{l.historico}</span>
                            )}
                          </div>
                          {typeof l.votos_recebidos === 'number' && (
                            <p className="text-sm text-gray-700">Votos: {l.votos_recebidos}</p>
                          )}
                          {l.observacoes && (
                            <p className="text-xs text-gray-500 italic mt-1">{l.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm italic">Clique no botão + para adicionar lideranças locais</p>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Deputados Banda B (Federal/Estadual) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-psd-blue mb-0 text-center">Deputados Banda B</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddBandaB}
                  className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-purple-700"
                  title="Adicionar deputado Banda B"
                >
                  <Plus size={16} />
                </button>
              </div>
            </summary>
            <div className="mt-2">
              {bandaBPoliticos && bandaBPoliticos.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bandaBPoliticos.map((b) => (
                    <div key={b.id} className="border rounded-lg p-3 bg-purple-50 relative">
                      <div className="absolute right-3 top-3 flex gap-2">
                        <button
                          onClick={() => handleOpenEditBandaB(b)}
                          className="bg-white border border-purple-200 text-purple-800 rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Editar ${b.nome || 'deputado Banda B'}`}
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBandaB(b.id)}
                          className="bg-white border border-red-200 text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow"
                          aria-label={`Excluir ${b.nome || 'deputado Banda B'}`}
                          title="Excluir"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{b.nome || 'Nome não informado'}</h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-200 text-purple-800">
                              {b.esfera === 'estadual' ? 'Estadual' : 'Federal'}
                            </span>
            {b.partido && (
              <span
                className={`text-xs px-2 py-0.5 rounded ${partidoClass(b.partido)}`}
                style={partidoStyle(b.partido)}
              >
                {b.partido}
              </span>
            )}
                            {b.historico && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-200 text-yellow-800">{historicoLabel(b.historico)}</span>
                            )}
                          </div>
                          {typeof b.votos_recebidos === 'number' && (
                            <p className="text-sm text-gray-700">Votos: {b.votos_recebidos}</p>
                          )}
                          {b.observacoes && (
                            <p className="text-xs text-gray-500 italic mt-1">{b.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-sm italic">Clique no botão + para adicionar deputados Banda B</p>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Vereadores */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-psd-blue">Vereadores</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{vereadores.length} vereador(es) cadastrado(s)</span>
                {userNivel !== 1 && (
                  <button 
                    onClick={() => alert('Funcionalidade de adicionar vereadores em desenvolvimento.\n\nEm breve você poderá:\n• Adicionar novos vereadores\n• Definir partido e votos\n• Adicionar informações de contato\n• Incluir observações')}
                    className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-700"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                )}
              </div>
            </summary>
            <div className="mt-2">
              {/* Presidente da Câmara - mostra o presidente, partido e votos; edit abre modal agrupado */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 relative">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Presidente da Câmara</h3>

                <button
                  onClick={handleEditPresidente}
                  className="absolute right-4 top-6 bg-white border border-blue-200 text-psd-blue rounded-full w-8 h-8 flex items-center justify-center shadow"
                  aria-label="Editar Presidente da Câmara"
                >
                  <Edit size={14} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <h4 className="text-xs font-semibold text-gray-600">Nome</h4>
                    <div className="text-sm font-bold text-gray-900 mt-1">{municipio.presidente_camara || '—'}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <h4 className="text-xs font-semibold text-gray-600">Partido</h4>
            <div className="text-sm font-bold text-gray-900 mt-1">
              {municipio.presidente_camara_partido ? (
                <span
                  className={`px-2 py-0.5 rounded ${partidoClass(municipio.presidente_camara_partido)}`}
                  style={partidoStyle(municipio.presidente_camara_partido)}
                >
                  {municipio.presidente_camara_partido}
                </span>
              ) : (
                '—'
              )}
            </div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <h4 className="text-xs font-semibold text-gray-600">Votos (vereador)</h4>
                    <div className="text-sm font-bold text-gray-900 mt-1">{municipio.presidente_camara_votos_vereador || '—'}</div>
                  </div>
                </div>
              </div>
              {vereadores.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {vereadores.map((vereador) => (
                    <div key={vereador.id} className="border rounded-lg p-4 bg-yellow-50 relative">
                      {/* botões de ação (editar/excluir) */}
                      {userNivel !== 1 && (
                        <div className="absolute right-4 top-4 flex gap-2">
                          <button
                            onClick={() => handleOpenVereadorModal(vereador)}
                            className="bg-white border border-blue-200 text-psd-blue rounded-full w-8 h-8 flex items-center justify-center shadow"
                            aria-label={`Editar ${vereador.nome || 'vereador'}`}
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteVereador(vereador.id)}
                            className="bg-white border border-red-200 text-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow"
                            aria-label={`Excluir ${vereador.nome || 'vereador'}`}
                            title="Excluir"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{vereador.nome || 'Nome não informado'}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Partido: </span>
              {vereador.partido ? (
                <span
                  className={`text-xs px-2 py-0.5 rounded ${partidoClass(vereador.partido)}`}
                  style={partidoStyle(vereador.partido)}
                >
                  {vereador.partido}
                </span>
              ) : (
                '—'
              )}
            </p>
                        <p><span className="font-semibold">Votos: </span>{vereador.votos_recebidos || '—'}</p>
                        <p><span className="font-semibold">Deputado Apoiado: </span>{vereador.deputado_apoiado || '—'}</p>
                        <p><span className="font-semibold">Telefone: </span>{vereador.telefone || '—'}</p>
                        <p className="md:col-span-2"><span className="font-semibold">Observações: </span>{vereador.observacoes || '—'}</p>
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
          </details>
        </div>
      </div>

      {/* Modal para edição agrupada do Presidente da Câmara */}
      {editingField === 'presidente_camara_group' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">Editar Presidente da Câmara</h3>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              type="text"
              value={presidenteForm.nome}
              onChange={(e) => setPresidenteForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Partido</label>
            <input
              type="text"
              value={presidenteForm.partido}
              onChange={(e) => setPresidenteForm(prev => ({ ...prev, partido: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Votos (vereador)</label>
            <input
              type="text"
              value={presidenteForm.votos}
              onChange={(e) => setPresidenteForm(prev => ({ ...prev, votos: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Ex: 1234"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingField(null)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePresidente}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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

      {/* Modal para adicionar/editar Vice-Prefeito */}
      {showAddViceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">{editingVice ? 'Editar Vice-Prefeito' : 'Adicionar Vice-Prefeito'}</h3>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              type="text"
              value={viceForm.nome || ''}
              onChange={(e) => setViceForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Nome completo"
            />

            <label className="text-xs text-gray-600">Partido</label>
            <input
              type="text"
              value={viceForm.partido || ''}
              onChange={(e) => setViceForm(prev => ({ ...prev, partido: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Sigla do partido"
            />

            <label className="text-xs text-gray-600">Telefone</label>
            <input
              type="text"
              value={viceForm.telefone || ''}
              onChange={(e) => setViceForm(prev => ({ ...prev, telefone: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Ex: (71) 99999-9999"
            />

            <label className="text-xs text-gray-600">Histórico</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={viceForm.historico || ''}
              onChange={(e) => setViceForm(prev => ({ ...prev, historico: e.target.value as any }))}
            >
              <option value="">Selecione...</option>
              <option value="prefeito">Ex-prefeito(a)</option>
              <option value="candidato_perdeu">Não eleito(a)</option>
              <option value="vereador">Vereador(a)</option>
              <option value="lideranca">Liderança</option>
              <option value="outros">Outros</option>
              <option value="vice">Vice-prefeito(a)</option>
              <option value="vice_atual">Vice-prefeito(a) atual</option>
            </select>

            <label className="text-xs text-gray-600">Observações (opcional)</label>
            <textarea
              value={viceForm.observacoes || ''}
              onChange={(e) => setViceForm(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowAddViceModal(false); setEditingVice(null); }}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVicePrefeito}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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

      {/* Modal para edição agrupada da Família do Prefeito */}
      {editingField === 'familia_prefeito_group' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">Editar Família do Prefeito</h3>

            <label className="text-xs text-gray-600">Primeira-dama(o)</label>
            <input
              type="text"
              value={familiaForm.primeira_dama}
              onChange={(e) => setFamiliaForm(prev => ({ ...prev, primeira_dama: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Ex: Nome da primeira-dama(o)"
            />

            <label className="text-xs text-gray-600">Filhos do Prefeito</label>
            <input
              type="text"
              value={familiaForm.filhos_prefeito}
              onChange={(e) => setFamiliaForm(prev => ({ ...prev, filhos_prefeito: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Ex: Filho1, Filho2"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingField(null)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFamilia}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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
      {/* Modal para adicionar/editar Banda B (Locais) */}
      {showAddBandaBLocalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">{editingBandaBLocal ? 'Editar Banda B' : 'Adicionar Banda B'}</h3>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              type="text"
              value={bandaBLocalForm.nome || ''}
              onChange={(e) => setBandaBLocalForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Nome completo"
            />

            <label className="text-xs text-gray-600">Partido</label>
            <input
              type="text"
              value={bandaBLocalForm.partido || ''}
              onChange={(e) => setBandaBLocalForm(prev => ({ ...prev, partido: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Sigla do partido"
            />

            <label className="text-xs text-gray-600">Votos (opcional)</label>
            <input
              type="number"
              value={bandaBLocalForm.votos_recebidos ?? ''}
              onChange={(e) => setBandaBLocalForm(prev => ({ ...prev, votos_recebidos: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Ex: 1234"
            />

            <label className="text-xs text-gray-600">Histórico</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={bandaBLocalForm.historico || ''}
              onChange={(e) => setBandaBLocalForm(prev => ({ ...prev, historico: e.target.value as any }))}
            >
              <option value="">Selecione...</option>
              <option value="prefeito">Ex-prefeito(a)</option>
              <option value="candidato_perdeu">Não eleito(a)</option>
              <option value="vereador">Vereador(a)</option>
              <option value="vice">Vice-prefeito(a)</option>
              <option value="vice_atual">Vice-prefeito(a) atual</option>
            </select>

            <label className="text-xs text-gray-600">Observações (opcional)</label>
            <textarea
              value={bandaBLocalForm.observacoes || ''}
              onChange={(e) => setBandaBLocalForm(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowAddBandaBLocalModal(false); setEditingBandaBLocal(null); }}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBandaBLocal}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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
      {/* Modal para adicionar/editar Liderança */}
      {showAddLiderancaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">{editingLideranca ? 'Editar Liderança' : 'Adicionar Liderança'}</h3>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              type="text"
              value={liderancaForm.nome || ''}
              onChange={(e) => setLiderancaForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Nome completo"
            />

            <label className="text-xs text-gray-600">Partido</label>
            <input
              type="text"
              value={liderancaForm.partido || ''}
              onChange={(e) => setLiderancaForm(prev => ({ ...prev, partido: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Sigla do partido"
            />

            <label className="text-xs text-gray-600">Votos (opcional)</label>
            <input
              type="number"
              value={liderancaForm.votos_recebidos ?? ''}
              onChange={(e) => setLiderancaForm(prev => ({ ...prev, votos_recebidos: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Ex: 1234"
            />

            <label className="text-xs text-gray-600">Histórico</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={liderancaForm.historico || ''}
              onChange={(e) => setLiderancaForm(prev => ({ ...prev, historico: e.target.value as any }))}
            >
              <option value="">Selecione...</option>
              <option value="prefeito">Ex-prefeito(a)</option>
              <option value="candidato_perdeu">Não eleito(a)</option>
              <option value="vereador">Vereador(a)</option>
              <option value="vice">Vice-prefeito(a)</option>
              <option value="vice_atual">Vice-prefeito(a) atual</option>
            </select>

            <label className="text-xs text-gray-600">Observações (opcional)</label>
            <textarea
              value={liderancaForm.observacoes || ''}
              onChange={(e) => setLiderancaForm(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowAddLiderancaModal(false); setEditingLideranca(null); }}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLideranca}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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

      {/* Modal para adicionar/editar Deputado Banda B */}
      {showAddBandaBModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">{editingBandaB ? 'Editar Deputado Banda B' : 'Adicionar Deputado Banda B'}</h3>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              type="text"
              value={bandaBForm.nome || ''}
              onChange={(e) => setBandaBForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Nome completo"
            />

            <label className="text-xs text-gray-600">Esfera</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={bandaBForm.esfera || 'federal'}
              onChange={(e) => setBandaBForm(prev => ({ ...prev, esfera: e.target.value as any }))}
            >
              <option value="federal">Federal</option>
              <option value="estadual">Estadual</option>
            </select>

            <label className="text-xs text-gray-600">Partido</label>
            <input
              type="text"
              value={bandaBForm.partido || ''}
              onChange={(e) => setBandaBForm(prev => ({ ...prev, partido: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Sigla do partido"
            />

            <label className="text-xs text-gray-600">Votos (opcional)</label>
            <input
              type="number"
              value={bandaBForm.votos_recebidos ?? ''}
              onChange={(e) => setBandaBForm(prev => ({ ...prev, votos_recebidos: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Ex: 1234"
            />

            <label className="text-xs text-gray-600">Histórico</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={bandaBForm.historico || ''}
              onChange={(e) => setBandaBForm(prev => ({ ...prev, historico: e.target.value as any }))}
            >
              <option value="">Selecione...</option>
              <option value="prefeito">Ex-prefeito(a)</option>
              <option value="candidato_perdeu">Não eleito(a)</option>
              <option value="vereador">Vereador(a)</option>
              <option value="vice">Vice-prefeito(a)</option>
              <option value="vice_atual">Vice-prefeito(a) atual</option>
            </select>

            <label className="text-xs text-gray-600">Observações (opcional)</label>
            <textarea
              value={bandaBForm.observacoes || ''}
              onChange={(e) => setBandaBForm(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowAddBandaBModal(false); setEditingBandaB(null); }}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBandaB}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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

      {/* Modal para edição agrupada de Vereador */}
      {/* Modal para adicionar Mídia Local */}
      {showAddMidiaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">Adicionar Mídia Local</h3>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              type="text"
              value={midiaForm.nome}
              onChange={(e) => setMidiaForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Tipo (ex: Rádio, Blog)</label>
            <input
              type="text"
              value={midiaForm.tipo}
              onChange={(e) => setMidiaForm(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Link / Contato</label>
            <input
              type="text"
              value={midiaForm.url}
              onChange={(e) => setMidiaForm(prev => ({ ...prev, url: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="https://radioweb.com.br"
            />

            <label className="text-xs text-gray-600">Observações</label>
            <textarea
              value={midiaForm.observacoes}
              onChange={(e) => setMidiaForm(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddMidiaModal(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMidia}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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

      {/* Modal para adicionar membro da Família do Prefeito */}
      {showAddFamiliaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">{editingFamiliaItemId ? 'Editar Membro da Família' : 'Adicionar Membro da Família'}</h3>

            <label className="text-xs text-gray-600">Tipo</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={familiaItemForm.tipo}
              onChange={(e) => setFamiliaItemForm(prev => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="">Selecione...</option>
              <option value="primeira_dama">Primeira dama(o)</option>
              <option value="filho">Filho(a)</option>
              
            </select>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              className="w-full border rounded p-2 mb-3"
              placeholder="Nome completo"
              value={familiaItemForm.nome}
              onChange={(e) => setFamiliaItemForm(prev => ({ ...prev, nome: e.target.value }))}
            />

            <label className="text-xs text-gray-600">Observações (opcional)</label>
            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Ex.: profissão, forma de contato, observações"
              value={familiaItemForm.observacoes}
              onChange={(e) => setFamiliaItemForm(prev => ({ ...prev, observacoes: e.target.value }))}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800"
                onClick={() => setShowAddFamiliaModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#2ecc71' }}
                onClick={handleSaveFamiliaItem}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin inline-block rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
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

      {/* Modal para adicionar/editar Emenda/Programa */}
      {showAddProgramaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">{editingPrograma ? 'Editar Emenda/Programa' : 'Adicionar Emenda/Programa'}</h3>

            <label className="text-xs text-gray-600">Esfera</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={programaForm.esfera}
              onChange={(e) => {
                const esfera = e.target.value as 'estadual' | 'federal';
                // reset órgão ao trocar esfera
                setProgramaForm(prev => ({ ...prev, esfera, orgao_sigla: '', orgao_nome: '', area: '' }));
              }}
            >
              <option value="estadual">Estadual</option>
              <option value="federal">Federal</option>
            </select>

            <label className="text-xs text-gray-600">Tipo de Parlamentar</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={programaForm.parlamentar_tipo}
              onChange={(e) => setProgramaForm(prev => ({ ...prev, parlamentar_tipo: e.target.value as any }))}
            >
              <option value="deputado_estadual">Deputado Estadual</option>
              <option value="deputado_federal">Deputado Federal</option>
              <option value="senador">Senador</option>
            </select>

            <label className="text-xs text-gray-600">Nome do Parlamentar</label>
            <input
              className="w-full border rounded p-2 mb-3"
              placeholder="Nome completo"
              value={programaForm.parlamentar_nome}
              onChange={(e) => setProgramaForm(prev => ({ ...prev, parlamentar_nome: e.target.value }))}
            />

            <label className="text-xs text-gray-600">Órgão</label>
            <select
              className="w-full border rounded p-2 mb-2"
              value={programaForm.orgao_sigla}
              onChange={(e) => {
                const sigla = e.target.value;
                if (!sigla) {
                  setProgramaForm(prev => ({ ...prev, orgao_sigla: '', orgao_nome: '', area: '' }));
                  return;
                }
                const lista = programaForm.esfera === 'estadual' ? SECRETARIAS_ESTADUAIS : MINISTERIOS_FEDERAIS;
                const orgao = lista.find(o => o.sigla === sigla);
                setProgramaForm(prev => ({ ...prev, orgao_sigla: sigla, orgao_nome: orgao?.nome || '', area: orgao?.area || '' }));
              }}
            >
              <option value="">Selecione...</option>
              {(programaForm.esfera === 'estadual' ? SECRETARIAS_ESTADUAIS : MINISTERIOS_FEDERAIS).map((o) => (
                <option key={o.sigla} value={o.sigla}>{o.sigla} — {o.nome}</option>
              ))}
            </select>
            {programaForm.area && (
              <p className="text-xs text-gray-500 mb-2">Área: {programaForm.area}</p>
            )}

            <label className="text-xs text-gray-600">Observações (opcional)</label>
            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Ex.: descrição da emenda, status, detalhes"
              value={programaForm.observacoes}
              onChange={(e) => setProgramaForm(prev => ({ ...prev, observacoes: e.target.value }))}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800"
                onClick={() => { setShowAddProgramaModal(false); setEditingPrograma(null); }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                onClick={editingPrograma ? handleUpdatePrograma : handleSavePrograma}
                disabled={isSaving}
              >
                {isSaving ? (editingPrograma ? 'Atualizando...' : 'Salvando...') : (editingPrograma ? 'Atualizar' : 'Salvar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para excluir Emenda/Programa */}
      {showDeleteProgramaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-red-600 mb-4">Excluir Emenda/Programa</h3>
            <p className="text-sm text-gray-700 mb-4">
              Tem certeza que deseja excluir
              {` `}
              <span className="font-semibold">{programaToDelete?.parlamentar_nome || 'este item'}</span>?
              {` `}
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800"
                onClick={() => { setShowDeleteProgramaModal(false); setProgramaToDelete(null); }}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleDeletePrograma}
                disabled={isSaving}
              >
                {isSaving ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
      {editingVereador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-psd-blue mb-4">Editar Vereador</h3>

            <label className="text-xs text-gray-600">Nome</label>
            <input
              type="text"
              value={vereadorForm.nome}
              onChange={(e) => setVereadorForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Partido</label>
            <input
              type="text"
              value={vereadorForm.partido}
              onChange={(e) => setVereadorForm(prev => ({ ...prev, partido: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Votos</label>
            <input
              type="text"
              value={vereadorForm.votos_recebidos}
              onChange={(e) => setVereadorForm(prev => ({ ...prev, votos_recebidos: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Deputado Apoiado</label>
            <input
              type="text"
              value={vereadorForm.deputado_apoiado}
              onChange={(e) => setVereadorForm(prev => ({ ...prev, deputado_apoiado: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Telefone</label>
            <input
              type="text"
              value={vereadorForm.telefone}
              onChange={(e) => setVereadorForm(prev => ({ ...prev, telefone: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <label className="text-xs text-gray-600">Observações</label>
            <textarea
              value={vereadorForm.observacoes}
              onChange={(e) => setVereadorForm(prev => ({ ...prev, observacoes: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingVereador(null)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVereador}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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

      {/* Modal de Edição (individual) */}
      {editingField && editingField !== 'presidente_camara_group' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-psd-blue mb-4">
              Editar {editingField === 'populacao' ? 'População' : 
                     editingField === 'eleitores' ? 'Eleitores' :
                     editingField === 'data_emancipacao' ? 'Data de Emancipação' :
                     (editingField === 'data_aniversario' || editingField === 'aniversario') ? 'Data de Aniversário' :
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
                           (editingField === 'data_aniversario' || editingField === 'aniversario') ? 'Ex: 11 de julho' :
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