
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DescartaveisFiltersProps {
  categorias: string[];
  categoriaFiltro: string;
  setCategoriaFiltro: (categoria: string) => void;
}

export function DescartaveisFilters({ 
  categorias, 
  categoriaFiltro, 
  setCategoriaFiltro 
}: DescartaveisFiltersProps) {
  return (
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
  );
}
