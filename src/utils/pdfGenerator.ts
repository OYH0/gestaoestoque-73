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
  let yPosition = 28;
  
  // Título
  pdf.setFontSize(17);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  
  yPosition += 9;
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.text(subtitle, margin, yPosition);
  
  yPosition += 11;
  pdf.setFontSize(9);
  
  // Data de geração
  const currentDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(`Data: ${currentDate}`, margin, yPosition);
  
  yPosition += 13;
  
  // Cabeçalhos das colunas
  pdf.setFont(undefined, 'bold');
  
  // Desenhar grade do cabeçalho
  const headerHeight = 7;
  const col1Width = 68;
  const col2Width = 37;
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
  
  pdf.setFontSize(9);
  pdf.text('Item', margin + 2, yPosition - 1);
  pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition - 1);
  pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition - 1);
  
  yPosition += headerHeight - 1;
  
  // Ordenar itens alfabeticamente
  const sortedItems = [...items].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(8);
  
  // Listar itens
  sortedItems.forEach((item) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 28;

      // Repetir cabeçalho
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(9);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
      pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
      pdf.text('Item', margin + 2, yPosition - 1);
      pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition - 1);
      pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition - 1);
      yPosition += headerHeight - 1;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
    }
    const rowHeight = 8;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);

    // Nome do item
    const maxWidth = col1Width - 4;
    const lines = pdf.splitTextToSize(item.nome, maxWidth);
    pdf.text(lines[0], margin + 2, yPosition + 6);

    // Quantidade atual
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    const isLowStock = item.minimo && item.quantidade <= item.minimo;
    if (isLowStock) {
      pdf.setTextColor(255, 0, 0);
    }
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 2, yPosition + 6);
    if (isLowStock) {
      pdf.setTextColor(0, 0, 0);
    }
    yPosition += rowHeight;
  });
  
  // Adicionar linhas extras para novos itens
  yPosition += 7;
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(9);
  pdf.text('Novos itens:', margin, yPosition);
  yPosition += 7;
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(8);
  
  for (let i = 0; i < 8; i++) {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 28;
    }
    const rowHeight = 8;
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
    pdf.setFontSize(8);
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
  let yPosition = 28;
  
  // Título
  pdf.setFontSize(17);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  
  yPosition += 9;
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.text(subtitle, margin, yPosition);
  
  yPosition += 11;
  pdf.setFontSize(9);
  
  // Data de geração
  const currentDate = new Date().toLocaleDateString('pt-BR');
  pdf.text(`Data: ${currentDate}`, margin, yPosition);
  
  yPosition += 13;
  
  // Cabeçalhos das colunas
  pdf.setFont(undefined, 'bold');
  
  const headerHeight = 7;
  const col1Width = 88;
  const col2Width = 36;
  const col3Width = pageWidth - margin - col1Width - col2Width - margin;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);
  pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
  pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
  
  pdf.setFontSize(9);
  pdf.text('Item', margin + 2, yPosition - 1);
  pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition - 1);
  pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition - 1);
  
  yPosition += headerHeight - 1;
  const sortedItems = [...items].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(8);
  
  sortedItems.forEach((item) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 28;
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(9);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
      pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
      pdf.text('Item', margin + 2, yPosition - 1);
      pdf.text('Qtd. Atual', margin + col1Width + 2, yPosition - 1);
      pdf.text('Qtd. a Comprar', margin + col1Width + col2Width + 2, yPosition - 1);
      yPosition += headerHeight - 1;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(8);
    }
    const rowHeight = 8;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);

    const maxWidth = col1Width - 4;
    const lines = pdf.splitTextToSize(item.nome, maxWidth);
    pdf.text(lines[0], margin + 2, yPosition + 6);

    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    const isLowStock = item.minimo && item.quantidade <= item.minimo;
    if (isLowStock) {
      pdf.setTextColor(255, 0, 0);
    }
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 2, yPosition + 6);
    if (isLowStock) {
      pdf.setTextColor(0, 0, 0);
    }
    yPosition += rowHeight;
  });
  yPosition += 7;
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(9);
  pdf.text('Novos itens:', margin, yPosition);
  yPosition += 7;
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(8);

  for (let i = 0; i < 10; i++) {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 28;
    }
    const rowHeight = 8;
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
    pdf.setFontSize(8);
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 30,
      pdf.internal.pageSize.height - 10
    );
  }

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
  const margin = 12;
  let yPosition = 24;
  
  // Título
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, margin, yPosition);
  
  yPosition += 9;
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(subtitle, margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(8);

  // Data de geração
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  pdf.text(`Data: ${currentDate} às ${currentTime}`, margin, yPosition);

  yPosition += 12;

  // Cabeçalhos das colunas
  pdf.setFont(undefined, 'bold');

  const headerHeight = 7;
  const col1Width = 44;  // Item
  const col2Width = 20;  // Quantidade
  const col3Width = 16;  // Tipo
  const col4Width = 27;  // Data/Hora
  const col5Width = pageWidth - margin - col1Width - col2Width - col3Width - col4Width - margin; // Observações

  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);
  pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
  pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width + col3Width, yPosition - 6, col4Width, headerHeight);
  pdf.rect(margin + col1Width + col2Width + col3Width + col4Width, yPosition - 6, col5Width, headerHeight);

  pdf.setFontSize(8);
  pdf.text('Item', margin + 1, yPosition - 2);
  pdf.text('Qtd.', margin + col1Width + 1, yPosition - 2);
  pdf.text('Tipo', margin + col1Width + col2Width + 1, yPosition - 2);
  pdf.text('Data/Hora', margin + col1Width + col2Width + col3Width + 1, yPosition - 2);
  pdf.text('Obs.', margin + col1Width + col2Width + col3Width + col4Width + 1, yPosition - 2);

  yPosition += headerHeight - 2;

  const sortedHistorico = [...historico].sort((a, b) => 
    new Date(b.data_operacao).getTime() - new Date(a.data_operacao).getTime()
  );

  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(7.5);

  sortedHistorico.forEach((item) => {
    if (yPosition > 265) {
      pdf.addPage();
      yPosition = 24;
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(8);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 6, pageWidth - 2 * margin, headerHeight, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.rect(margin, yPosition - 6, col1Width, headerHeight);
      pdf.rect(margin + col1Width, yPosition - 6, col2Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width, yPosition - 6, col3Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width + col3Width, yPosition - 6, col4Width, headerHeight);
      pdf.rect(margin + col1Width + col2Width + col3Width + col4Width, yPosition - 6, col5Width, headerHeight);

      pdf.text('Item', margin + 1, yPosition - 2);
      pdf.text('Qtd.', margin + col1Width + 1, yPosition - 2);
      pdf.text('Tipo', margin + col1Width + col2Width + 1, yPosition - 2);
      pdf.text('Data/Hora', margin + col1Width + col2Width + col3Width + 1, yPosition - 2);
      pdf.text('Obs.', margin + col1Width + col2Width + col3Width + col4Width + 1, yPosition - 2);
      yPosition += headerHeight - 2;
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(7.5);
    }
    const rowHeight = 8;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    pdf.rect(margin, yPosition, col1Width, rowHeight);
    pdf.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width + col3Width, yPosition, col4Width, rowHeight);
    pdf.rect(margin + col1Width + col2Width + col3Width + col4Width, yPosition, col5Width, rowHeight);

    // Nome do item
    const maxWidth = col1Width - 3;
    const lines = pdf.splitTextToSize(item.item_nome, maxWidth);
    pdf.text(lines[0], margin + 1, yPosition + 5);

    // Quantidade e unidade
    const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
    pdf.text(`${item.quantidade} ${unidadeDisplay}`, margin + col1Width + 1, yPosition + 5);

    // Tipo
    const tipoText = item.tipo === 'entrada' ? 'ENT' : item.tipo === 'saida' ? 'SAÍ' : item.tipo.slice(0,3).toUpperCase();
    if (item.tipo === 'entrada') {
      pdf.setTextColor(0, 128, 0);
    } else if (item.tipo === 'saida') {
      pdf.setTextColor(255, 0, 0);
    } else {
      pdf.setTextColor(0, 0, 255);
    }
    pdf.text(tipoText, margin + col1Width + col2Width + 1, yPosition + 5);
    pdf.setTextColor(0, 0, 0);

    // Data e hora
    const dataFormatada = new Date(item.data_operacao).toLocaleDateString('pt-BR');
    const horaFormatada = new Date(item.data_operacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    pdf.text(`${dataFormatada}\n${horaFormatada}`, margin + col1Width + col2Width + col3Width + 1, yPosition + 5);

    // Observações
    if (item.observacoes) {
      const obsLines = pdf.splitTextToSize(item.observacoes, col5Width - 2);
      pdf.text(obsLines[0], margin + col1Width + col2Width + col3Width + col4Width + 1, yPosition + 5);
    }
    yPosition += rowHeight;
  });

  // Rodapé estatísticas
  yPosition += 8;
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(8);
  pdf.text(`Total de registros: ${historico.length}`, margin, yPosition);

  // Rodapé da página
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 30,
      pdf.internal.pageSize.height - 10
    );
  }

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
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  let content = '';
  content += `📋 *${title}*\n`;
  content += `${subtitle}\n`;
  content += `📅 Relatório gerado em: ${currentDate} às ${currentTime}\n`;
  content += `📊 Total de registros: ${historico.length}\n`;
  content += '\n' + '━'.repeat(40) + '\n\n';
  
  // Cabeçalho
  content += 'ITEM'.padEnd(30) + 'QUANTIDADE'.padEnd(15) + 'TIPO'.padEnd(10) + 'DATA/HORA'.padEnd(12) + 'OBSERVAÇÕES\n';
  content += '-'.repeat(80) + '\n';
  
  // Agrupar por data para melhor organização
  const groupedByDate: { [key: string]: HistoricoItem[] } = {};
  historico.forEach(item => {
    const dateKey = new Date(item.data_operacao).toLocaleDateString('pt-BR');
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(item);
  });
  
  // Listar histórico agrupado por data
  Object.entries(groupedByDate).forEach(([date, items]) => {
    content += `📅 *${date}*\n`;
    content += '─'.repeat(25) + '\n';
    
    items.forEach((item) => {
      const unidadeDisplay = (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') ? 'pç' : item.unidade;
      const tipoEmoji = item.tipo === 'entrada' ? '⬆️' : '⬇️';
      const tipoText = item.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA';
      const hora = new Date(item.data_operacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      content += `${tipoEmoji} *${item.item_nome}*\n`;
      content += `   📦 Quantidade: ${item.quantidade} ${unidadeDisplay}\n`;
      content += `   🔄 Tipo: ${tipoText}\n`;
      content += `   🕐 Hora: ${hora}\n`;
      
      if (item.observacoes) {
        content += `   📝 Obs: ${item.observacoes}\n`;
      }
      
      content += '\n';
    });
    
    content += '\n';
  });
  
  content += '━'.repeat(40) + '\n';
  content += `📊 *Resumo:*\n`;
  const entradas = historico.filter(item => item.tipo === 'entrada').length;
  const saidas = historico.filter(item => item.tipo === 'saida').length;
  content += `⬆️ Entradas: ${entradas}\n`;
  content += `⬇️ Saídas: ${saidas}\n`;
  content += `📋 Total: ${historico.length} movimentações\n`;
  
  // Criar e baixar arquivo
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historico_whatsapp_${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return a.download;
};
