import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BebidasFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  categories: string[];
}

export function BebidasFilters({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  categories
}: BebidasFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex gap-4 w-full overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}>
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar bebidas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 w-full ${isMobile ? 'text-sm' : ''}`}
        />
      </div>
      
      <div className={`${isMobile ? 'w-full' : 'w-48'} flex-shrink-0`}>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className={`${isMobile ? 'text-sm' : ''} w-full`}>
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border shadow-lg">
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}