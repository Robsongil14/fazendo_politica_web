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
    
    // Encontrar o segundo colocado
    const segundoColocado = data.candidatos?.find(c => c.posicao === 2);
    
    // Formatação dos votos com verificação de segurança
    let votosFormatados = 'Não informado';
    if (data.votos_recebidos) {
      try {
        const votos = parseInt(data.votos_recebidos.toString());
        const porcentagem = data.porcentagem_votacao || 0;
        votosFormatados = `${votos.toLocaleString('pt-BR')} votos (${porcentagem}%)`;
      } catch (e) {
        console.error('Erro ao formatar votos:', e);
        votosFormatados = data.votos_recebidos.toString();
      }
    }
    
    // Formatação do segundo colocado com verificação de segurança
    let segundoColocadoTexto = 'Não informado';
    if (segundoColocado) {
      try {
        segundoColocadoTexto = `2º lugar – ${segundoColocado.nome} (${segundoColocado.partido}) ${segundoColocado.votos.toLocaleString('pt-BR')} votos (${segundoColocado.porcentagem}%)`;
      } catch (e) {
        console.error('Erro ao formatar segundo colocado:', e);
        segundoColocadoTexto = `2º lugar – ${segundoColocado.nome}`;
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

            // Partido
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