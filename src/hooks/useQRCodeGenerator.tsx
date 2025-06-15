
import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export interface QRCodeData {
  id: string;
  nome: string;
  categoria: string;
  tipo: 'CF' | 'ES' | 'DESC';
  lote?: string;
}

const LOGO_URL = '/public/churrasco-logo.png'; // Altere para o caminho correto se necessário

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
      const qrCodeData = {
        id: qrCodeId,
        nome: `${item.nome} ${i}`,
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

  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    setIsGenerating(true);

    try {
      // Define o tamanho da etiqueta (60mm x 50mm em pontos, 1mm ~ 2.83465pt)
      const labelWidthMM = 60;
      const labelHeightMM = 50;
      const labelWidth = labelWidthMM * 2.83465;
      const labelHeight = labelHeightMM * 2.83465;

      // Carrega a logo da empresa como base64
      let logoImage: string | undefined;
      try {
        // Precisa que a logo esteja no public/ e se possa acessar via fetch.
        const resp = await fetch(LOGO_URL);
        const blob = await resp.blob();
        logoImage = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error('Erro ao carregar logo da empresa:', e);
        logoImage = undefined;
      }

      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        // Cria uma nova página por etiqueta
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [labelWidth, labelHeight],
        });

        // MARGENS e medidas
        const margin = 16;
        let y = margin;

        // Nome do produto (destaque)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.text(qrData.nome, margin, y + 10);

        // Linha de status/categoria + quantidade/kg (exemplo suposto: 1kg)
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        let statusText = '';
        switch (qrData.tipo) {
          case 'CF':
            statusText = 'RESFRIADO / DESCONGELANDO';
            break;
          case 'ES':
            statusText = 'ESTOQUE SECO';
            break;
          case 'DESC':
            statusText = 'DESCARTÁVEIS';
            break;
          default:
            statusText = '';
        }
        pdf.setTextColor('#111');
        pdf.text(statusText, margin, y + 32);

        // Peso ou quantidade fictício na direita (ajuste para sua regra/dado real)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('1 kg', labelWidth - margin - 36, y + 32); // Você pode ajustar '1 kg' para outro campo se existir

        // Linha horizontal separadora
        pdf.setDrawColor(60, 60, 60);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 38, labelWidth - margin, y + 38);

        y += 48;

        // Bloco de datas e info
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('VAL. ORIGINAL:', margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text('21/04/2025', margin + 78, y); // Exemplo, ajuste conforme disponível

        pdf.setFont('helvetica', 'bold');
        pdf.text('MANIPULAÇÃO:', margin, y + 14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('09/04/2025 - 12:59:23', margin + 78, y + 14);

        pdf.setFont('helvetica', 'bold');
        pdf.text('VALIDADE:', margin, y + 28);
        pdf.setFont('helvetica', 'normal');
        pdf.text('11/04/2025 - 12:59:23', margin + 78, y + 28);

        pdf.setFont('helvetica', 'bold');
        pdf.text('MARCA / FORN:', margin, y + 42);
        pdf.setFont('helvetica', 'normal');
        pdf.text('SWIFT', margin + 78, y + 42);

        pdf.setFont('helvetica', 'bold');
        pdf.text('SIF:', margin, y + 56);
        pdf.setFont('helvetica', 'normal');
        pdf.text('358', margin + 78, y + 56);

        // Linha horizontal separadora 2
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 62, labelWidth - margin, y + 62);

        y = y + 76;

        // Dados do responsável e empresa
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('RESP.: LUCIANA', margin, y);

        pdf.setFont('helvetica', 'normal');
        pdf.text('RESTAURANTE SUFLEX', margin, y + 12);
        pdf.setFontSize(8);
        pdf.text('CNPJ: 12.345.678.0001-12', margin, y + 22);
        pdf.text('RUA PURPURINA, 400', margin, y + 32);
        pdf.text('SÃO PAULO - SP', margin, y + 42);
        pdf.text('CEP: 05435-030', margin + 100, y + 32);

        // Código #TXXXX
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor('#12126a');
        pdf.text(`#${qrData.id.slice(-6).toUpperCase()}`, margin, y + 54);

        pdf.setTextColor('#111');

        // QR Code
        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: 240,
          margin: 1,
        });
        // O QR deve ficar no canto inferior direito da etiqueta
        const qrSide = 62;
        pdf.addImage(qrCodeDataURL, 'PNG', labelWidth - margin - qrSide, labelHeight - margin - qrSide, qrSide, qrSide);

        // Logo da empresa
        if (logoImage) {
          // Logo fica no canto superior direito
          pdf.addImage(logoImage, 'PNG', labelWidth - 50, margin, 38, 38);
        }

        // Apenas salva cada etiqueta separada (caso prefira um PDF únido, adapte para fazer addPage)
        const fileName = `etiqueta-qrcode-${qrData.nome.replace(/\s+/g, '-').toLowerCase()}-${qrData.id.slice(-6)}.pdf`;
        pdf.save(fileName);
      }

      setIsGenerating(false);
      return { success: true };
    } catch (error) {
      setIsGenerating(false);
      console.error('❌ Erro ao gerar etiqueta PDF:', error);
      return { success: false, error };
    }
  };

  return {
    generateQRCodeData,
    generateQRCodePDF,
    isGenerating,
  };
}
