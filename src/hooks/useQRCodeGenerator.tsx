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

    let logoImage: string | undefined = undefined;
    let logoErro = false;

    try {
      // Corrigir fetch da logo (sem /public no caminho)
      const resp = await fetch(LOGO_URL);
      if (!resp.ok) throw new Error('Logo não encontrada');
      const blob = await resp.blob();
      logoImage = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      logoErro = true;
      logoImage = undefined;
      // Não bloqueia geração, apenas avisa usuário
      toast({
        title: "Atenção",
        description: "Logo da Companhia do Churrasco não foi encontrada ou está corrompida. Etiquetas serão geradas sem a logo.",
        variant: "destructive"
      });
    }

    try {
      // Medidas
      const labelWidthMM = 60;
      const labelHeightMM = 50;
      const labelWidth = labelWidthMM * 2.83465;
      const labelHeight = labelHeightMM * 2.83465;
      const margin = 16;

      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [labelWidth, labelHeight],
        });
        let y = margin;

        // Nome produto
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.text(qrData.nome, margin, y + 10);

        // Status/categoria
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        let statusText = '';
        switch (qrData.tipo) {
          case 'CF': statusText = 'RESFRIADO / DESCONGELANDO'; break;
          case 'ES': statusText = 'ESTOQUE SECO'; break;
          case 'DESC': statusText = 'DESCARTÁVEIS'; break;
        }
        pdf.setTextColor('#111');
        pdf.text(statusText, margin, y + 32);

        // Peso/quantidade fictício
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('1 kg', labelWidth - margin - 36, y + 32);

        // Linha separadora
        pdf.setDrawColor(60, 60, 60);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 38, labelWidth - margin, y + 38);

        y += 48;

        // Bloco de datas/info
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9);
        pdf.text('VAL. ORIGINAL:', margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text('21/04/2025', margin + 78, y);

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

        // Linha separadora 2
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 62, labelWidth - margin, y + 62);

        y = y + 76;

        // Dados responsável/empresa
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

        // Código TXXXX
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor('#12126a');
        pdf.text(`#${qrData.id.slice(-6).toUpperCase()}`, margin, y + 54);

        pdf.setTextColor('#111');

        // QRCode como sempre
        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: 240,
          margin: 1,
        });
        const qrSide = 62;
        pdf.addImage(qrCodeDataURL, 'PNG', labelWidth - margin - qrSide, labelHeight - margin - qrSide, qrSide, qrSide);

        // Logo, só se OK
        if (logoImage) {
          try {
            pdf.addImage(logoImage, 'PNG', labelWidth - 50, margin, 38, 38);
          } catch (e) {
            // Se ainda assim der erro, não quebra o fluxo
            console.error("Erro ao adicionar a logo na etiqueta:", e);
          }
        }
        const fileName = `etiqueta-qrcode-${qrData.nome.replace(/\s+/g, '-').toLowerCase()}-${qrData.id.slice(-6)}.pdf`;
        pdf.save(fileName);
      }
      setIsGenerating(false);
      return { success: true };
    } catch (error) {
      setIsGenerating(false);
      console.error('❌ Erro ao gerar etiqueta PDF:', error);
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
