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

  // Agora: cada etiqueta terá 100x150mm (convertido para pontos)
  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    setIsGenerating(true);

    const MM_TO_PT = 2.83465;
    // 💡 Atualizado para 100mm x 150mm etiquetas!
    const labelWidthMM = 100;
    const labelHeightMM = 150;
    const labelWidth = labelWidthMM * MM_TO_PT; // 283.465 pt
    const labelHeight = labelHeightMM * MM_TO_PT; // 425.1975 pt
    const margin = 10; // espaço interno na etiqueta, em pt
    const paddingBetween = 8; // espaço entre etiquetas

    // Layout da folha (A4): 210 x 297 mm (595.276 x 841.89 pt)
    const pageWidth = 210 * MM_TO_PT;
    const pageHeight = 297 * MM_TO_PT;

    // Margens externas
    const horizontalMargin = 6 * MM_TO_PT;
    const verticalMargin = 6 * MM_TO_PT;

    // Área útil
    const usableWidth = pageWidth - 2 * horizontalMargin;
    const usableHeight = pageHeight - 2 * verticalMargin;

    // Novo: para 100x150mm, só cabe 1 etiqueta por linha em A4 na horizontal, 
    // e no máximo 1 por coluna se for retrato.
    // Melhor usar orientação landscape p/ caber mais etiquetas por folha.
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const landscapePageWidth = pageHeight;  // 841.89 pt (A4 landscape)
    const landscapePageHeight = pageWidth;  // 595.276 pt

    // Cálculo das linhas/colunas POR FOLHA
    const usableLandscapeWidth = landscapePageWidth - 2 * horizontalMargin;
    const usableLandscapeHeight = landscapePageHeight - 2 * verticalMargin;

    // Exemplo: cabem no máximo 2 colunas (200mm + espaço), 3 linhas (450mm)
    const columns = Math.max(
      1,
      Math.floor((usableLandscapeWidth + paddingBetween) / (labelWidth + paddingBetween))
    );
    const rows = Math.max(
      1,
      Math.floor((usableLandscapeHeight + paddingBetween) / (labelHeight + paddingBetween))
    );
    const labelsPerPage = columns * rows;

    // Garantir logo opcional
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
      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const labelIdxInPage = i % labelsPerPage;
        const pageIdx = Math.floor(i / labelsPerPage);

        // Add página se necessário (não na primeira)
        if (i !== 0 && labelIdxInPage === 0) {
          pdf.addPage();
        }

        // Posição da etiqueta
        const row = Math.floor(labelIdxInPage / columns);
        const col = labelIdxInPage % columns;
        const x = horizontalMargin + col * (labelWidth + paddingBetween);
        const y = verticalMargin + row * (labelHeight + paddingBetween);

        // Bordas de referência
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(210, 210, 210);
        pdf.rect(x, y, labelWidth, labelHeight);

        let currY = y + margin;

        // Nome produto
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        const nomeProduto = qrData.nome?.length > 32
          ? qrData.nome.slice(0, 32) + '...'
          : qrData.nome;
        pdf.text(nomeProduto, x + margin, currY + 18);

        // Tipo/Categoria
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(16);
        let statusText = '';
        switch (qrData.tipo) {
          case 'CF': statusText = 'CÂMARA FRIA'; break;
          case 'ES': statusText = 'ESTOQUE SECO'; break;
          case 'DESC': statusText = 'DESCARTÁVEIS'; break;
        }
        // Inclui a categoria ao lado do tipo
        pdf.text(
          (statusText ? `${statusText} - ` : '') + (qrData.categoria || ''),
          x + margin, currY + 38
        );

        // Peso (direita topo): unidade do item + "kg" apenas se for unidade tipo peso
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        let unidadeImpressa = qrData.unidade
          ? qrData.unidade
          : '1 un.';
        if (['kg', 'Kg', 'quilogramas', 'quilograma', 'peso'].includes(qrData.unidade?.toLowerCase?.() || '')) {
          unidadeImpressa = '1 kg';
        }
        pdf.text(unidadeImpressa, x + labelWidth - margin - 50, currY + 38);

        // Linha divisória
        pdf.setDrawColor(80, 80, 80);
        pdf.setLineWidth(0.6);
        pdf.line(x + margin, currY + 55, x + labelWidth - margin, currY + 55);

        currY += 65;

        // Informações do bloco lateral personalizadas
        const infos1 = [
          {
            label: 'FORNECEDOR:',
            value: qrData.fornecedor || '-'
          },
          {
            label: 'DATA DE ENTRADA:',
            value: qrData.data_entrada
              ? new Date(qrData.data_entrada).toLocaleDateString('pt-BR')
              : '-'
          },
          {
            label: 'VALIDADE:',
            value: qrData.data_validade
              ? new Date(qrData.data_validade).toLocaleDateString('pt-BR')
              : '-'
          },
          {
            label: 'UNIDADE:',
            value: qrData.unidade || '-'
          },
          {
            label: 'VALOR UNIT.:',
            value: (qrData.preco_unitario
              ? `R$ ${Number(qrData.preco_unitario).toFixed(2)}`
              : '-')
          }
        ];

        let lineY = 0;
        pdf.setFontSize(12.5);
        for (const info of infos1) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(info.label, x + margin, currY + lineY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(String(info.value), x + margin + 120, currY + lineY);
          lineY += 19;
        }

        // QR code
        const qrSide = 100;
        const qrX = x + labelWidth - margin - qrSide;
        const qrY = currY;

        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: qrSide,
          margin: 0,
        });
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSide, qrSide);

        // Segunda linha divisória
        const afterInfoY = Math.max(currY + lineY, qrY + qrSide) + 8;
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.5);
        pdf.line(x + margin, afterInfoY, x + labelWidth - margin, afterInfoY);

        let rodapeY = afterInfoY + 17;

        // Nome ou responsável padrão
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12.5);
        pdf.text('RESPONSÁVEL: Sistema', x + margin, rodapeY + 2);

        pdf.setFont('helvetica', 'normal');
        pdf.text('ESTOQUE DIGITAL', x + margin, rodapeY + 22);
        pdf.setFontSize(11.7);
        pdf.text('QR Etiquetas', x + margin, rodapeY + 38);

        // Rodapé de endereço fictício (ajuste caso queira mais info)
        pdf.text('Churrascaria Exemplo', x + margin, rodapeY + 52);
        pdf.text('SÃO PAULO - SP', x + margin, rodapeY + 64);

        rodapeY += 72;

        // Código azul destacado
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.setTextColor(32, 48, 140);
        pdf.text(`#${qrData.id.slice(-6).toUpperCase()}`, x + margin, rodapeY);
        pdf.setTextColor(0, 0, 0);

        // Logo canto direito
        if (logoImage) {
          try {
            pdf.addImage(logoImage, 'PNG', x + labelWidth - 60, y + margin, 38, 38);
          } catch { /* não quebra em erro */ }
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
