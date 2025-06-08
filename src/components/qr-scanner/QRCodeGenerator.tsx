
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode, Printer, Download, Loader2 } from 'lucide-react';
import { useQRCodeGenerator, QRCodeData } from '@/hooks/useQRCodeGenerator';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodes: QRCodeData[];
  itemName: string;
}

export function QRCodeGenerator({ isOpen, onClose, qrCodes, itemName }: QRCodeGeneratorProps) {
  const { generateQRCodePDF, isGenerating } = useQRCodeGenerator();

  const handleGeneratePDF = async () => {
    const result = await generateQRCodePDF(qrCodes);
    
    if (result.success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Gerar QR Codes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{itemName}</h3>
            <p className="text-blue-700 text-sm">
              Serão gerados <strong>{qrCodes.length} QR codes</strong> individuais para este item.
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

          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
