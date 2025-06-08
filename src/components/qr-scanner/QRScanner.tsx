
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, X, Camera, Keyboard } from 'lucide-react';
import { useQRCodeScanner } from '@/hooks/useQRCodeScanner';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

export function QRScanner({ isOpen, onClose, onSuccess }: QRScannerProps) {
  const { isProcessing, processQRCode } = useQRCodeScanner();
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && !showManualInput) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, showManualInput]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setError('');
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Não foi possível acessar a câmera. Use a entrada manual.');
      setShowManualInput(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) return;

    const result = await processQRCode(manualInput.trim());
    
    if (result.success) {
      onSuccess?.(result);
      setManualInput('');
      onClose();
    }
  };

  const handleCameraToggle = () => {
    setShowManualInput(!showManualInput);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scanner QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={!showManualInput ? "default" : "outline"}
              onClick={handleCameraToggle}
              className="flex-1"
              disabled={isProcessing}
            >
              <Camera className="w-4 h-4 mr-2" />
              Câmera
            </Button>
            <Button
              variant={showManualInput ? "default" : "outline"}
              onClick={handleCameraToggle}
              className="flex-1"
              disabled={isProcessing}
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manual
            </Button>
          </div>

          {showManualInput ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-input">Código QR</Label>
                <Input
                  id="qr-input"
                  placeholder="Digite ou cole o código QR"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
              </div>
              <Button 
                onClick={handleManualSubmit}
                disabled={!manualInput.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processando...' : 'Processar QR Code'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error ? (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              ) : (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-white/50 rounded-lg m-8">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-600 text-center">
                Posicione o QR code dentro da área marcada
              </p>
            </div>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
