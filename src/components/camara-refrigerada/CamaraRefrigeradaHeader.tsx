
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { History } from 'lucide-react';
import { CamaraRefrigeradaItem } from '@/hooks/useCamaraRefrigeradaData';
import { CamaraRefrigeradaHistoricoItem } from '@/hooks/useCamaraRefrigeradaHistorico';
import { CamaraRefrigeradaHistoryDialog } from './CamaraRefrigeradaHistoryDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface CamaraRefrigeradaHeaderProps {
  items: CamaraRefrigeradaItem[];
  historico: CamaraRefrigeradaHistoricoItem[];
  historicoLoading: boolean;
  historicoOpen: boolean;
  setHistoricoOpen: (open: boolean) => void;
}

export function CamaraRefrigeradaHeader({ 
  items, 
  historico, 
  historicoLoading, 
  historicoOpen, 
  setHistoricoOpen 
}: CamaraRefrigeradaHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Dialog open={historicoOpen} onOpenChange={setHistoricoOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="border-gray-300"
            >
              <History className="w-4 h-4 mr-1 md:mr-2" />
              <span className={isMobile ? "text-xs" : "text-sm"}>Histórico</span>
            </Button>
          </DialogTrigger>
          <CamaraRefrigeradaHistoryDialog 
            historico={historico} 
            loading={historicoLoading}
          />
        </Dialog>
      </div>

      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
          {items.length} itens descongelando
        </Badge>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
          {items.filter(item => item.status === 'descongelando').length} em processo
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {items.filter(item => item.status === 'pronto').length} prontos
        </Badge>
      </div>
    </div>
  );
}
