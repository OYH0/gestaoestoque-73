
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X, Loader2 } from 'lucide-react';
import { useQRCodeScanner } from '@/hooks/useQRCodeScanner';
import { toast } from '@/hooks/use-toast';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QRScanner({ isOpen, onClose, onSuccess }: QRScannerProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { processQRCode, isProcessing } = useQRCodeScanner();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Lista de QR codes de teste para demonstração
  const testQRCodes = [
    'CF-12345-ABC123-001',
    'ES-67890-DEF456-002', 
    'DESC-11111-GHI789-003'
  ];

  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log('Iniciando câmera...');
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Câmera não disponível neste dispositivo');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setHasCamera(true);
              setIsScanning(true);
              console.log('Câmera iniciada com sucesso');
            }).catch((error) => {
              console.error('Erro ao reproduzir vídeo:', error);
              setCameraError('Erro ao iniciar a visualização da câmera');
            });
          }
        };

        videoRef.current.onerror = (error) => {
          console.error('Erro no elemento de vídeo:', error);
          setCameraError('Erro no elemento de vídeo');
        };
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões ou use os códigos de teste abaixo.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    console.log('Parando câmera...');
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track parada:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setHasCamera(false);
  };

  const handleQRCodeDetected = async (qrCodeData: string) => {
    if (isProcessing) return;
    
    console.log('Processando QR Code:', qrCodeData);
    setIsScanning(false);
    
    try {
      const result = await processQRCode(qrCodeData);
      
      if (result.success) {
        toast({
          title: "QR Code processado!",
          description: `Item ${result.itemName} foi removido do estoque.`,
        });
        stopCamera();
        onClose();
        onSuccess();
      } else {
        toast({
          title: "Erro ao processar QR Code",
          description: result.error || "QR Code não reconhecido",
          variant: "destructive",
        });
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Erro ao processar QR code:', error);
      toast({
        title: "Erro no scanner",
        description: "Ocorreu um erro ao processar o QR Code",
        variant: "destructive",
      });
      setIsScanning(true);
    }
  };

  const handleTestQRCode = async (qrCode: string) => {
    await handleQRCodeDetected(qrCode);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

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
              autoPlay
              style={{ background: '#000' }}
            />
            
            {cameraError && (
              <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="mb-4">{cameraError}</div>
                  <Button onClick={startCamera} variant="outline" className="text-white border-white">
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

          {/* Botões de teste para demonstração */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600 text-center">Para teste, clique em um dos QR codes abaixo:</div>
            <div className="flex flex-col gap-2">
              {testQRCodes.map((qrCode, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestQRCode(qrCode)}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  {qrCode}
                </Button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Posicione o QR Code na frente da câmera para escaneamento automático
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
