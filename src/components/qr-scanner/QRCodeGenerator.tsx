
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QrCode, Printer, Download, Loader2 } from 'lucide-react';
import { useQRCodeGenerator, QRCodeData } from '@/hooks/useQRCodeGenerator';
import { toast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  qrCodes: QRCodeData[];
  onClose: () => void;
  itemName: string;
  stockType?: string;
}

export function QRCodeGenerator({ qrCodes, onClose, itemName, stockType }: QRCodeGeneratorProps) {
  const { generateQRCodePDF, isGenerating } = useQRCodeGenerator();
  const [isOpen, setIsOpen] = React.useState(true);

  const handleGeneratePDF = async () => {
    if (!qrCodes || qrCodes.length === 0) {
      toast({
        title: 'Sem QR codes para gerar',
        description: 'Não há códigos QR para gerar para este item.',
        variant: 'destructive'
      });
      return;
    }

    console.log('🖨 Iniciando geração dos PDFs de QR codes!', { qrCodes });
    const result = await generateQRCodePDF(qrCodes);

    // Exibe erro para feedback rápido se falhar e marca no console
    if (result && !result.success) {
      console.error('❌ Falha ao gerar PDF dos QR codes:', result.error);
      toast({
        title: 'Erro ao gerar PDF dos QR codes',
        description: result.error?.message || 'Ocorreu um erro ao gerar os arquivos.',
        variant: 'destructive'
      });
      return;
    }

    if (result && result.success) {
      toast({
        title: "PDFs gerados com sucesso",
        description: "As etiquetas com QR codes foram baixadas.",
      });
      handleClose();
    }
  };
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Gerar QR Codes
          </DialogTitle>
          <DialogDescription>
            Monte e baixe as etiquetas individuais para cada unidade deste item. Cole as etiquetas nas embalagens para facilitar o rastreio automático no estoque.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{itemName}</h3>
            <p className="text-blue-700 text-sm">
              Serão gerados <strong>{qrCodes.length} QR codes</strong> individuais para este item.
              {stockType && <span> ({stockType})</span>}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Cada QR code conterá:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• ID único para rastreamento</li>
              <li>• Nome do produto</li>
              <li>• Número do lote</li>
              <li>• Categoria do item</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Dica:</strong> Cole os QR codes nas embalagens individuais. 
            Ao escanear, o sistema automaticamente removerá 1 unidade do estoque.
          </div>

          <Button variant="outline" onClick={handleClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
