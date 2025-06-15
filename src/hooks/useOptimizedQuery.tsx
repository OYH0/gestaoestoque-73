
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useRef } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enableLogs?: boolean;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enableLogs = false,
  ...options
}: OptimizedQueryOptions<T>) {
  const loggedRef = useRef(false);

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      
      // Log apenas uma vez por sessão para evitar spam
      if (enableLogs && !loggedRef.current) {
        console.log(`=== DADOS CARREGADOS [${queryKey.join('-')}] ===`);
        if (Array.isArray(data)) {
          console.log(`Total de itens: ${data.length}`);
        }
        loggedRef.current = true;
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente era cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });

  return result;
}
