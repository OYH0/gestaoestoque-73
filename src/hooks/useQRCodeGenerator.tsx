import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { toast } from '@/hooks/use-toast';

export interface QRCodeData {
  id: string;
  nome: string;
  categoria: string;
  tipo: 'CF' | 'ES' | 'DESC';
  lote?: string;
  unidade?: string;
  fornecedor?: string;
  data_entrada?: string;
  data_validade?: string;
  preco_unitario?: number;
}

// Atualiza para nova logo enviada pelo usuário
const LOGO_URL = '/lovable-uploads/041b3ef8-3841-4053-8434-b637c0a3f68c.png';

export function useQRCodeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCodeId = (tipo: 'CF' | 'ES' | 'DESC', itemId: string, index: number) => {
    const timestamp = Date.now().toString().slice(-6);
    return `${tipo}-${itemId.slice(-8)}-${timestamp}-${index.toString().padStart(3, '0')}`;
  };

  const generateQRCodeData = (item: any, tipo: 'CF' | 'ES' | 'DESC', quantidade: number): QRCodeData[] => {
    console.log('🚀 === INÍCIO generateQRCodeData ===');
    console.log('📦 Item recebido:', item);
    console.log('🏷️ Tipo:', tipo);
    console.log('🔢 Quantidade solicitada:', quantidade);
    console.log('📊 Tipo da quantidade:', typeof quantidade);
    
    // GARANTIR que quantidade seja um número inteiro válido
    let quantidadeValidada: number;
    
    if (typeof quantidade === 'string') {
      quantidadeValidada = parseInt(quantidade, 10);
    } else if (typeof quantidade === 'number') {
      quantidadeValidada = Math.floor(quantidade);
    } else {
      quantidadeValidada = 0;
    }
    
    console.log('✅ Quantidade após validação:', quantidadeValidada);
    console.log('🔍 É um número válido?', !isNaN(quantidadeValidada) && quantidadeValidada > 0);
    
    if (isNaN(quantidadeValidada) || quantidadeValidada <= 0) {
      console.error('❌ ERRO: Quantidade inválida ou zero!', quantidadeValidada);
      return [];
    }
    
    const qrCodes: QRCodeData[] = [];
    
    console.log('🔄 Iniciando loop para gerar QR codes...');
    console.log(`🎯 DEVE GERAR EXATAMENTE ${quantidadeValidada} QR codes`);
    
    for (let i = 1; i <= quantidadeValidada; i++) {
      const qrCodeId = generateQRCodeId(tipo, item.id, i);
      // ATENÇÃO: nome precisa ser sequencial (test 1, test 2, ...), não "test 10" para todos!
      const qrCodeData: QRCodeData = {
        id: qrCodeId,
        nome: `${item.nome?.trim?.() || ''} ${i}`, // CORRIGIDO: cada etiqueta tem nome sequencial!
        categoria: item.categoria || '',
        tipo,
        lote: item.lote || `${new Date().toISOString().split('T')[0]}-${i.toString().padStart(3, '0')}`,
        unidade: item.unidade || (item.unidade_item ? item.unidade_item : ''), // usa unidade preferencialmente
        fornecedor: item.fornecedor || '',
        data_entrada: item.data_entrada || '',
        data_validade: item.data_validade || '',
        preco_unitario: item.preco_unitario,
      };
      
      qrCodes.push(qrCodeData);
      console.log(`✅ QR Code ${i}/${quantidadeValidada} criado:`, qrCodeId, 'Nome:', qrCodeData.nome);
    }
    
    console.log('🏁 === VERIFICAÇÃO FINAL ===');
    console.log('📋 Quantidade solicitada:', quantidadeValidada);
    console.log('📦 QR codes criados:', qrCodes.length);
    console.log('🎯 Corresponde?:', qrCodes.length === quantidadeValidada ? '✅ SIM' : '❌ NÃO');
    console.log('📝 Lista completa de nomes:', qrCodes.map(qr => qr.nome));
    console.log('🚀 === FIM generateQRCodeData ===');
    
    return qrCodes;
  };

  // Novas dimensões: 95,2mm x 50,8mm (padrão Avery 5260 / etiqueta tipo mailing horizontal)
  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    setIsGenerating(true);

    // Conversão mm para pontos
    const MM_TO_PT = 2.83465;
    const labelWidthMM = 95.2;
    const labelHeightMM = 50.8;
    const labelWidth = labelWidthMM * MM_TO_PT; // ~270 pt
    const labelHeight = labelHeightMM * MM_TO_PT; // ~144 pt

    // Margens internas do layout
    const marginX = 16;
    const marginY = 10;
    const spacingX = 10; // espaçamento horizontal entre etiquetas
    const spacingY = 10; // espaçamento vertical entre etiquetas

    // Usaremos orientação landscape numa folha A4
    const pageWidth = 297 * MM_TO_PT;  // A4 landscape: 297mm
    const pageHeight = 210 * MM_TO_PT; // A4 landscape: 210mm

    // Calcular quantas cabem por folha
    const columns = Math.max(1, Math.floor((pageWidth + spacingX) / (labelWidth + spacingX))); // horizontal
    const rows = Math.max(1, Math.floor((pageHeight + spacingY) / (labelHeight + spacingY))); // vertical
    const labelsPerPage = columns * rows;

    // Carregar logo (usando blob DataURL)
    let logoImage: string | undefined = undefined;
    try {
      const resp = await fetch(LOGO_URL);
      if (resp.ok) {
        const blob = await resp.blob();
        logoImage = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      logoImage = undefined;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const labelIdxInPage = i % labelsPerPage;

        // Add página se necessário (não na primeira)
        if (i !== 0 && labelIdxInPage === 0) {
          pdf.addPage();
        }

        // Calcula posição da etiqueta na folha
        const row = Math.floor(labelIdxInPage / columns);
        const col = labelIdxInPage % columns;
        const x = col * (labelWidth + spacingX) + spacingX / 2;
        const y = row * (labelHeight + spacingY) + spacingY / 2;

        // Desenha borda leve para referência de corte (opcional)
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.7);
        pdf.rect(x, y, labelWidth, labelHeight);

        // Layout principal:
        // >> À esquerda: logo + nome + data
        // >> À direita: QR Code

        // --- Bloco da logo ---
        const logoBoxWidth = labelWidth * 0.38; // Cerca de 38% para logo/textos
        const qrBoxWidth = labelWidth - logoBoxWidth;

        let currY = y + marginY;

        // Desenha logo centralizado no bloco esquerdo
        if (logoImage) {
          try {
            // logo altura ~40pt, centrada horizontalmente
            const logoWidth = logoBoxWidth - 12;
            const logoHeight = 40;
            const logoX = x + (logoBoxWidth - logoWidth) / 2;
            pdf.addImage(logoImage, 'PNG', logoX, currY, logoWidth, logoHeight, undefined, 'FAST');
            currY += logoHeight + 6;
          } catch { /* falha em adicionar imagem não quebra */ }
        } else {
          currY += 50;
        }

        // Nome do produto (em negrito, centralizado)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14.5);
        pdf.text(
          qrData.nome?.length > 30 ? qrData.nome.slice(0, 30) + '...' : qrData.nome,
          x + logoBoxWidth / 2,
          currY + 8,
          { align: 'center', baseline: 'middle' }
        );
        currY += 19;

        // Data de validade
        if (qrData.data_validade) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11.5);
          pdf.text(
            `Validade: ${new Date(qrData.data_validade).toLocaleDateString('pt-BR')}`,
            x + logoBoxWidth / 2,
            currY + 8,
            { align: 'center', baseline: 'middle' }
          );
          currY += 16;
        }

        // Removido: Categoria do item.
        // Removido: Unidade juazeiro_norte.

        // Unidade (p.e. Kg, pacote...), exceto se contém "juazeiro_norte"
        if (qrData.unidade && qrData.unidade !== 'juazeiro_norte') {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(10);
          pdf.text(
            qrData.unidade,
            x + logoBoxWidth / 2,
            currY + 6,
            { align: 'center', baseline: 'middle' }
          );
          currY += 13;
        }

        // Fornecedor (opcional, pequenino)
        if (qrData.fornecedor) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(
            qrData.fornecedor,
            x + logoBoxWidth / 2,
            currY + 6,
            { align: 'center', baseline: 'middle' }
          );
          currY += 10;
        }

        // --- QR code à direita ---
        // Proporcional ao bloco disponível
        const qrSide = Math.min(qrBoxWidth - 2 * marginX, labelHeight - 18);

        const qrX = x + logoBoxWidth + (qrBoxWidth - qrSide) / 2;
        const qrY = y + (labelHeight - qrSide) / 2;

        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: qrSide,
          margin: 0,
        });
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSide, qrSide);

        // Pequeno ID abaixo do QR (ajuda rastreio)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(50, 60, 150);
        pdf.text(
          `#${qrData.id.slice(-6).toUpperCase()}`,
          x + logoBoxWidth + qrBoxWidth / 2,
          qrY + qrSide + 11,
          { align: 'center' }
        );
        pdf.setTextColor(0, 0, 0);
      }

      setIsGenerating(false);

      const mainNome = qrCodes[0]?.nome?.split(' ')[0] || 'etiqueta';
      const fileName = `etiquetas-qrcode-${mainNome}-${qrCodes.length}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF gerado no novo padrão",
        description: `Suas etiquetas de ${labelWidthMM}x${labelHeightMM}mm (${columns}x${rows} por folha) estão prontas!`,
      });
      return { success: true };
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Erro ao gerar etiquetas",
        description: "Ocorreu um problema ao gerar as etiquetas.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  return {
    generateQRCodeData,
    generateQRCodePDF,
    isGenerating,
  };
}
