import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DescartaveisFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
}

export function DescartaveisFilters({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  categories
}: DescartaveisFiltersProps) {
  const isMobile = useIsMobile();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search para evitar re-renders excessivos
  const debouncedSetSearchTerm = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, isMobile ? 800 : 500); // Mais delay no mobile
  }, [setSearchTerm, isMobile]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSetSearchTerm(value);
  }, [debouncedSetSearchTerm]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Sync local state when external searchTerm changes
  useEffect(() => {
    if (searchTerm !== localSearchTerm) {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]);

  return (
    <div className={`flex gap-4 w-full px-1 ${isMobile ? 'flex-col' : 'flex-row'}`}>
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar itens..."
          value={localSearchTerm}
          onChange={handleSearchChange}
          className={`pl-10 w-full border-2 shadow-sm mobile-optimized ${isMobile ? 'text-sm' : ''}`}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      
      <div className={`${isMobile ? 'w-full' : 'w-48'} flex-shrink-0`}>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className={`${isMobile ? 'text-sm' : ''} w-full border-2 shadow-sm mobile-optimized`}>
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border shadow-lg max-h-60 overflow-y-auto">
            {categories && categories.length > 0 ? categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            )) : (
              <SelectItem value="Todos">Todos</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}