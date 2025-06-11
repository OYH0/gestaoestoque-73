
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CamaraFriaFiltersProps {
  categorias: string[];
  categoriaFiltro: string;
  setCategoriaFiltro: (categoria: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function CamaraFriaFilters({
  categorias,
  categoriaFiltro,
  setCategoriaFiltro,
  searchQuery,
  setSearchQuery
}: CamaraFriaFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar itens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        {categorias.map((categoria) => (
          <Button
            key={categoria}
            variant={categoriaFiltro === categoria ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoriaFiltro(categoria)}
            className={`text-xs ${categoriaFiltro === categoria ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          >
            {categoria}
          </Button>
        ))}
      </div>
    </div>
  );
}
