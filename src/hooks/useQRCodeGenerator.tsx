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
        nome: `${item.nome} ${i}`, // CORRIGIDO: cada etiqueta tem nome sequencial!
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

    try {
      // Busca a logo, mas ignora erro de logo corrompida/ausente (o PDF continua)
      const resp = await fetch('/churrasco-logo.png');
      if (resp.ok) {
        const blob = await resp.blob();
        logoImage = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } else {
        logoImage = undefined;
        toast({
          title: "Atenção",
          description: "Logo da Companhia do Churrasco não encontrada. Etiquetas serão geradas sem logo.",
          variant: "destructive"
        });
      }
    } catch (e) {
      logoImage = undefined;
      toast({
        title: "Atenção (Logo da etiqueta)",
        description: "Não foi possível carregar a logo. As etiquetas foram geradas sem logo.",
        variant: "destructive"
      });
    }

    try {
      // Layout: 60x50mm em pontos
      const labelWidthMM = 60;
      const labelHeightMM = 50;
      const labelWidth = labelWidthMM * 2.83465;
      const labelHeight = labelHeightMM * 2.83465;
      const margin = 14;

      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [labelWidth, labelHeight],
        });

        let y = margin;

        // ===== Nome do produto (nome sequencial agora!) =====
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.text(qrData.nome, margin, y + 10);

        // ===== Tipo / status =====
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        let statusText = '';
        switch (qrData.tipo) {
          case 'CF': statusText = 'CÂMARA FRIA'; break;
          case 'ES': statusText = 'ESTOQUE SECO'; break;
          case 'DESC': statusText = 'DESCARTÁVEIS'; break;
        }
        pdf.setTextColor('#222');
        pdf.text(statusText, margin, y + 30);

        // ===== Peso/quantidade =====
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.text('1 kg', labelWidth - margin - 38, y + 30);

        // ===== Linha =====
        pdf.setDrawColor(80, 80, 80);
        pdf.setLineWidth(0.4);
        pdf.line(margin, y + 36, labelWidth - margin, y + 36);

        y += 44;

        // ===== Dados em bloco à esquerda (alinhado para não cortar) =====
        pdf.setFontSize(9);
        const infos1 = [
          { label: 'VAL. ORIGINAL:', value: '21/04/2025' },
          { label: 'MANIPULAÇÃO:', value: '09/04/2025 - 12:59:23' },
          { label: 'VALIDADE:', value: '11/04/2025 - 12:59:23' },
          { label: 'MARCA / FORN:', value: 'SWIFT' },
          { label: 'SIF:', value: '358' },
        ];

        let offsetY = 0;
        for (const info of infos1) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(info.label, margin, y + offsetY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(info.value, margin + 84, y + offsetY);
          offsetY += 13;
        }

        // ===== QR code à direita exatamente como no exemplo =====
        // (QR no topo-direita do bloco de dados)
        const qrSide = 65; // pixels, proporcional ao label
        const qrX = labelWidth - margin - qrSide;
        const qrY = y;

        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: qrSide,
          margin: 1,
        });
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSide, qrSide);

        // Linha separadora 2, abaixo QR e bloco de dados
        const line2Y = Math.max(y + offsetY, qrY + qrSide) + 6;
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.4);
        pdf.line(margin, line2Y, labelWidth - margin, line2Y);

        y = line2Y + 10;

        // ===== Dados da empresa, responsável, etc (como imagem) =====
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text('RESP.: LUCIANA', margin, y);

        pdf.setFont('helvetica', 'normal');
        pdf.text('RESTAURANTE SUFLEX', margin, y + 12);
        pdf.setFontSize(8);
        pdf.text('CNPJ: 12.345.678.0001-12', margin, y + 21);
        pdf.text('RUA PURPURINA, 400', margin, y + 29);
        pdf.text('SÃO PAULO - SP', margin, y + 37);
        pdf.text('CEP: 05435-030', margin + 90, y + 29);

        y += 51;

        // ===== Código (número final) =====
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor('#12126a');
        pdf.text(`#${qrData.id.slice(-6).toUpperCase()}`, margin, y);

        pdf.setTextColor('#111');

        // ===== Logo, se houver =====
        if (logoImage) {
          try {
            pdf.addImage(logoImage, 'PNG', labelWidth - 46, margin, 34, 34);
          } catch (e) {
            // Se der erro, apenas mostra toast e pula
            toast({
              title: "Logo não adicionada",
              description: "Houve um erro ao adicionar a logo na etiqueta.",
              variant: "destructive"
            });
          }
        }

        // ===== Salva arquivo =====
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
