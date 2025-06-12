
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: 'admin' | 'viewer';
  unidade_responsavel: 'juazeiro_norte' | 'fortaleza';
}

export function useUserPermissions() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      setIsAdmin(false);
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
      } else {
        setUserProfile(data);
        setIsAdmin(data.user_type === 'admin');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const canModifyUnidade = (itemUnidade: 'juazeiro_norte' | 'fortaleza') => {
    if (!userProfile) return false;
    
    // Administradores podem modificar qualquer unidade
    if (userProfile.user_type === 'admin') return true;
    
    // Outros usuários só podem modificar sua própria unidade
    return userProfile.unidade_responsavel === itemUnidade;
  };

  const getFilterForUserUnidade = () => {
    if (!userProfile) return null;
    
    // Administradores podem ver todas as unidades
    if (userProfile.user_type === 'admin') return null;
    
    // Outros usuários só veem sua própria unidade
    return userProfile.unidade_responsavel;
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  return {
    userProfile,
    isAdmin,
    loading,
    refetchProfile: fetchUserProfile,
    canModifyUnidade,
    getFilterForUserUnidade
  };
}
