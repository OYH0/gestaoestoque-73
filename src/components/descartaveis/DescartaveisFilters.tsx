
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DescartaveisFiltersProps {
  categorias: string[];
  categoriaFiltro: string;
  setCategoriaFiltro: (categoria: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export function DescartaveisFilters({ 
  categorias, 
  categoriaFiltro, 
  setCategoriaFiltro,
  searchQuery = '',
  setSearchQuery
}: DescartaveisFiltersProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {setSearchQuery && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar itens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
      
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap gap-1 md:gap-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={categoriaFiltro === categoria ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaFiltro(categoria)}
                className={`text-xs md:text-sm ${categoriaFiltro === categoria ? "bg-purple-500 hover:bg-purple-600" : ""}`}
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
