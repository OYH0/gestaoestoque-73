
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // Simple auth state listener - only handle essential events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        // Only handle key events, ignore TOKEN_REFRESHED to avoid loops
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          toast({
            title: "Muitas tentativas de login",
            description: "Aguarde alguns segundos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
      }
      
      return { error };
    } catch (error: any) {
      console.error('Sign in failed:', error);
      toast({
        title: "Erro no login",
        description: "Falha na conexão. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || email,
          }
        }
      });
      
      if (error) {
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          toast({
            title: "Muitas tentativas de cadastro",
            description: "Aguarde alguns segundos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: "Falha na conexão. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Iniciando logout...');
      
      const { error } = await supabase.auth.signOut();
      
      // Ignorar erros de sessão não encontrada
      if (error) {
        console.error('Erro no logout:', error);
        if (
          error.message?.toLowerCase().includes('session not found') ||
          error.message?.toLowerCase().includes('auth session missing') ||
          error.message?.toLowerCase().includes('session_missing') // variação visto em libs antigas
        ) {
          // Não mostre toast, apenas prossiga com o logout local normalmente
          setSession(null);
          setUser(null);
          setLoading(false);
          // Opcional: toast amistoso de logout
          toast({
            title: "Logout realizado",
            description: "Até logo!",
          });
          return;
        } else {
          toast({
            title: "Erro no logout",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Limpar estado local imediatamente
      setSession(null);
      setUser(null);
      
      console.log('Logout realizado com sucesso');
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      console.error('Falha no logout:', error);
      if (
        error?.message?.toLowerCase().includes('session not found') ||
        error?.message?.toLowerCase().includes('auth session missing') ||
        error?.message?.toLowerCase().includes('session_missing')
      ) {
        setSession(null);
        setUser(null);
        setLoading(false);
        toast({
          title: "Logout realizado",
          description: "Até logo!",
        });
      } else {
        toast({
          title: "Erro no logout",
          description: error?.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
