import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X, Loader2 } from 'lucide-react';
import { useQRCodeScanner } from '@/hooks/useQRCodeScanner';
import { toast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function QRScanner({ onClose, onSuccess }: QRScannerProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualProcessing, setManualProcessing] = useState(false);
  const { processQRCode, isProcessing } = useQRCodeScanner();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log('Iniciando câmera e scanner QR...');
      
      if (!videoRef.current) {
        throw new Error('Elemento de vídeo não encontrado');
      }

      // Verificar se QR Scanner é suportado
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('Câmera não disponível neste dispositivo');
      }

      // Criar instância do QR Scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detectado:', result.data);
          handleQRCodeDetected(result.data);
        },
        {
          onDecodeError: (error) => {
            // Silenciar erros de decodificação (normal quando não há QR code na view)
            console.debug('Erro de decodificação (normal):', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Câmera traseira
        }
      );

      // Iniciar o scanner
      await qrScannerRef.current.start();
      setHasCamera(true);
      setIsScanning(true);
      console.log('Scanner QR iniciado com sucesso');

    } catch (error) {
      console.error('Erro ao iniciar scanner:', error);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    console.log('Parando scanner QR...');
    setIsScanning(false);
    
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
      console.log('Scanner QR parado');
    }
    
    setHasCamera(false);
  };

  const handleQRCodeDetected = async (qrCodeData: string) => {
    if (isProcessing) return;
    
    console.log('Processando QR Code:', qrCodeData);
    setIsScanning(false);
    
    // Pausar o scanner temporariamente
    if (qrScannerRef.current) {
      qrScannerRef.current.pause();
    }
    
    try {
      const result = await processQRCode(qrCodeData, onSuccess);
      
      if (result.success) {
        toast({
          title: "QR Code processado!",
          description: `Item ${result.itemName} foi removido do estoque.`,
        });
        stopCamera();
        handleClose();
      } else {
        toast({
          title: "Erro ao processar QR Code",
          description: result.error || "QR Code não reconhecido",
          variant: "destructive",
        });
        // Retomar o scanner após erro
        if (qrScannerRef.current) {
          qrScannerRef.current.start();
          setIsScanning(true);
        }
      }
    } catch (error) {
      console.error('Erro ao processar QR code:', error);
      toast({
        title: "Erro no scanner",
        description: "Ocorreu um erro ao processar o QR Code",
        variant: "destructive",
      });
      // Retomar o scanner após erro
      if (qrScannerRef.current) {
        qrScannerRef.current.start();
        setIsScanning(true);
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    if (!manualCode.trim()) {
      setManualError('Digite um código.');
      return;
    }

    setManualProcessing(true);
    try {
      const result = await processQRCode(manualCode.trim(), onSuccess);
      if (result.success) {
        toast({
          title: "QR Code processado!",
          description: `Item ${result.itemName} foi removido do estoque.`,
        });
        stopCamera();
        handleClose();
      } else {
        setManualError(result.error || "QR Code não reconhecido");
      }
    } catch (error) {
      setManualError('Erro ao processar código manual.');
    } finally {
      setManualProcessing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    onClose();
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scanner de QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-gray-900 rounded-lg object-cover"
              playsInline
              muted
              style={{ background: '#000' }}
            />
            {cameraError && (
              <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="mb-4">{cameraError}</div>
                  <Button 
                    onClick={startCamera} 
                    variant="outline"
                    className="border-white text-gray-900 bg-white hover:bg-gray-100 focus:bg-gray-100"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            )}
            {isScanning && !cameraError && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </div>
                ) : (
                  'Posicione o QR Code na área da câmera'
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-2">
            <input
              type="text"
              className="w-full rounded border px-3 py-2 bg-background text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o código manualmente"
              value={manualCode}
              disabled={isProcessing || manualProcessing}
              onChange={e => setManualCode(e.target.value)}
              autoFocus={cameraError ? true : false}
              maxLength={48}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing || manualProcessing}
              variant="outline"
            >
              {manualProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </span>
              ) : (
                "Processar Código Manual"
              )}
            </Button>
            {manualError && (
              <div className="text-sm text-red-600 text-center">{manualError}</div>
            )}
          </form>

          <div className="text-xs text-gray-500 text-center">
            Posicione o QR Code na frente da câmera para escaneamento automático<br />
            ou insira o código manualmente.
          </div>

          <Button variant="outline" onClick={handleClose} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Fechar Scanner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
