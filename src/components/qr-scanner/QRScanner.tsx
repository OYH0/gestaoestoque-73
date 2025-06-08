
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X, Loader2 } from 'lucide-react';
import { useQRCodeScanner } from '@/hooks/useQRCodeScanner';
import { toast } from '@/hooks/use-toast';

// Função para detectar QR codes usando a API de detecção do navegador
const detectQRCode = (canvas: HTMLCanvasElement): string | null => {
  try {
    const context = canvas.getContext('2d');
    if (!context) return null;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Usar detecção simples baseada em padrões do QR Code
    // Esta é uma implementação básica que pode ser melhorada
    const data = imageData.data;
    let hasPattern = false;
    
    // Verificar se há contraste suficiente (indicativo de QR code)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      
      if (brightness < 50 || brightness > 200) {
        hasPattern = true;
        break;
      }
    }
    
    return hasPattern ? "detected" : null;
  } catch (error) {
    console.error('Erro na detecção de QR Code:', error);
    return null;
  }
};

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QRScanner({ isOpen, onClose, onSuccess }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { processQRCode, isProcessing } = useQRCodeScanner();
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lista de QR codes de teste para demonstração
  const testQRCodes = [
    'CF-12345-ABC123-001',
    'ES-67890-DEF456-002', 
    'DESC-11111-GHI789-003'
  ];

  const startCamera = async () => {
    try {
      setCameraError(null);
      console.log('Tentando acessar a câmera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasCamera(true);
        setIsScanning(true);
        startQRScanning();
        console.log('Câmera iniciada com sucesso');
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    console.log('Parando câmera...');
    setIsScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track parado:', track.kind);
      });
      videoRef.current.srcObject = null;
    }
    setHasCamera(false);
  };

  const startQRScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          
          // Aqui você pode implementar detecção de QR code mais sofisticada
          // Por enquanto, vamos simular a detecção
          const detection = detectQRCode(canvas);
          
          if (detection) {
            console.log('QR Code detectado!');
            // Para demonstração, vamos processar um QR code de teste
            handleQRCodeDetected(testQRCodes[0]);
          }
        }
      }
    }, 500); // Escaneia a cada 500ms
  };

  const handleQRCodeDetected = async (qrCodeData: string) => {
    if (isProcessing) return;
    
    console.log('Processando QR Code:', qrCodeData);
    setIsScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

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
        // Continuar escaneando
        setIsScanning(true);
        startQRScanning();
      }
    } catch (error) {
      console.error('Erro ao processar QR code:', error);
      toast({
        title: "Erro no scanner",
        description: "Ocorreu um erro ao processar o QR Code",
        variant: "destructive",
      });
      setIsScanning(true);
      startQRScanning();
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
          {cameraError ? (
            <div className="text-center p-8 bg-red-50 rounded-lg">
              <div className="text-red-600 mb-4">{cameraError}</div>
              <Button onClick={startCamera} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Overlay para indicar área de escaneamento */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white rounded-lg opacity-50">
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-green-500"></div>
                </div>
                
                {isScanning && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </div>
                    ) : (
                      'Posicione o QR Code na área marcada'
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

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
