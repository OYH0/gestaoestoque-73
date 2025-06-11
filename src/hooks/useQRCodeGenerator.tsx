
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
    console.log('Lista completa de QR codes:', qrCodes);
    console.log('=== FIM generateQRCodeData ===');
    
    return qrCodes;
  };

  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    console.log('=== INÍCIO generateQRCodePDF ===');
    console.log('QR codes recebidos para PDF:', qrCodes.length);
    console.log('Todos os QR codes que serão processados:', qrCodes.map(qr => qr.nome));
    
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configuração otimizada: 3 QR codes por linha, 5 linhas por página = 15 QR codes por página
      const qrSize = 45;
      const margin = 15;
      const spacingX = 12; // Espaçamento horizontal entre QR codes
      const spacingY = 30; // Espaçamento vertical entre linhas (maior para acomodar texto)
      const codesPerRow = 3;
      const rowsPerPage = 5;
      const codesPerPage = codesPerRow * rowsPerPage;
      
      console.log('Configurações do PDF otimizadas:', {
        pageWidth,
        pageHeight,
        qrSize,
        margin,
        spacingX,
        spacingY,
        codesPerRow,
        rowsPerPage,
        codesPerPage,
        totalQRCodes: qrCodes.length,
        totalPaginas: Math.ceil(qrCodes.length / codesPerPage)
      });
      
      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const pageIndex = Math.floor(i / codesPerPage);
        const indexInPage = i % codesPerPage;
        const row = Math.floor(indexInPage / codesPerRow);
        const col = indexInPage % codesPerRow;
        
        console.log(`Processando QR code ${i + 1}/${qrCodes.length}:`, qrData.id, 'Nome:', qrData.nome, `Página: ${pageIndex + 1}, Linha: ${row + 1}, Coluna: ${col + 1}`);
        
        // Adicionar nova página se necessário
        if (i > 0 && indexInPage === 0) {
          pdf.addPage();
          console.log(`Nova página ${pageIndex + 1} adicionada para QR code ${i + 1}`);
        }
        
        // Calcular posições com melhor distribuição
        const availableWidth = pageWidth - (2 * margin);
        const totalSpacingX = (codesPerRow - 1) * spacingX;
        const actualQRSize = Math.min(qrSize, (availableWidth - totalSpacingX) / codesPerRow);
        
        const x = margin + col * (actualQRSize + spacingX);
        const y = margin + row * (actualQRSize + spacingY);
        
        console.log(`Posicionamento QR ${i + 1}: x=${x}, y=${y}, tamanho=${actualQRSize}`);
        
        // Gerar QR code como base64
        const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
          width: 200,
          margin: 1,
        });
        
        // Adicionar QR code ao PDF
        pdf.addImage(qrCodeDataURL, 'PNG', x, y, actualQRSize, actualQRSize);
        
        // Adicionar texto abaixo do QR code com fonte menor e posicionamento ajustado
        pdf.setFontSize(6);
        const textY = y + actualQRSize + 3;
        pdf.text(`${qrData.nome}`, x, textY, { maxWidth: actualQRSize });
        pdf.text(`ID: ${qrData.id}`, x, textY + 6, { maxWidth: actualQRSize });
        pdf.text(`Lote: ${qrData.lote}`, x, textY + 12, { maxWidth: actualQRSize });
      }
      
      // Salvar PDF
      const fileName = `qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF gerado com sucesso:', fileName);
      console.log('Total de QR codes incluídos no PDF:', qrCodes.length);
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
