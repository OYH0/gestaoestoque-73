
import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export interface QRCodeData {
  id: string;
  nome: string;
  categoria: string;
  tipo: 'CF' | 'ES' | 'DESC'; // Câmara Fria, Estoque Seco, Descartáveis
  lote?: string;
}

export function useQRCodeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCodeId = (tipo: 'CF' | 'ES' | 'DESC', itemId: string, index: number) => {
    const timestamp = Date.now().toString().slice(-6);
    return `${tipo}-${itemId.slice(-8)}-${timestamp}-${index.toString().padStart(3, '0')}`;
  };

  const generateQRCodeData = (item: any, tipo: 'CF' | 'ES' | 'DESC', quantidade: number): QRCodeData[] => {
    console.log('=== INÍCIO generateQRCodeData ===');
    console.log('Item recebido:', item);
    console.log('Tipo:', tipo);
    console.log('Quantidade solicitada:', quantidade);
    
    const qrCodes: QRCodeData[] = [];
    
    console.log('Iniciando loop para gerar QR codes...');
    for (let i = 1; i <= quantidade; i++) {
      const qrCodeId = generateQRCodeId(tipo, item.id, i);
      const qrCodeData = {
        id: qrCodeId,
        nome: `${item.nome} ${i}`, // Adiciona numeração sequencial no nome
        categoria: item.categoria,
        tipo,
        lote: `${new Date().toISOString().split('T')[0]}-${i.toString().padStart(3, '0')}`
      };
      
      qrCodes.push(qrCodeData);
      console.log(`QR Code ${i}/${quantidade} criado:`, qrCodeId, 'Nome:', qrCodeData.nome);
    }
    
    console.log('Total de QR codes criados:', qrCodes.length);
    console.log('=== FIM generateQRCodeData ===');
    
    return qrCodes;
  };

  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    console.log('=== INÍCIO generateQRCodePDF ===');
    console.log('QR codes recebidos para PDF:', qrCodes.length);
    
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // 2 QR codes por linha, 5 linhas por página = 10 QR codes por página
      const qrSize = 60;
      const margin = 20;
      const spacing = 10;
      const codesPerRow = 2;
      const rowsPerPage = 5;
      const codesPerPage = codesPerRow * rowsPerPage;
      
      console.log('Configurações do PDF:', {
        qrSize,
        margin,
        spacing,
        codesPerRow,
        rowsPerPage,
        codesPerPage
      });
      
      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const pageIndex = Math.floor(i / codesPerPage);
        const indexInPage = i % codesPerPage;
        const row = Math.floor(indexInPage / codesPerRow);
        const col = indexInPage % codesPerRow;
        
        console.log(`Processando QR code ${i + 1}/${qrCodes.length}:`, qrData.id, 'Nome:', qrData.nome);
        
        // Adicionar nova página se necessário
        if (i > 0 && indexInPage === 0) {
          pdf.addPage();
          console.log('Nova página adicionada');
        }
        
        const x = margin + col * (qrSize + spacing + 50);
        const y = margin + row * (qrSize + spacing + 30);
        
        // Gerar QR code como base64
        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: 200,
          margin: 1,
        });
        
        // Adicionar QR code ao PDF
        pdf.addImage(qrCodeDataURL, 'PNG', x, y, qrSize, qrSize);
        
        // Adicionar texto abaixo do QR code
        pdf.setFontSize(8);
        pdf.text(`${qrData.nome}`, x, y + qrSize + 5, { maxWidth: qrSize });
        pdf.text(`ID: ${qrData.id}`, x, y + qrSize + 12, { maxWidth: qrSize });
        pdf.text(`Lote: ${qrData.lote}`, x, y + qrSize + 19, { maxWidth: qrSize });
      }
      
      // Salvar PDF
      const fileName = `qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF gerado com sucesso:', fileName);
      console.log('=== FIM generateQRCodePDF ===');
      
      return { success: true, fileName };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQRCodeData,
    generateQRCodePDF,
    isGenerating,
  };
}
