import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search para evitar re-renders excessivos
  const debouncedSetSearchQuery = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, isMobile ? 800 : 500); // Mais delay no mobile
  }, [setSearchQuery, isMobile]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    debouncedSetSearchQuery(value);
  }, [debouncedSetSearchQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Sync local state when external searchQuery changes
  useEffect(() => {
    if (searchQuery !== localSearchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="space-y-4 w-full px-1">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <Input
          placeholder="Buscar itens..."
          value={localSearchQuery}
          onChange={handleSearchChange}
          className="pl-10 w-full border-2 shadow-sm mobile-optimized"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      
      <Card className="w-full shadow-sm">
        <CardContent className="p-4">
          <div className={`flex flex-wrap gap-2 w-full ${isMobile ? 'justify-center' : 'justify-start'}`}>
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={categoriaFiltro === categoria ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaFiltro(categoria)}
                className={`text-xs whitespace-nowrap shadow-sm mobile-optimized ${
                  categoriaFiltro === categoria ? 'bg-blue-500 hover:bg-blue-600' : ''
                } ${isMobile ? 'min-w-[80px]' : ''}`}
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