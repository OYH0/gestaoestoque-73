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

interface HistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: string;
  data_operacao: string;
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
  
  yPosition += headerHeight;
  
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
      
      yPosition += headerHeight;
      pdf.setFont(undefined, 'normal');
    }
    
    const rowHeight = 12;
    
    // Desenhar bordas da linha
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    
    // Nome do item
    const maxWidth = col1Width - 4;
    const lines = pdf.splitTextToSize(item.nome, maxWidth);
    pdf.text(lines[0], margin + 2, yPosition + 8);
    
    // Quantidade atual - filtrar apenas para exibir a unidade correta
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    
    // Se o item tem baixo estoque, deixar a quantidade em vermelho
    const isLowStock = item.minimo && item.quantidade <= item.minimo;
    if (isLowStock) {
      pdf.setTextColor(255, 0, 0);
    }
    
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 2, yPosition + 8);
    
    // Voltar cor para preto
    if (isLowStock) {
      pdf.setTextColor(0, 0, 0);
    }
    
    yPosition += rowHeight;
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
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    
    yPosition += rowHeight;
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
  
  yPosition += headerHeight;
  
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
      
      yPosition += headerHeight;
      pdf.setFont(undefined, 'normal');
    }
    
    const rowHeight = 12;
    
    // Desenhar bordas da linha
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    
    // Nome do item
    const maxWidth = col1Width - 4;
    const lines = pdf.splitTextToSize(item.nome, maxWidth);
    pdf.text(lines[0], margin + 2, yPosition + 8);
    
    // Quantidade atual - filtrar apenas para exibir a unidade correta
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    
    // Se o item tem baixo estoque, deixar a quantidade em vermelho
    const isLowStock = item.minimo && item.quantidade <= item.minimo;
    if (isLowStock) {
      pdf.setTextColor(255, 0, 0);
    }
    
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 2, yPosition + 8);
    
    // Voltar cor para preto
    if (isLowStock) {
      pdf.setTextColor(0, 0, 0);
    }
    
    yPosition += rowHeight;
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
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    
    yPosition += rowHeight;
  }
  
  // Salvar o PDF
  const fileName = `lista_compras_${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};

export const generateHistoryPDF = (
  historico: HistoricoItem[],
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
  
  const headerHeight = 8;
  const col1Width = 50; // Item
  const col2Width = 30; // Quantidade
  const col3Width = 25; // Tipo
  const col4Width = 35; // Data
  const col5Width = pageWidth - margin - col1Width - col2Width - col3Width - col4Width - margin; // Observações
  
  // Fundo do cabeçalho
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
  
  // Bordas do cabeçalho
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);
  pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
  pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width + col3Width, yPosition - 6, col4Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width + col3Width + col4Width, yPosition - 6, col5Width, headerHeight);
  
  pdf.text('Item', margin + 2, yPosition);
  pdf.text('Qtd.', margin + col1Width + 2, yPosition);
  pdf.text('Tipo', margin + col1Width + col2Width + 2, yPosition);
  pdf.text('Data', margin + col1Width + col2Width + col3Width + 2, yPosition);
  pdf.text('Obs.', margin + col1Width + col2Width + col3Width + col4Width + 2, yPosition);
  
  yPosition += headerHeight;
  
  // Ordenar histórico por data (mais recente primeiro)
  const sortedHistorico = [...historico].sort((a, b) => 
    new Date(b.data_operacao).getTime() - new Date(a.data_operacao).getTime()
  );
  
  pdf.setFont(undefined, 'normal');
  
  // Listar histórico
  sortedHistorico.forEach((item) => {
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
      pdf.rect(margin + col1Width + col2Width + col3Width, yPosition - 6, col4Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width + col3Width + col4Width, yPosition - 6, col5Width, headerHeight);
      
      pdf.text('Item', margin + 2, yPosition);
      pdf.text('Qtd.', margin + col1Width + 2, yPosition);
      pdf.text('Tipo', margin + col1Width + col2Width + 2, yPosition);
      pdf.text('Data', margin + col1Width + col2Width + col3Width + 2, yPosition);
      pdf.text('Obs.', margin + col1Width + col2Width + col3Width + col4Width + 2, yPosition);
      
      yPosition += headerHeight;
      pdf.setFont(undefined, 'normal');
    }
    
    const rowHeight = 12;
    
    // Desenhar bordas da linha
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width + col3Width, yPosition, col4Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width + col3Width + col4Width, yPosition, col5Width, rowHeight);
    
    // Nome do item
    const maxWidth = col1Width - 4;
    const lines = pdf.splitTextToSize(item.item_nome, maxWidth);
    pdf.text(lines[0], margin + 2, yPosition + 8);
    
    // Quantidade e unidade
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 2, yPosition + 8);
    
    // Tipo (entrada/saída)
    const tipoText = item.tipo === 'entrada' ? 'ENT' : item.tipo === 'saida' ? 'SAÍ' : item.tipo.slice(0,3).toUpperCase();
    
    // Colorir tipo baseado na operação
    if (item.tipo === 'entrada') {
      pdf.setTextColor(0, 128, 0); // Verde
    } else if (item.tipo === 'saida') {
      pdf.setTextColor(255, 0, 0); // Vermelho
    } else {
      pdf.setTextColor(0, 0, 255); // Azul para outros tipos
    }
    
    pdf.text(tipoText, margin + col1Width + col2Width + 2, yPosition + 8);
    
    // Voltar cor para preto
    pdf.setTextColor(0, 0, 0);
    
    // Data
    const dataFormatada = new Date(item.data_operacao).toLocaleDateString('pt-BR');
    pdf.text(dataFormatada, margin + col1Width + col2Width + col3Width + 2, yPosition + 8);
    
    // Observações (resumidas)
    if (item.observacoes) {
      const obsLines = pdf.splitTextToSize(item.observacoes, col5Width - 4);
      pdf.text(obsLines[0], margin + col1Width + col2Width + col3Width + col4Width + 2, yPosition + 8);
    }
    
    yPosition += rowHeight;
  });
  
  // Rodapé com estatísticas
  yPosition += 10;
  pdf.setFont(undefined, 'bold');
  pdf.text(`Total de registros: ${historico.length}`, margin, yPosition);
  
  // Rodapé com número de páginas
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
  const fileName = `historico_${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};

export const generateHistoryTXT = (
  historico: HistoricoItem[],
  title: string,
  subtitle: string
) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  let content = '';
  content += `${title}\n`;
  content += `${subtitle}\n`;
  content += `Data: ${currentDate}\n`;
  content += `Total de registros: ${historico.length}\n`;
  content += '\n' + '='.repeat(80) + '\n\n';
  
  // Cabeçalho
  content += 'ITEM'.padEnd(30) + 'QUANTIDADE'.padEnd(15) + 'TIPO'.padEnd(10) + 'DATA'.padEnd(12) + 'OBSERVAÇÕES\n';
  content += '-'.repeat(80) + '\n';
  
  // Ordenar histórico por data (mais recente primeiro)
  const sortedHistorico = [...historico].sort((a, b) => 
    new Date(b.data_operacao).getTime() - new Date(a.data_operacao).getTime()
  );
  
  // Listar histórico
  sortedHistorico.forEach((item) => {
    const nome = item.item_nome.length > 28 ? item.item_nome.substring(0, 28) + '..' : item.item_nome;
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    const quantidade = `${item.quantidade} ${unidadeDisplay}`;
    const tipo = item.tipo === 'entrada' ? 'ENTRADA' : item.tipo === 'saida' ? 'SAÍDA' : item.tipo.toUpperCase();
    const data = new Date(item.data_operacao).toLocaleDateString('pt-BR');
    const obs = item.observacoes ? (item.observacoes.length > 20 ? item.observacoes.substring(0, 20) + '...' : item.observacoes) : '';
    
    content += nome.padEnd(30) + quantidade.padEnd(15) + tipo.padEnd(10) + data.padEnd(12) + obs + '\n';
  });
  
  content += '\n' + '='.repeat(80) + '\n';
  content += `Relatório gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
  
  // Criar e baixar arquivo
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historico_${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return a.download;
};
