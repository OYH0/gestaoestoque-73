
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
    console.log('Quantidade solicitada (DEVE SER EXATO):', quantidade);
    console.log('Tipo da quantidade:', typeof quantidade);
    
    if (!quantidade || quantidade <= 0) {
      console.warn('ERRO: Quantidade inválida ou zero!');
      return [];
    }
    
    const qrCodes: QRCodeData[] = [];
    
    console.log('Iniciando loop para gerar QR codes...');
    for (let i = 1; i <= quantidade; i++) {
      const qrCodeId = generateQRCodeId(tipo, item.id, i);
      const qrCodeData = {
        id: qrCodeId,
        nome: `${item.nome} ${i}`, // Numeração sequencial
        categoria: item.categoria,
        tipo,
        lote: `${new Date().toISOString().split('T')[0]}-${i.toString().padStart(3, '0')}`
      };
      
      qrCodes.push(qrCodeData);
      console.log(`QR Code ${i}/${quantidade} criado:`, qrCodeId, 'Nome:', qrCodeData.nome);
    }
    
    console.log('VERIFICAÇÃO FINAL:');
    console.log('- Quantidade solicitada:', quantidade);
    console.log('- QR codes criados:', qrCodes.length);
    console.log('- Corresponde?:', qrCodes.length === quantidade ? 'SIM ✓' : 'NÃO ✗');
    console.log('Lista completa de nomes:', qrCodes.map(qr => qr.nome));
    console.log('=== FIM generateQRCodeData ===');
    
    return qrCodes;
  };

  const generateQRCodePDF = async (qrCodes: QRCodeData[]) => {
    console.log('=== INÍCIO generateQRCodePDF ===');
    console.log('QR codes recebidos para PDF:', qrCodes.length);
    console.log('VERIFICAÇÃO: Todos os nomes dos QR codes:');
    qrCodes.forEach((qr, index) => {
      console.log(`${index + 1}. ${qr.nome} (ID: ${qr.id})`);
    });
    
    if (qrCodes.length === 0) {
      console.error('ERRO: Nenhum QR code fornecido para gerar PDF!');
      return { success: false, error: 'Nenhum QR code fornecido' };
    }
    
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configuração mais conservadora: 2 colunas, mais espaço vertical
      const qrSize = 60;
      const margin = 20;
      const spacingX = 20;
      const spacingY = 45; // Mais espaço para texto
      const codesPerRow = 2;
      const rowsPerPage = 4;
      const codesPerPage = codesPerRow * rowsPerPage;
      
      console.log('Configurações do PDF CONSERVADORAS para garantir que todos sejam incluídos:', {
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
      
      let qrCodesProcessados = 0;
      
      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const pageIndex = Math.floor(i / codesPerPage);
        const indexInPage = i % codesPerPage;
        const row = Math.floor(indexInPage / codesPerRow);
        const col = indexInPage % codesPerRow;
        
        console.log(`PROCESSANDO QR ${i + 1}/${qrCodes.length}:`, qrData.nome, `Página: ${pageIndex + 1}, Linha: ${row + 1}, Coluna: ${col + 1}`);
        
        // Adicionar nova página se necessário
        if (i > 0 && indexInPage === 0) {
          pdf.addPage();
          console.log(`NOVA PÁGINA ${pageIndex + 1} adicionada para QR code ${i + 1}`);
        }
        
        // Calcular posições
        const x = margin + col * (qrSize + spacingX);
        const y = margin + row * (qrSize + spacingY);
        
        console.log(`Posicionamento QR ${i + 1}: x=${x}, y=${y}, tamanho=${qrSize}`);
        
        try {
          // Gerar QR code como base64
          const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
            width: 200,
            margin: 1,
          });
          
          // Adicionar QR code ao PDF
          pdf.addImage(qrCodeDataURL, 'PNG', x, y, qrSize, qrSize);
          
          // Adicionar texto abaixo do QR code
          pdf.setFontSize(8);
          const textY = y + qrSize + 5;
          pdf.text(`${qrData.nome}`, x, textY, { maxWidth: qrSize });
          pdf.text(`ID: ${qrData.id}`, x, textY + 8, { maxWidth: qrSize });
          pdf.text(`Lote: ${qrData.lote}`, x, textY + 16, { maxWidth: qrSize });
          
          qrCodesProcessados++;
          console.log(`QR code ${i + 1} ADICIONADO COM SUCESSO ao PDF`);
          
        } catch (qrError) {
          console.error(`ERRO ao processar QR code ${i + 1}:`, qrError);
        }
      }
      
      console.log('VERIFICAÇÃO FINAL DO PDF:');
      console.log('- QR codes solicitados:', qrCodes.length);
      console.log('- QR codes processados:', qrCodesProcessados);
      console.log('- Todos processados?:', qrCodesProcessados === qrCodes.length ? 'SIM ✓' : 'NÃO ✗');
      
      // Salvar PDF
      const fileName = `qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF gerado com sucesso:', fileName);
      console.log('Total de QR codes incluídos no PDF:', qrCodesProcessados);
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
