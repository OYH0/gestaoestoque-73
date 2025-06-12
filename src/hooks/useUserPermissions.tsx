
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
        setIsAdmin(false);
        setIsGerente(false);
        setCanModify(false);
      } else {
        setUserProfile(data);
        setIsAdmin(data.user_type === 'admin');
        setIsGerente(data.user_type === 'gerente');
        setCanModify(data.user_type === 'admin' || data.user_type === 'gerente');
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
    fetchUserProfile();
  }, [user]);

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
