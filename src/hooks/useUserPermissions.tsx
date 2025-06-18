
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: 'admin' | 'viewer' | 'gerente';
  unidade_responsavel: 'juazeiro_norte' | 'fortaleza';
}

export function useUserPermissions() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGerente, setIsGerente] = useState(false);
  const [canModify, setCanModify] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      setIsAdmin(false);
      setIsGerente(false);
      setCanModify(false);
      setLoading(false);
      return;
    }

    try {
      // Use array response instead of .single() to avoid 406 errors
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
        setIsAdmin(false);
        setIsGerente(false);
        setCanModify(false);
      } else if (data && data.length > 0) {
        // Take the first result if multiple exist
        const profile = data[0];
        setUserProfile(profile);
        setIsAdmin(profile.user_type === 'admin');
        setIsGerente(profile.user_type === 'gerente');
        setCanModify(profile.user_type === 'admin' || profile.user_type === 'gerente');
      } else {
        // No profile found - could be a new user
        console.warn('No user profile found for user:', user.id);
        setUserProfile(null);
        setIsAdmin(false);
        setIsGerente(false);
        setCanModify(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setIsAdmin(false);
      setIsGerente(false);
      setCanModify(false);
    } finally {
      setLoading(false);
    }
  };

  const canModifyUnidade = (itemUnidade: 'juazeiro_norte' | 'fortaleza') => {
    if (!userProfile) return false;
    
    // Administradores podem modificar qualquer unidade
    if (userProfile.user_type === 'admin') return true;
    
    // Gerentes só podem modificar sua própria unidade
    if (userProfile.user_type === 'gerente') {
      return userProfile.unidade_responsavel === itemUnidade;
    }
    
    // Viewers não podem modificar nada
    return false;
  };

  const canTransferItems = () => {
    // Apenas administradores podem transferir itens entre unidades
    return userProfile?.user_type === 'admin';
  };

  const getFilterForUserUnidade = () => {
    // Todos os usuários (admin, gerente, viewer) podem ver dados de todas as unidades
    return null;
  };

  useEffect(() => {
    // Debounce the fetch to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      fetchUserProfile();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id]); // Only depend on user.id to prevent excessive re-renders

  return {
    userProfile,
    isAdmin,
    isGerente,
    canModify,
    loading,
    refetchProfile: fetchUserProfile,
    canModifyUnidade,
    canTransferItems,
    getFilterForUserUnidade
  };
}
