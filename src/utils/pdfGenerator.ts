
import jsPDF from 'jspdf';

interface Item {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo?: number;
  data_validade?: string;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export const generateInventoryPDF = (
  items: Item[],
  title: string,
  subtitle: string
) => {
  const pdf = new jsPDF();
  
  // Configurações
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;
  
  // Título
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text(subtitle, margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  
  // Data de geração
  const currentDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(`Data: ${currentDate}`, margin, yPosition);
  
  yPosition += 20;
  
  // Cabeçalhos das colunas
  pdf.setFont(undefined, 'bold');
  
  // Desenhar grade do cabeçalho
  const headerHeight = 8;
  const col1Width = 70;
  const col2Width = 60;
  const col3Width = pageWidth - margin - col1Width - col2Width - margin;
  
  // Fundo do cabeçalho
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
  
  // Bordas do cabeçalho
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);
  pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
  pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
  
  pdf.text('Item', margin + 2, yPosition);
  pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition);
  pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition);
  
  yPosition += 8;
  
  // Ordenar itens alfabeticamente
  const sortedItems = [...items].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  
  pdf.setFont(undefined, 'normal');
  
  // Listar itens
  sortedItems.forEach((item) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
      
      // Repetir cabeçalhos na nova página
      pdf.setFont(undefined, 'bold');
      
      // Fundo do cabeçalho
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
      
      // Bordas do cabeçalho
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
      pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
      
      pdf.text('Item', margin + 2, yPosition);
      pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition);
      pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition);
      
      yPosition += 8;
      pdf.setFont(undefined, 'normal');
    }
    
    const rowHeight = 12;
    
    // Desenhar bordas da linha
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition - 8, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition - 8, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition - 8, col3Width, rowHeight);
    
    // Nome do item
    const maxWidth = col1Width - 4;
    const lines = pdf.splitTextToSize(item.nome, maxWidth);
    pdf.text(lines[0], margin + 2, yPosition);
    
    // Quantidade atual - filtrar apenas para exibir a unidade correta
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    
    // Se o item tem baixo estoque, deixar a quantidade em vermelho
    const isLowStock = item.minimo && item.quantidade <= item.minimo;
    if (isLowStock) {
      pdf.setTextColor(255, 0, 0);
    }
    
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 2, yPosition);
    
    // Voltar cor para preto
    if (isLowStock) {
      pdf.setTextColor(0, 0, 0);
    }
    
    yPosition += 12;
  });
  
  // Adicionar algumas linhas extras em branco para novos itens
  yPosition += 15;
  pdf.setFont(undefined, 'bold');
  pdf.text('Novos itens:', margin, yPosition);
  yPosition += 10;
  pdf.setFont(undefined, 'normal');
  
  for (let i = 0; i < 8; i++) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    const rowHeight = 12;
    
    // Desenhar bordas para novos itens
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition - 8, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition - 8, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition - 8, col3Width, rowHeight);
    
    yPosition += 12;
  }
  
  // Rodapé
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 30,
      pdf.internal.pageSize.height - 10
    );
  }
  
  // Salvar o PDF
  const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};

export const generateStockListPDF = (
  items: Item[],
  title: string,
  subtitle: string
) => {
  const pdf = new jsPDF();
  
  // Configurações
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;
  
  // Título
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text(subtitle, margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  
  // Data de geração
  const currentDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(`Data: ${currentDate}`, margin, yPosition);
  
  yPosition += 20;
  
  // Cabeçalhos das colunas
  pdf.setFont(undefined, 'bold');
  
  // Desenhar grade do cabeçalho
  const headerHeight = 8;
  const col1Width = 90;
  const col2Width = 50;
  const col3Width = pageWidth - margin - col1Width - col2Width - margin;
  
  // Fundo do cabeçalho
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
  
  // Bordas do cabeçalho
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);
  pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
  pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
  
  pdf.text('Item', margin + 2, yPosition);
  pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition);
  pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition);
  
  yPosition += 8;
  
  // Ordenar itens alfabeticamente
  const sortedItems = [...items].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  
  pdf.setFont(undefined, 'normal');
  
  // Listar itens
  sortedItems.forEach((item) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
      
      // Repetir cabeçalhos na nova página
      pdf.setFont(undefined, 'bold');
      
      // Fundo do cabeçalho
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
      
      // Bordas do cabeçalho
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
      pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
      
      pdf.text('Item', margin + 2, yPosition);
      pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition);
      pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition);
      
      yPosition += 8;
      pdf.setFont(undefined, 'normal');
    }
    
    const rowHeight = 12;
    
    // Desenhar bordas da linha
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition - 8, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition - 8, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition - 8, col3Width, rowHeight);
    
    // Nome do item
    const maxWidth = col1Width - 4;
    const lines = pdf.splitTextToSize(item.nome, maxWidth);
    pdf.text(lines[0], margin + 2, yPosition);
    
    // Quantidade atual - filtrar apenas para exibir a unidade correta
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    
    // Se o item tem baixo estoque, deixar a quantidade em vermelho
    const isLowStock = item.minimo && item.quantidade <= item.minimo;
    if (isLowStock) {
      pdf.setTextColor(255, 0, 0);
    }
    
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 2, yPosition);
    
    // Voltar cor para preto
    if (isLowStock) {
      pdf.setTextColor(0, 0, 0);
    }
    
    yPosition += 12;
  });
  
  // Adicionar algumas linhas extras em branco para novos itens
  yPosition += 10;
  pdf.setFont(undefined, 'bold');
  pdf.text('Novos itens:', margin, yPosition);
  yPosition += 10;
  pdf.setFont(undefined, 'normal');
  
  for (let i = 0; i < 10; i++) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    const rowHeight = 12;
    
    // Desenhar bordas para novos itens
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition - 8, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition - 8, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition - 8, col3Width, rowHeight);
    
    yPosition += 12;
  }
  
  // Salvar o PDF
  const fileName = `lista_compras_${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};
