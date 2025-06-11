
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (!error) {
          setEmail('');
          setPassword('');
          setFullName('');
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          // Login successful, user will be redirected automatically by the auth state change
          console.log('Login successful');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-churrasco-cream via-background to-churrasco-cream/50 p-4">
      {/* Background decorative elements with churrasco theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-churrasco-red/20 to-churrasco-orange/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-churrasco-brown/20 to-churrasco-red/20 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-border bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-churrasco-brown tracking-wider">
                COMPANHIA
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px bg-churrasco-red flex-1 max-w-12"></div>
                <span className="text-lg font-semibold text-churrasco-red px-2">DO</span>
                <div className="h-px bg-churrasco-red flex-1 max-w-12"></div>
              </div>
              <h1 className="text-2xl font-bold text-churrasco-brown tracking-wider">
                CHURRASCO
              </h1>
            </div>
            <CardTitle className="text-xl font-medium text-foreground">
              {isSignUp ? 'Crie sua conta' : 'Faça login para acessar sua conta'}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    className="pl-10 h-12 border-border focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 border-border focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-12 h-12 border-border focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-accent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-12 bg-churrasco-gradient hover:opacity-90 text-primary-foreground font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isSignUp ? 'Criando conta...' : 'Entrando...'}
                </div>
              ) : (
                isSignUp ? 'Criar Conta' : 'Entrar'
              )}
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <Button 
              variant="link" 
              className="text-churrasco-red hover:text-churrasco-red/80 p-0 h-auto font-medium"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Fazer login' : 'Criar conta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
