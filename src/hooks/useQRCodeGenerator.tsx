
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
    console.log('📄 === INÍCIO generateQRCodePDF ===');
    console.log('📦 QR codes recebidos para PDF:', qrCodes.length);
    console.log('🔍 VERIFICAÇÃO DE TODOS OS QR CODES:');
    qrCodes.forEach((qr, index) => {
      console.log(`${index + 1}. ${qr.nome} (ID: ${qr.id})`);
    });
    
    if (qrCodes.length === 0) {
      console.error('❌ ERRO: Nenhum QR code fornecido para gerar PDF!');
      return { success: false, error: 'Nenhum QR code fornecido' };
    }
    
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configuração OTIMIZADA para garantir que todos os QR codes caibam
      const qrSize = 50; // Reduzido de 60 para 50
      const margin = 15;
      const spacingX = 10; // Reduzido espaçamento horizontal
      const spacingY = 25; // Reduzido espaçamento vertical
      const codesPerRow = 3; // Aumentado para 3 colunas
      const rowsPerPage = 8; // Aumentado para 8 linhas por página
      const codesPerPage = codesPerRow * rowsPerPage; // 24 QR codes por página
      
      console.log('⚙️ NOVA Configuração do PDF:', {
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
      
      console.log(`🔄 Processando ${qrCodes.length} QR codes...`);
      
      for (let i = 0; i < qrCodes.length; i++) {
        const qrData = qrCodes[i];
        const pageIndex = Math.floor(i / codesPerPage);
        const indexInPage = i % codesPerPage;
        const row = Math.floor(indexInPage / codesPerRow);
        const col = indexInPage % codesPerRow;
        
        console.log(`📍 PROCESSANDO QR ${i + 1}/${qrCodes.length}: ${qrData.nome}`);
        console.log(`📄 Página: ${pageIndex + 1}, Linha: ${row + 1}, Coluna: ${col + 1}`);
        
        // Adicionar nova página se necessário
        if (i > 0 && indexInPage === 0) {
          pdf.addPage();
          console.log(`📄 NOVA PÁGINA ${pageIndex + 1} adicionada`);
        }
        
        // Calcular posições com espaçamento otimizado
        const x = margin + col * (qrSize + spacingX);
        const y = margin + row * (qrSize + spacingY);
        
        console.log(`📍 Posição: x=${x}, y=${y}, tamanho=${qrSize}`);
        console.log(`🔍 Verificação limites: x+size=${x + qrSize} (limite: ${pageWidth}), y+size=${y + qrSize} (limite: ${pageHeight})`);
        
        // VERIFICAR se está dentro dos limites da página
        if (x + qrSize > pageWidth - margin || y + qrSize > pageHeight - margin) {
          console.warn(`⚠️ QR code ${i + 1} pode estar fora dos limites da página!`);
          console.warn(`Posição: x=${x}, y=${y}, limites: width=${pageWidth}, height=${pageHeight}`);
        }
        
        try {
          // Gerar QR code como base64
          const qrCodeDataURL = await QRCode.toDataURL(qrData.id, {
            width: 200,
            margin: 1,
          });
          
          // Adicionar QR code ao PDF
          pdf.addImage(qrCodeDataURL, 'PNG', x, y, qrSize, qrSize);
          
          // Adicionar texto abaixo do QR code com fonte menor
          pdf.setFontSize(6); // Fonte menor para caber melhor
          const textY = y + qrSize + 2;
          const maxTextWidth = qrSize - 2;
          
          // Nome (truncado se necessário)
          const nameText = qrData.nome.length > 15 ? qrData.nome.substring(0, 15) + '...' : qrData.nome;
          pdf.text(nameText, x, textY, { maxWidth: maxTextWidth });
          
          // ID (só os últimos caracteres)
          const idText = `${qrData.id.slice(-8)}`;
          pdf.text(idText, x, textY + 4, { maxWidth: maxTextWidth });
          
          qrCodesProcessados++;
          console.log(`✅ QR code ${i + 1} INCLUÍDO COM SUCESSO no PDF`);
          
        } catch (qrError) {
          console.error(`❌ ERRO ao processar QR code ${i + 1}:`, qrError);
        }
      }
      
      console.log('🏁 === VERIFICAÇÃO FINAL DO PDF ===');
      console.log('📋 QR codes solicitados:', qrCodes.length);
      console.log('📦 QR codes processados:', qrCodesProcessados);
      console.log('🎯 Todos processados?:', qrCodesProcessados === qrCodes.length ? '✅ SIM' : '❌ NÃO');
      
      if (qrCodesProcessados !== qrCodes.length) {
        console.error('❌ ERRO CRÍTICO: Nem todos os QR codes foram processados!');
        console.error('Diferença:', qrCodes.length - qrCodesProcessados, 'QR codes não processados');
      }
      
      // Salvar PDF
      const fileName = `qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('📄 PDF gerado com sucesso:', fileName);
      console.log('📦 Total de QR codes incluídos no PDF:', qrCodesProcessados);
      console.log('🚀 === FIM generateQRCodePDF ===');
      
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
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
