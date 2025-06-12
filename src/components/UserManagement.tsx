
import React, { useState, useEffect } from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Shield, MapPin, RefreshCw } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'viewer';
  unidade_responsavel: 'juazeiro_norte' | 'fortaleza';
  created_at: string;
}

export function UserManagement() {
  const { isAdmin, loading: permissionsLoading } = useUserPermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      console.log('Buscando todos os usuários...');
      
      // Primeira tentativa: busca normal
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Primeira consulta - data:', data, 'error:', error);

      // Se não trouxe todos os usuários ou deu erro de RLS, tenta com RPC
      if (error || !data || data.length < 2) {
        console.log('Tentando busca alternativa...');
        
        // Busca usando uma função administrativa (contorna RLS)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_all_profiles');
          
        if (rpcError) {
          console.error('Erro na função RPC:', rpcError);
          // Se RPC falhar, usa a consulta original
          if (!error && data) {
            setUsers(data);
            return;
          }
        } else if (rpcData) {
          console.log('Dados via RPC:', rpcData);
          setUsers(rpcData);
          return;
        }
      }

      if (error) throw error;
      
      console.log('Usuários encontrados:', data?.length || 0, data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserType = async (userId: string, newType: 'admin' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, user_type: newType } : user
      ));

      toast({
        title: "Permissão atualizada",
        description: `Usuário agora é ${newType === 'admin' ? 'administrador' : 'visualizador'}`,
      });
    } catch (error) {
      console.error('Error updating user type:', error);
      toast({
        title: "Erro ao atualizar permissão",
        description: "Não foi possível atualizar a permissão do usuário.",
        variant: "destructive",
      });
    }
  };

  const updateUserUnidade = async (userId: string, newUnidade: 'juazeiro_norte' | 'fortaleza') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ unidade_responsavel: newUnidade })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, unidade_responsavel: newUnidade } : user
      ));

      toast({
        title: "Unidade atualizada",
        description: `Usuário agora gerencia ${newUnidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}`,
      });
    } catch (error) {
      console.error('Error updating user unidade:', error);
      toast({
        title: "Erro ao atualizar unidade",
        description: "Não foi possível atualizar a unidade do usuário.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!permissionsLoading) {
      if (isAdmin) {
        fetchUsers();
      } else {
        setLoading(false);
      }
    }
  }, [isAdmin, permissionsLoading]);

  if (permissionsLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure permissões e unidades responsáveis para cada usuário
            </p>
          </div>
          <Button onClick={fetchUsers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.full_name || user.email}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={user.user_type === 'admin' ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.user_type === 'admin' ? 'Administrador' : 'Visualizador'}
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.unidade_responsavel === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Usuário</label>
                    <Select
                      value={user.user_type}
                      onValueChange={(value: 'admin' | 'viewer') => updateUserType(user.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unidade Responsável</label>
                    <Select
                      value={user.unidade_responsavel}
                      onValueChange={(value: 'juazeiro_norte' | 'fortaleza') => updateUserUnidade(user.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                        <SelectItem value="fortaleza">Fortaleza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 text-xs text-muted-foreground">
                  Conta criada em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}
