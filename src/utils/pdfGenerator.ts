
import jsPDF from 'jspdf';

interface Item {
  id: string;
  nome: string;
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
  
  // Cabeçalhos das colunas
  pdf.setFont(undefined, 'bold');
  pdf.text('Item', margin, yPosition);
  pdf.text('Qtd. Atual', margin + 90, yPosition);
  pdf.text('Qtd. a Comprar', margin + 140, yPosition);
  
  yPosition += 5;
  pdf.line(margin, yPosition, pageWidth - margin, yPosition); // Linha horizontal
  yPosition += 8;
  
  // Ordenar itens alfabeticamente
  const sortedItems = [...items].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  
  pdf.setFont(undefined, 'normal');
  
  // Listar itens
  sortedItems.forEach((item) => {
    if (yPosition > 250) { // Nova página se necessário
      pdf.addPage();
      yPosition = 30;
      
      // Repetir cabeçalhos na nova página
      pdf.setFont(undefined, 'bold');
      pdf.text('Item', margin, yPosition);
      pdf.text('Qtd. Atual', margin + 90, yPosition);
      pdf.text('Qtd. a Comprar', margin + 140, yPosition);
      
      yPosition += 5;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
      pdf.setFont(undefined, 'normal');
    }
    
    // Nome do item
    pdf.text(item.nome, margin, yPosition);
    
    // Quantidade atual
    pdf.text(`${item.quantidade} ${item.unidade}`, margin + 90, yPosition);
    
    // Linha para preenchimento manual da quantidade a comprar
    pdf.line(margin + 140, yPosition + 2, pageWidth - margin - 10, yPosition + 2);
    
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
    
    // Linhas para preenchimento manual de novos itens
    pdf.line(margin, yPosition + 2, margin + 80, yPosition + 2); // Linha do item
    pdf.line(margin + 90, yPosition + 2, margin + 130, yPosition + 2); // Linha da quantidade atual
    pdf.line(margin + 140, yPosition + 2, pageWidth - margin - 10, yPosition + 2); // Linha da quantidade a comprar
    
    yPosition += 15;
  }
  
  // Salvar o PDF
  const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '_')}.pdf`;
  pdf.save(fileName);
};
