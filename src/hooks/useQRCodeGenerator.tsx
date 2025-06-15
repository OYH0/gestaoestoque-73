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

  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    setIsGenerating(true);

    let logoImage: string | undefined = undefined;
    try {
      // Tenta carregar logo
      const resp = await fetch(LOGO_URL);
      if (resp.ok) {
        const blob = await resp.blob();
        logoImage = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } else {
        logoImage = undefined;
      }
    } catch {
      logoImage = undefined;
    }

    try {
      // Layout: 60x50mm em pontos
      const MM_TO_PT = 2.83465;
      const labelWidth = 60 * MM_TO_PT;   // ~170pt
      const labelHeight = 50 * MM_TO_PT;  // ~141pt
      const margin = 12; // diminui para caber mais coisas

      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [labelWidth, labelHeight],
        });

        let y = margin;

        // Nome do produto (negrito)
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        const nomeMaxLen = 23; // quebra se for grande
        const nomeProduto = qrData.nome.length > nomeMaxLen
          ? qrData.nome.slice(0, nomeMaxLen) + '...'
          : qrData.nome;
        pdf.text(nomeProduto, margin, y + 9);

        // Tipo
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        let statusText = '';
        switch (qrData.tipo) {
          case 'CF': statusText = 'CÂMARA FRIA'; break;
          case 'ES': statusText = 'ESTOQUE SECO'; break;
          case 'DESC': statusText = 'DESCARTÁVEIS'; break;
        }
        pdf.text(statusText, margin, y + 24);

        // Peso/qtde
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('1 kg', labelWidth - margin - 27, y + 24);

        // Linha divisória
        pdf.setDrawColor(80, 80, 80);
        pdf.setLineWidth(0.3);
        pdf.line(margin, y + 28, labelWidth - margin, y + 28);

        y += 32; // novo ponto Y

        // ===== Bloco de informações da lateral esquerda =====
        const infos1 = [
          { label: 'VAL. ORIGINAL:', value: '21/04/2025' },
          { label: 'MANIPULAÇÃO:', value: '09/04/2025 - 12:59' },
          { label: 'VALIDADE:', value: '11/04/2025 - 12:59' },
          { label: 'MARCA / FORN:', value: 'SWIFT' },
          { label: 'SIF:', value: '358' }
        ];
        let offsetY = 0;
        pdf.setFontSize(8);
        for (const info of infos1) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(info.label, margin, y + offsetY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(info.value, margin + 74, y + offsetY);
          offsetY += 11;
        }

        // QR code lado direito, ocupando altura do bloco de informações (nunca cortando)
        const qrSide = 50;
        const qrX = labelWidth - margin - qrSide; // à direita dentro da margem
        const qrY = y;

        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: qrSide,
          margin: 0,
        });
        pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSide, qrSide);

        // Linha divisória 2
        const afterInfoY = Math.max(y + offsetY, qrY + qrSide) + 3;
        pdf.setDrawColor(180, 180, 180);
        pdf.setLineWidth(0.3);
        pdf.line(margin, afterInfoY, labelWidth - margin, afterInfoY);

        y = afterInfoY + 7;

        // Bloco da empresa
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8);
        pdf.text('RESP.: LUCIANA', margin, y + 2);

        pdf.setFont('helvetica', 'normal');
        pdf.text('RESTAURANTE SUFLEX', margin, y + 12);
        pdf.setFontSize(7.3);
        pdf.text('CNPJ: 12.345.678.0001-12', margin, y + 20);
        pdf.text('RUA PURPURINA, 400', margin, y + 27);
        pdf.text('SÃO PAULO - SP', margin, y + 33);
        pdf.text('CEP: 05435-030', margin + 90, y + 27);

        y += 39;

        // Código -- grande, azul
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.7);
        pdf.setTextColor(32,48,140);
        pdf.text(`#${qrData.id.slice(-6).toUpperCase()}`, margin, y);
        pdf.setTextColor(0,0,0);

        // Logo, se houver
        if (logoImage) {
          try {
            pdf.addImage(logoImage, 'PNG', labelWidth - 44, margin, 28, 28);
          } catch (e) {
            // só avisa uma vez, não trava
            toast({
              title: "Logo não adicionada",
              description: "Houve um erro ao adicionar a logo na etiqueta.",
              variant: "destructive"
            });
          }
        }

        // Salva arquivo
        const safeNome = qrData.nome.replace(/\s+/g, '-').toLowerCase();
        const fileName = `etiqueta-qrcode-${safeNome}-${qrData.id.slice(-6)}.pdf`;

        // Baixa o PDF da etiqueta individualmente
        pdf.save(fileName);
      }
      setIsGenerating(false);
      toast({
        title: `PDF${qrCodes.length > 1 ? 's' : ''} gerado${qrCodes.length > 1 ? 's' : ''} com sucesso!`,
        description: `Foram geradas ${qrCodes.length} etiquetas com QR code.`,
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
