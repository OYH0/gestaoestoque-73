
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EstoqueSecoFiltersProps {
  categorias: string[];
  categoriaFiltro: string;
  setCategoriaFiltro: (categoria: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function EstoqueSecoFilters({
  categorias,
  categoriaFiltro,
  setCategoriaFiltro,
  searchQuery,
  setSearchQuery
}: EstoqueSecoFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 w-full overflow-hidden">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar itens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      <Card className="w-full">
        <CardContent className="p-4">
          <div className={`flex flex-wrap gap-2 w-full overflow-x-auto ${isMobile ? 'justify-center' : 'justify-start'}`}>
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={categoriaFiltro === categoria ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaFiltro(categoria)}
                className={`text-xs whitespace-nowrap ${categoriaFiltro === categoria ? 'bg-amber-500 hover:bg-amber-600' : ''} ${isMobile ? 'min-w-[80px]' : ''}`}
              >
                {categoria}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
