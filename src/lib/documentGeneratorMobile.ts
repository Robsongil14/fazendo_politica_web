import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';

interface MunicipioData {
  municipio: string;
  prefeito?: string;
  partido?: string;
  votos_recebidos?: string;
  porcentagem_votacao?: number;
  foto_prefeito?: string;
  instagram_prefeito?: string;
  instagram_prefeitura?: string;
  candidatos?: Array<{
    nome: string;
    partido: string;
    votos: number;
    porcentagem: number;
    posicao: number;
  }>;
  transferencias?: {
    valor_total: number;
    valor_total_empenhado: number;
    total_transferencias: number;
    por_ministerio: { [key: string]: number };
    por_situacao: { [key: string]: number };
  };
}

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
  if (num > 0 && num <= 1) return num * 100;
  return num;
};

export const generateMunicipioDocumentMobile = async (data: MunicipioData) => {
  try {
    const segundoColocado = data.candidatos?.find(c => c.posicao === 2);
    const terceiroColocado = data.candidatos?.find(c => c.posicao === 3);

    let votosFormatados = 'Não informado';
    if (data.votos_recebidos != null) {
      try {
        const votos = parseIntSafe(data.votos_recebidos);
        const porcentagem = normalizePercent(data.porcentagem_votacao || 0);
        votosFormatados = `${votos.toLocaleString('pt-BR')} votos (${porcentagem.toFixed(2)}%)`;
      } catch (e) {
        const fallback = typeof data.votos_recebidos === 'string' ? data.votos_recebidos : String(data.votos_recebidos);
        votosFormatados = fallback;
      }
    }

    let segundoColocadoTexto = 'Não informado';
    if (segundoColocado) {
      try {
        const pct2 = normalizePercent(segundoColocado.porcentagem);
        const votos2 = typeof segundoColocado.votos === 'number' ? segundoColocado.votos : parseIntSafe(segundoColocado.votos as any);
        segundoColocadoTexto = `2º lugar – ${segundoColocado.nome} (${segundoColocado.partido}) ${votos2.toLocaleString('pt-BR')} votos (${pct2.toFixed(2)}%)`;
      } catch {
        segundoColocadoTexto = `2º lugar – ${segundoColocado.nome}`;
      }
    }

    let terceiroColocadoTexto = 'Não informado';
    if (terceiroColocado) {
      try {
        const pct3 = normalizePercent(terceiroColocado.porcentagem);
        const votos3 = typeof terceiroColocado.votos === 'number' ? terceiroColocado.votos : parseIntSafe(terceiroColocado.votos as any);
        terceiroColocadoTexto = `3º lugar – ${terceiroColocado.nome} (${terceiroColocado.partido}) ${votos3.toLocaleString('pt-BR')} votos (${pct3.toFixed(2)}%)`;
      } catch {
        terceiroColocadoTexto = `3º lugar – ${terceiroColocado.nome}`;
      }
    }

    let recursosTexto = 'Não informado';
    if (data.transferencias?.valor_total) {
      try {
        recursosTexto = `R$ ${data.transferencias.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em ${data.transferencias.total_transferencias} transferências`;
      } catch {
        recursosTexto = `R$ ${data.transferencias.valor_total}`;
      }
    }

    const transferenciasDetalhadas: Paragraph[] = [];
    if (data.transferencias) {
      if (data.transferencias.valor_total_empenhado) {
        transferenciasDetalhadas.push(
          new Paragraph({
            children: [
              new TextRun({ text: '  • Valor Total Empenhado: ', bold: true, size: 22 }),
              new TextRun({ text: `R$ ${data.transferencias.valor_total_empenhado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, size: 22 })
            ],
            spacing: { after: 150 }
          })
        );
      }
      if (data.transferencias.por_ministerio && Object.keys(data.transferencias.por_ministerio).length > 0) {
        transferenciasDetalhadas.push(new Paragraph({ children: [new TextRun({ text: '  • Por Ministério:', bold: true, size: 22 })], spacing: { after: 100 } }));
        Object.entries(data.transferencias.por_ministerio).forEach(([ministerio, valor]) => {
          transferenciasDetalhadas.push(
            new Paragraph({
              children: [
                new TextRun({ text: `    - ${ministerio}: `, size: 20 }),
                new TextRun({ text: `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, size: 20, bold: true })
              ],
              spacing: { after: 100 }
            })
          );
        });
      }
      if (data.transferencias.por_situacao && Object.keys(data.transferencias.por_situacao).length > 0) {
        transferenciasDetalhadas.push(new Paragraph({ children: [new TextRun({ text: '  • Por Situação:', bold: true, size: 22 })], spacing: { after: 100, before: 200 } }));
        Object.entries(data.transferencias.por_situacao).forEach(([situacao, valor]) => {
          transferenciasDetalhadas.push(
            new Paragraph({
              children: [
                new TextRun({ text: `    - ${situacao}: `, size: 20 }),
                new TextRun({ text: `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, size: 20, bold: true })
              ],
              spacing: { after: 100 }
            })
          );
        });
      }
    }

    let fotoPrefeitoImageRun: ImageRun | null = null;
    if (data.foto_prefeito) {
      try {
        const resp = await fetch(data.foto_prefeito);
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          fotoPrefeitoImageRun = new ImageRun({ data: uint8, transformation: { width: 180, height: 180 } });
        }
      } catch {
        // Ignorar falha de imagem
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'DADOS DO MUNICÍPIO', bold: true, size: 32, color: '0065BD' })],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...(fotoPrefeitoImageRun ? [new Paragraph({ children: [fotoPrefeitoImageRun], alignment: AlignmentType.CENTER, spacing: { after: 200 } })] : []),
            new Paragraph({ children: [new TextRun({ text: `${data.municipio}`, bold: true, size: 28 })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
            new Paragraph({ children: [new TextRun({ text: `Prefeito: ${data.prefeito || 'Não informado'}`, size: 24 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `Partido: ${data.partido || 'Não informado'}`, size: 24 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `Votação: ${votosFormatados}`, size: 24 })], spacing: { after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: segundoColocadoTexto, size: 22 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: terceiroColocadoTexto, size: 22 })], spacing: { after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: 'Recursos Recebidos:', bold: true, size: 26 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: recursosTexto, size: 22 })], spacing: { after: 150 } }),
            ...transferenciasDetalhadas,
          ]
        }
      ]
    });

    // Gerar buffer do DOCX
    const buffer = await Packer.toBuffer(doc);
    const base64 = Buffer.from(buffer).toString('base64');

    // Caminho para salvar temporariamente no dispositivo
    const fileName = `Municipio_${data.municipio.replace(/\s+/g, '_')}.docx`;
    const fileUri = FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}${fileName}` : `${FileSystem.documentDirectory}${fileName}`;

    // Gravar arquivo no sistema
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });

    // Compartilhar arquivo
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, { dialogTitle: 'Compartilhar documento do município' });
    }

    return fileUri;
  } catch (e) {
    console.error('Erro ao gerar documento no mobile:', e);
    return null;
  }
};