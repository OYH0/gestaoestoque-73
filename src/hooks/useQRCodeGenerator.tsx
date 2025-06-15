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
}

const LOGO_URL = '/churrasco-logo.png'; // deve estar em public/churrasco-logo.png

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
      const qrCodeData = {
        id: qrCodeId,
        nome: `${item.nome.trim()} ${i}`, // CORRIGIDO: cada etiqueta tem nome sequencial!
        categoria: item.categoria,
        tipo,
        lote: `${new Date().toISOString().split('T')[0]}-${i.toString().padStart(3, '0')}`
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

  // NOVO: gerar um PDF ÚNICO com todas etiquetas por página
  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    setIsGenerating(true);

    const MM_TO_PT = 2.83465;
    const labelWidthMM = 60;
    const labelHeightMM = 50;
    const labelWidth = labelWidthMM * MM_TO_PT;
    const labelHeight = labelHeightMM * MM_TO_PT;
    const margin = 8;
    const paddingBetween = 6;

    // Layout da folha (A4): 210 x 297 mm
    const pageWidth = 210 * MM_TO_PT;
    const pageHeight = 297 * MM_TO_PT;

    // Quantas colunas/linhas cabem em uma página?
    // Deixar uns 12mm de margem lateral e topo/baixo
    const horizontalMargin = 12 * MM_TO_PT;
    const verticalMargin = 12 * MM_TO_PT;
    const usableWidth = pageWidth - 2 * horizontalMargin;
    const usableHeight = pageHeight - 2 * verticalMargin;
    const columns = Math.floor((usableWidth + paddingBetween) / (labelWidth + paddingBetween)); // ex: 2
    const rows = Math.floor((usableHeight + paddingBetween) / (labelHeight + paddingBetween));  // ex: 3
    const labelsPerPage = columns * rows;

    // Carrega logo se houver
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
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const labelIdxInPage = i % labelsPerPage;
        const pageIdx = Math.floor(i / labelsPerPage);

        // Calcular posição (col, row)
        const row = Math.floor(labelIdxInPage / columns);
        const col = labelIdxInPage % columns;
        const x = horizontalMargin + col * (labelWidth + paddingBetween);
        const y = verticalMargin + row * (labelHeight + paddingBetween);

        // Adiciona nova página se necessário (skip primeira)
        if (i !== 0 && labelIdxInPage === 0) {
          pdf.addPage();
        }

        // Desenha borda da etiqueta (opcional, para visual)
        pdf.setLineWidth(0.1);
        pdf.setDrawColor(210, 210, 210);
        pdf.rect(x, y, labelWidth, labelHeight);

        let currY = y + margin;

        // Nome do produto (quebra até 23 chars)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        const nomeMaxLen = 23;
        const nomeProduto = qrData.nome.length > nomeMaxLen
          ? qrData.nome.slice(0, nomeMaxLen) + '...'
          : qrData.nome;
        pdf.text(nomeProduto, x + margin, currY + 8);

        // Tipo (em cima do QR)
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.2);
        let statusText = '';
        switch (qrData.tipo) {
          case 'CF': statusText = 'CÂMARA FRIA'; break;
          case 'ES': statusText = 'ESTOQUE SECO'; break;
          case 'DESC': statusText = 'DESCARTÁVEIS'; break;
        }
        pdf.text(statusText, x + margin, currY + 20);

        // Peso/qtde (canto superior direito)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('1 kg', x + labelWidth - margin - 27, currY + 20);

        // Linha divisória
        pdf.setDrawColor(80, 80, 80);
        pdf.setLineWidth(0.2);
        pdf.line(x + margin, currY + 23, x + labelWidth - margin, currY + 23);

        currY += 27;

        // Bloco lateral de informações
        const infos1 = [
          { label: 'VAL. ORIGINAL:', value: '21/04/2025' },
          { label: 'MANIPULAÇÃO:', value: '09/04/2025 - 12:59' },
          { label: 'VALIDADE:', value: '11/04/2025 - 12:59' },
          { label: 'MARCA / FORN:', value: 'SWIFT' },
          { label: 'SIF:', value: '358' }
        ];
        let lineY = 0;
        pdf.setFontSize(7.5);
        for (const info of infos1) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(info.label, x + margin, currY + lineY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(info.value, x + margin + 68, currY + lineY);
          lineY += 9;
        }

        // QR code (lado direito, metade da altura)
        const qrSide = 46;
        const qrX = x + labelWidth - margin - qrSide;
        const qrY = currY;

        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: qrSide,
          margin: 0,
        });
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSide, qrSide);

        // Linha divisória 2
        const afterInfoY = Math.max(currY + lineY, qrY + qrSide) + 3;
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.2);
        pdf.line(x + margin, afterInfoY, x + labelWidth - margin, afterInfoY);

        let rodapeY = afterInfoY + 7;

        // Bloco empresa
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5);
        pdf.text('RESP.: LUCIANA', x + margin, rodapeY + 2);

        pdf.setFont('helvetica', 'normal');
        pdf.text('RESTAURANTE SUFLEX', x + margin, rodapeY + 11);
        pdf.setFontSize(6.7);
        pdf.text('CNPJ: 12.345.678.0001-12', x + margin, rodapeY + 18);
        pdf.text('RUA PURPURINA, 400', x + margin, rodapeY + 24);
        pdf.text('SÃO PAULO - SP', x + margin, rodapeY + 30);
        pdf.text('CEP: 05435-030', x + margin + 80, rodapeY + 24);

        rodapeY += 34;

        // Código azul final
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.7);
        pdf.setTextColor(32,48,140);
        pdf.text(`#${qrData.id.slice(-6).toUpperCase()}`, x + margin, rodapeY);
        pdf.setTextColor(0,0,0);

        // Logo
        if (logoImage) {
          try {
            pdf.addImage(logoImage, 'PNG', x + labelWidth - 42, y + margin, 24, 24);
          } catch { /* não trava */ }
        }
      }

      setIsGenerating(false);

      const mainNome = qrCodes[0]?.nome?.split(' ')[0] || 'etiqueta';
      const fileName = `etiquetas-qrcode-${mainNome}-${qrCodes.length}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF gerado com sucesso",
        description: `Todas as ${qrCodes.length} etiquetas estão no mesmo arquivo.`,
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
