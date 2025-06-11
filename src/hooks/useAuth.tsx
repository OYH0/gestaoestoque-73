
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
    let retryTimeout: NodeJS.Timeout;
    let refreshing = false; // Prevent multiple simultaneous refresh attempts

    // Set up auth state listener with improved rate limit handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        // Handle rate limiting gracefully
        if (event === 'TOKEN_REFRESHED' && refreshing) {
          console.log('Token refresh already in progress, ignoring duplicate');
          return;
        }
        
        // Clear any existing retry timeout
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
        
        // Update state immediately for valid sessions
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
        
        setLoading(false);
        refreshing = false;
      }
    );

    // Get initial session with conservative retry logic
    const getInitialSession = async (retryCount = 0) => {
      if (!mounted || refreshing) return;
      
      refreshing = true;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          
          // Handle rate limiting with exponential backoff (max 3 retries)
          if ((error.message?.includes('rate limit') || error.message?.includes('429')) && retryCount < 3) {
            const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
            console.log(`Rate limited - retrying in ${delay}ms (attempt ${retryCount + 1})`);
            
            if (mounted) {
              retryTimeout = setTimeout(() => {
                getInitialSession(retryCount + 1);
              }, delay);
            }
            return;
          } else {
            // For other errors or max retries reached, stop trying
            console.log('Stopping session check due to persistent errors');
            if (mounted) {
              setLoading(false);
            }
          }
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        if (mounted && retryCount < 2) {
          // Only retry network errors twice
          const delay = 3000;
          retryTimeout = setTimeout(() => {
            getInitialSession(retryCount + 1);
          }, delay);
        } else {
          setLoading(false);
        }
      } finally {
        refreshing = false;
      }
    };

    // Initial session check with delay to prevent immediate rate limiting
    setTimeout(() => {
      getInitialSession();
    }, 100);

    return () => {
      mounted = false;
      refreshing = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
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
        
        // Handle rate limiting errors specifically
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
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      if (!error.message?.includes('rate limit')) {
        toast({
          title: "Erro no logout",
          description: error.message,
          variant: "destructive",
        });
      }
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
