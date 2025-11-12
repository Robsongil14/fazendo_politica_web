import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

interface MunicipioData {
  municipio: string;
  prefeito?: string;
  partido?: string;
  votos_recebidos?: string;
  porcentagem_votacao?: number;
  foto_prefeito?: string;
  instagram_prefeito?: string;
  instagram_prefeitura?: string;
  // Dados dos candidatos (para mostrar 2º lugar)
  candidatos?: Array<{
    nome: string;
    partido: string;
    votos: number;
    porcentagem: number;
    posicao: number;
  }>;
  // Transferências governamentais
  transferencias?: {
    valor_total: number;
    valor_total_empenhado: number;
    total_transferencias: number;
    por_ministerio: { [key: string]: number };
    por_situacao: { [key: string]: number };
  };
}

export const generateMunicipioDocument = async (data: MunicipioData) => {
  try {
    console.log('Dados recebidos para gerar documento:', data);
    
    // Helpers para parse/normalização
    const parseIntSafe = (val: any): number => {
      if (typeof val === 'number') return Math.round(val);
      if (typeof val === 'string') {
        const onlyDigits = val.replace(/[^\d]/g, '');
        return Number(onlyDigits || '0');
      }
      return 0;
    };

    const normalizePercent = (val: any): number => {
      let num: number | null = null;
      if (typeof val === 'number') {
        num = val;
      } else if (typeof val === 'string') {
        const cleaned = val.replace('%', '').replace(',', '.').trim();
        const parsed = parseFloat(cleaned);
        if (Number.isFinite(parsed)) num = parsed;
      }
      if (num === null) return 0;
      // Se veio entre 0 e 1, tratar como fração e converter para %
      if (num > 0 && num <= 1) return num * 100;
      return num;
    };

    // Encontrar o segundo colocado
    const segundoColocado = data.candidatos?.find(c => c.posicao === 2);
    // Encontrar o terceiro colocado
    const terceiroColocado = data.candidatos?.find(c => c.posicao === 3);
    
    // Formatação dos votos com verificação de segurança
    let votosFormatados = 'Não informado';
    if (data.votos_recebidos != null) {
      try {
        const votos = parseIntSafe(data.votos_recebidos);
        const porcentagem = normalizePercent(data.porcentagem_votacao || 0);
        votosFormatados = `${votos.toLocaleString('pt-BR')} votos (${porcentagem.toFixed(2)}%)`;
      } catch (e) {
        console.error('Erro ao formatar votos:', e);
        const fallback = typeof data.votos_recebidos === 'string' ? data.votos_recebidos : String(data.votos_recebidos);
        votosFormatados = fallback;
      }
    }
    
    // Formatação do segundo colocado com verificação de segurança
    let segundoColocadoTexto = 'Não informado';
    if (segundoColocado) {
      try {
        const pct2 = normalizePercent(segundoColocado.porcentagem);
        const votos2 = typeof segundoColocado.votos === 'number'
          ? segundoColocado.votos
          : parseIntSafe(segundoColocado.votos as any);
        segundoColocadoTexto = `2º lugar – ${segundoColocado.nome} (${segundoColocado.partido}) ${votos2.toLocaleString('pt-BR')} votos (${pct2.toFixed(2)}%)`;
      } catch (e) {
        console.error('Erro ao formatar segundo colocado:', e);
        segundoColocadoTexto = `2º lugar – ${segundoColocado.nome}`;
      }
    }

    // Formatação do terceiro colocado com verificação de segurança
    let terceiroColocadoTexto = 'Não informado';
    if (terceiroColocado) {
      try {
        const pct3 = normalizePercent(terceiroColocado.porcentagem);
        const votos3 = typeof terceiroColocado.votos === 'number'
          ? terceiroColocado.votos
          : parseIntSafe(terceiroColocado.votos as any);
        terceiroColocadoTexto = `3º lugar – ${terceiroColocado.nome} (${terceiroColocado.partido}) ${votos3.toLocaleString('pt-BR')} votos (${pct3.toFixed(2)}%)`;
      } catch (e) {
        console.error('Erro ao formatar terceiro colocado:', e);
        terceiroColocadoTexto = `3º lugar – ${terceiroColocado.nome}`;
      }
    }

    // Formatação do valor das transferências com verificação de segurança
    let recursosTexto = 'Não informado';
    if (data.transferencias?.valor_total) {
      try {
        recursosTexto = `R$ ${data.transferencias.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em ${data.transferencias.total_transferencias} transferências`;
      } catch (e) {
        console.error('Erro ao formatar transferências:', e);
        recursosTexto = `R$ ${data.transferencias.valor_total}`;
      }
    }

    // Função para criar linha em branco
    const criarLinhaEmBranco = () => new Paragraph({
      children: [new TextRun({ text: "_".repeat(80), color: "CCCCCC" })],
      spacing: { after: 200 }
    });

    // Preparar dados detalhados das transferências
    const transferenciasDetalhadas = [];
    
    if (data.transferencias) {
      // Valor total empenhado
      if (data.transferencias.valor_total_empenhado) {
        transferenciasDetalhadas.push(
          new Paragraph({
            children: [
              new TextRun({ text: "  • Valor Total Empenhado: ", bold: true, size: 22 }),
              new TextRun({ 
                text: `R$ ${data.transferencias.valor_total_empenhado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                size: 22 
              })
            ],
            spacing: { after: 150 }
          })
        );
      }

      // Por ministério
      if (data.transferencias.por_ministerio && Object.keys(data.transferencias.por_ministerio).length > 0) {
        transferenciasDetalhadas.push(
          new Paragraph({
            children: [new TextRun({ text: "  • Por Ministério:", bold: true, size: 22 })],
            spacing: { after: 100 }
          })
        );
        
        Object.entries(data.transferencias.por_ministerio).forEach(([ministerio, valor]) => {
          transferenciasDetalhadas.push(
            new Paragraph({
              children: [
                new TextRun({ text: `    - ${ministerio}: `, size: 20 }),
                new TextRun({ 
                  text: `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                  size: 20, 
                  bold: true 
                })
              ],
              spacing: { after: 100 }
            })
          );
        });
      }

      // Por situação
      if (data.transferencias.por_situacao && Object.keys(data.transferencias.por_situacao).length > 0) {
        transferenciasDetalhadas.push(
          new Paragraph({
            children: [new TextRun({ text: "  • Por Situação:", bold: true, size: 22 })],
            spacing: { after: 100, before: 200 }
          })
        );
        
        Object.entries(data.transferencias.por_situacao).forEach(([situacao, valor]) => {
          transferenciasDetalhadas.push(
            new Paragraph({
              children: [
                new TextRun({ text: `    - ${situacao}: `, size: 20 }),
                new TextRun({ 
                  text: `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                  size: 20, 
                  bold: true 
                })
              ],
              spacing: { after: 100 }
            })
          );
        });
      }
    }

    // Tentar carregar a foto do prefeito (se houver)
    let fotoPrefeitoImageRun: ImageRun | null = null;
    if (data.foto_prefeito) {
      try {
        const resp = await fetch(data.foto_prefeito);
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          fotoPrefeitoImageRun = new ImageRun({
            data: uint8,
            type: 'png',
            transformation: {
              width: 180,
              height: 180,
            },
          });
        } else {
          console.warn('Não foi possível carregar a foto do prefeito para o documento:', resp.status);
        }
      } catch (e) {
        console.warn('Falha ao buscar a foto do prefeito:', e);
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Título do documento
            new Paragraph({
              children: [
                new TextRun({
                  text: "DADOS DO MUNICÍPIO",
                  bold: true,
                  size: 32,
                  color: "0065BD", // Azul PSD
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),

            // Foto do Prefeito (ou espaço em branco quando não disponível)
            ...(fotoPrefeitoImageRun
              ? [
                  new Paragraph({
                    children: [fotoPrefeitoImageRun],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                  }),
                ]
              : [
                  new Paragraph({
                    children: [new TextRun({ text: "", size: 20 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                  }),
                ]),

            // Nome do prefeito
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Nome: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: data.prefeito || "Não informado",
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Linhas em branco para dados adicionais
            criarLinhaEmBranco(),
            criarLinhaEmBranco(),

            // Cidade
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Cidade: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: data.municipio,
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Cargo
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Cargo: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "Prefeito",
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Partido (movido para logo abaixo de Cargo)
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Partido: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: data.partido || "Não informado",
                  size: 24,
                  color: "0065BD", // Azul PSD
                  bold: true,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Votação
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Votação: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: votosFormatados,
                  size: 24,
                  underline: {},
                }),
              ],
              spacing: {
                after: 100,
              },
            }),

            // Segundo colocado (indentado)
            new Paragraph({
              children: [
                new TextRun({
                  text: `  ${segundoColocadoTexto}`,
                  size: 22,
                  italics: true,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Terceiro colocado (indentado) – apenas se existir
            ...(terceiroColocado
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `  ${terceiroColocadoTexto}`,
                        size: 22,
                        italics: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]
              : []),


            // Linhas em branco para dados adicionais
            criarLinhaEmBranco(),
            criarLinhaEmBranco(),

            // Recursos para o município - Título
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Recursos para o município:",
                  bold: true,
                  size: 24,
                  color: "0065BD",
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Resumo das transferências
            new Paragraph({
              children: [
                new TextRun({
                  text: "  • Resumo: ",
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: recursosTexto,
                  size: 22,
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Dados detalhados das transferências
            ...transferenciasDetalhadas,

            // Linhas em branco para dados adicionais
            criarLinhaEmBranco(),
            criarLinhaEmBranco(),

            // Instagram
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Instagram: ",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: data.instagram_prefeito || data.instagram_prefeitura || "Não informado",
                  size: 24,
                  color: "E4405F", // Cor do Instagram
                }),
              ],
              spacing: {
                after: 200,
              },
            }),

            // Seção para dados adicionais
            new Paragraph({
              children: [
                new TextRun({
                  text: "• Dados Adicionais:",
                  bold: true,
                  size: 24,
                  color: "0065BD",
                }),
              ],
              spacing: {
                after: 200,
                before: 400,
              },
            }),

            // Múltiplas linhas em branco para preenchimento manual
            criarLinhaEmBranco(),
            criarLinhaEmBranco(),
            criarLinhaEmBranco(),
            criarLinhaEmBranco(),
            criarLinhaEmBranco(),

            // Rodapé
            new Paragraph({
              children: [
                new TextRun({
                  text: "Documento gerado automaticamente pelo Sistema Fazendo Política",
                  size: 18,
                  italics: true,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 600,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Data de geração: ${new Date().toLocaleDateString('pt-BR')}`,
                  size: 16,
                  italics: true,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    });

    // Gerar e baixar o documento
    const blob = await Packer.toBlob(doc);
    const fileName = `dados_municipio_${data.municipio.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.docx`;
    
    saveAs(blob, fileName);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
    return false;
  }
};