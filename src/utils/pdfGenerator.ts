
import jsPDF from 'jspdf';

interface Item {
  id: number;
  name: string;
  quantidade: number;
  unidade: string;
  categoria: string;
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
  
  // Cabeçalho da tabela - Estoque Atual
  pdf.setFont(undefined, 'bold');
  pdf.text('ESTOQUE ATUAL', margin, yPosition);
  yPosition += 10;
  
  // Cabeçalhos das colunas
  pdf.text('Item', margin, yPosition);
  pdf.text('Quantidade', margin + 120, yPosition);
  pdf.text('Categoria', margin + 160, yPosition);
  
  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition); // Linha horizontal
  yPosition += 8;
  
  // Ordenar itens alfabeticamente
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  
  pdf.setFont(undefined, 'normal');
  
  // Listar itens do estoque atual
  sortedItems.forEach((item) => {
    if (yPosition > 250) { // Nova página se necessário
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(item.name, margin, yPosition);
    pdf.text(`${item.quantidade} ${item.unidade}`, margin + 120, yPosition);
    pdf.text(item.categoria, margin + 160, yPosition);
    yPosition += 8;
  });
  
  yPosition += 15;
  
  // Seção para compras
  if (yPosition > 200) {
    pdf.addPage();
    yPosition = 30;
  }
  
  pdf.setFont(undefined, 'bold');
  pdf.text('LISTA DE COMPRAS (Para preenchimento manual)', margin, yPosition);
  yPosition += 15;
  
  // Cabeçalhos para lista de compras
  pdf.text('Item', margin, yPosition);
  pdf.text('Quantidade', margin + 120, yPosition);
  pdf.text('Observações', margin + 160, yPosition);
  
  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  pdf.setFont(undefined, 'normal');
  
  // Criar linhas em branco para preenchimento manual
  for (let i = 0; i < 15; i++) {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // Linhas para preenchimento
    pdf.line(margin, yPosition + 3, margin + 110, yPosition + 3); // Linha do item
    pdf.line(margin + 120, yPosition + 3, margin + 150, yPosition + 3); // Linha da quantidade
    pdf.line(margin + 160, yPosition + 3, pageWidth - margin, yPosition + 3); // Linha das observações
    
    yPosition += 15;
  }
  
  // Salvar o PDF
  const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.pdf`;
  pdf.save(fileName);
};
