import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { toast } from '@/hooks/use-toast';

export interface QRCodeData {
  id: string;
  nome: string;
  categoria: string;
  tipo: 'CF' | 'ES' | 'DESC' | 'BD';
  lote?: string;
  unidade?: string;
  fornecedor?: string;
  data_entrada?: string;
  data_validade?: string;
  preco_unitario?: number;
}

// Atualiza para nova logo enviada pelo usuário
const LOGO_URL = '/lovable-uploads/1f655875-b87f-4e01-b716-850dd285a60b.png';

export function useQRCodeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCodeId = (tipo: 'CF' | 'ES' | 'DESC' | 'BD', itemId: string, index: number) => {
    const timestamp = Date.now().toString().slice(-6);
    return `${tipo}-${itemId.slice(-8)}-${timestamp}-${index.toString().padStart(3, '0')}`;
  };

  const generateQRCodeData = (item: any, tipo: 'CF' | 'ES' | 'DESC' | 'BD', quantidade: number): QRCodeData[] => {
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

        if (i !== 0 && labelIdxInPage === 0) {
          pdf.addPage();
        }

        // Calcula posição da etiqueta na folha
        const row = Math.floor(labelIdxInPage / columns);
        const col = labelIdxInPage % columns;
        const x = col * (labelWidth + spacingX) + spacingX / 2;
        const y = row * (labelHeight + spacingY) + spacingY / 2;

        // --- Demarcação da região da etiqueta ---
        pdf.setDrawColor(180, 180, 180); // cinza claro para linha de corte
        pdf.setLineWidth(1);
        pdf.rect(x, y, labelWidth, labelHeight, 'S'); // 'S' = somente contorno

        // Layout principal
        const logoBoxWidth = labelWidth * 0.45;
        const qrBoxWidth = labelWidth - logoBoxWidth;
        let currY = y + marginY;

        // Logo centralizada e maior (mantém ajuste feito anteriormente)
        if (logoImage) {
          try {
            const maxLogoW = logoBoxWidth - 8;
            const maxLogoH = labelHeight * 0.5;

            const img = new window.Image();
            await new Promise((resolve) => {
              img.onload = resolve;
              img.src = logoImage as string;
            });

            let renderW = maxLogoW, renderH = maxLogoH;
            if (img.width / img.height > maxLogoW / maxLogoH) {
              renderW = maxLogoW;
              renderH = img.height * (maxLogoW / img.width);
            } else {
              renderH = maxLogoH;
              renderW = img.width * (maxLogoH / img.height);
            }
            const logoX = x + (logoBoxWidth - renderW) / 2;
            const logoY = currY + (maxLogoH - renderH) / 2;

            pdf.addImage(logoImage, 'PNG', logoX, logoY, renderW, renderH, undefined, 'FAST');
            currY += maxLogoH + 14; // mantém distância extra do texto
          } catch {
            currY += labelHeight * 0.5 + 14;
          }
        } else {
          currY += labelHeight * 0.5 + 14;
        }

        // Nome do produto (em negrito, centralizado)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text(
          qrData.nome?.length > 30 ? qrData.nome.slice(0, 30) + '...' : qrData.nome,
          x + logoBoxWidth / 2,
          currY + 6,
          { align: 'center', baseline: 'middle' }
        );
        currY += 18;

        // Data de entrada em negrito (dd/mm/aaaa)
        if (qrData.data_entrada) {
          pdf.setFont('helvetica', 'bold'); // NEGRITO
          pdf.setFontSize(12);
          let formatted = '';
          try {
            const d = new Date(qrData.data_entrada);
            formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          } catch {
            formatted = qrData.data_entrada;
          }
          pdf.text(
            formatted,
            x + logoBoxWidth / 2,
            currY + 7,
            { align: 'center', baseline: 'middle' }
          );
          currY += 15;
        }

        // Unidade (exceto juazeiro_norte)
        if (qrData.unidade && qrData.unidade !== 'juazeiro_norte') {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(10);
          pdf.text(
            qrData.unidade,
            x + logoBoxWidth / 2,
            currY + 5,
            { align: 'center', baseline: 'middle' }
          );
          currY += 12;
        }

        // Fornecedor (opcional, pequenino)
        if (qrData.fornecedor) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(
            qrData.fornecedor,
            x + logoBoxWidth / 2,
            currY + 5,
            { align: 'center', baseline: 'middle' }
          );
          currY += 10;
        }

        // --- QR code à direita ---
        const qrSide = Math.min(qrBoxWidth - 2 * marginX, labelHeight - 18);

        const qrX = x + logoBoxWidth + (qrBoxWidth - qrSide) / 2;
        const qrY = y + (labelHeight - qrSide) / 2;

        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: qrSide,
          margin: 0,
        });
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSide, qrSide);
        // NÃO exibe nenhum texto abaixo do QR code!
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
