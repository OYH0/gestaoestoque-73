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
import { useIsMobile } from '@/hooks/use-mobile';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'viewer' | 'gerente';
  unidade_responsavel: 'juazeiro_norte' | 'fortaleza';
  created_at: string;
}

export function UserManagement() {
  const { isAdmin, loading: permissionsLoading } = useUserPermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const fetchUsers = async () => {
    try {
      console.log('=== INÍCIO DA BUSCA DE USUÁRIOS ===');
      console.log('User autenticado:', await supabase.auth.getUser());
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('=== RESULTADO DA CONSULTA ===');
      console.log('Error:', error);
      console.log('Data raw:', data);
      console.log('Número de usuários retornados:', data?.length || 0);
      
      if (data) {
        data.forEach((user, index) => {
          console.log(`Usuário ${index + 1}:`, {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type,
            unidade_responsavel: user.unidade_responsavel
          });
        });
      }

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      console.log('Setando usuários no estado:', data?.length || 0, 'usuários');
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

  const updateUserType = async (userId: string, newType: 'admin' | 'viewer' | 'gerente') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, user_type: newType } : user
      ));

      const typeLabels = {
        admin: 'administrador',
        gerente: 'gerente',
        viewer: 'visualizador'
      };

      toast({
        title: "Permissão atualizada",
        description: `Usuário agora é ${typeLabels[newType]}`,
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

  const getUserTypeLabel = (userType: 'admin' | 'viewer' | 'gerente') => {
    switch (userType) {
      case 'admin':
        return 'Administrador';
      case 'gerente':
        return 'Gerente';
      case 'viewer':
        return 'Visualizador';
      default:
        return 'Visualizador';
    }
  };

  const getUserTypeBadgeVariant = (userType: 'admin' | 'viewer' | 'gerente') => {
    switch (userType) {
      case 'admin':
        return 'default';
      case 'gerente':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
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
      <div className="container mx-auto p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Usuários encontrados: {users.length}</p>
            <div className="space-y-1 text-xs md:text-sm">
              <p><strong>Admin:</strong> Pode ver e modificar dados de todas as unidades + transferir itens</p>
              <p><strong>Gerente:</strong> Pode ver dados de todas as unidades, mas só pode modificar itens da sua unidade</p>
              <p><strong>Visualizador:</strong> Só pode visualizar dados de todas as unidades</p>
            </div>
          </div>
          <Button onClick={fetchUsers} variant="outline" size={isMobile ? "sm" : "default"}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base md:text-lg truncate">{user.full_name || user.email}</CardTitle>
                    <CardDescription className="text-sm truncate">{user.email}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getUserTypeBadgeVariant(user.user_type)} className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {getUserTypeLabel(user.user_type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.unidade_responsavel === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Usuário</label>
                    <Select
                      value={user.user_type}
                      onValueChange={(value: 'admin' | 'viewer' | 'gerente') => updateUserType(user.id, value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
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
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                        <SelectItem value="fortaleza">Fortaleza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 text-xs text-muted-foreground border-t">
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
