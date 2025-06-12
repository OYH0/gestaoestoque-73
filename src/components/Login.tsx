
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Beef } from 'lucide-react';
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
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-churrasco-wallpaper">
      {/* Enhanced wallpaper background */}
      <div className="absolute inset-0 bg-churrasco-wallpaper-overlay" />
      <div className="absolute inset-0 bg-churrasco-pattern opacity-30" />
      
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Floating elements with churrasco theme */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-churrasco-red/30 to-churrasco-orange/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-tr from-churrasco-brown/20 to-churrasco-red/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 right-1/4 w-48 h-48 bg-gradient-to-bl from-churrasco-orange/25 to-churrasco-cream/30 rounded-full blur-2xl"></div>
        
        {/* Subtle meat/grill pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 transform rotate-12">
            <Beef className="w-16 h-16 text-churrasco-brown" />
          </div>
          <div className="absolute top-1/3 right-20 transform -rotate-45">
            <Beef className="w-12 h-12 text-churrasco-red" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 transform rotate-45">
            <Beef className="w-14 h-14 text-churrasco-orange" />
          </div>
          <div className="absolute top-2/3 right-1/3 transform rotate-90">
            <Beef className="w-10 h-10 text-churrasco-brown" />
          </div>
          <div className="absolute bottom-1/3 right-1/6 transform -rotate-12">
            <Beef className="w-12 h-12 text-churrasco-red" />
          </div>
        </div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-churrasco-red/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-churrasco-orange/25 rounded-full animate-ping" style={{ animationDelay: '4s', animationDuration: '4s' }}></div>
        <div className="absolute top-2/3 left-1/6 w-2 h-2 bg-churrasco-brown/30 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-card/95 backdrop-blur-xl overflow-hidden">
        {/* Enhanced header with better branding */}
        <CardHeader className="text-center space-y-6 pb-8 bg-gradient-to-b from-churrasco-brown/5 to-transparent">
          <div className="space-y-6">
            {/* Logo area with enhanced styling */}
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-churrasco-gradient rounded-full flex items-center justify-center shadow-lg">
                <Beef className="w-8 h-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-churrasco-brown tracking-wider">
                  COMPANHIA
                </h1>
                <div className="flex items-center justify-center space-x-3">
                  <div className="h-px bg-gradient-to-r from-transparent via-churrasco-red to-transparent flex-1 max-w-16"></div>
                  <span className="text-xl font-bold text-churrasco-red px-3 bg-gradient-to-r from-churrasco-red/10 to-churrasco-orange/10 rounded-full py-1">
                    DO
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-churrasco-red to-transparent flex-1 max-w-16"></div>
                </div>
                <h1 className="text-3xl font-bold text-churrasco-brown tracking-wider">
                  CHURRASCO
                </h1>
              </div>
            </div>
            
            <CardTitle className="text-xl font-medium text-foreground">
              {isSignUp ? 'Crie sua conta' : 'Acesse sua conta'}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-churrasco-red" />
                  Nome Completo
                </Label>
                <div className="relative group">
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isSignUp}
                    className="h-12 pl-4 border-2 border-border hover:border-churrasco-red/50 focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-300 bg-background/50"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-churrasco-red" />
                E-mail
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-4 border-2 border-border hover:border-churrasco-red/50 focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-300 bg-background/50"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-churrasco-red" />
                Senha
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-4 pr-12 border-2 border-border hover:border-churrasco-red/50 focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-300 bg-background/50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-churrasco-red/10 text-muted-foreground hover:text-churrasco-red transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-churrasco-gradient hover:opacity-90 hover:scale-[1.02] text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-0"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isSignUp ? 'Criando conta...' : 'Entrando...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSignUp ? (
                    <>
                      <User className="w-4 h-4" />
                      Criar Conta
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Entrar
                    </>
                  )}
                </div>
              )}
            </Button>
          </form>
          
          <div className="text-center pt-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
              <Button 
                variant="link" 
                className="text-churrasco-red hover:text-churrasco-red/80 p-0 h-auto font-semibold hover:underline transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Fazer login' : 'Criar conta'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
