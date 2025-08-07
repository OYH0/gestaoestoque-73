import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[100svh] bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      {/* Conteúdo centralizado */}
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          {/* Logo centralizado */}
          <div className="mx-auto w-40 h-40 mb-6 flex items-center justify-center">
            <img 
              src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
              alt="Companhia do Churrasco Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sistema de Gestão
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? 'Crie sua conta para começar' : 'Acesse sua conta'}
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isSignUp ? 'Criar conta' : 'Entrar'}
            </h2>
          </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-churrasco-orange" />
                        Nome Completo
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                        className="h-12 px-4 transition-all duration-200 rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-churrasco-orange" />
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 px-4 transition-all duration-200 rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-churrasco-orange" />
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 px-4 pr-12 transition-all duration-200 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
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
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-churrasco-red to-churrasco-orange hover:from-churrasco-red/90 hover:to-churrasco-orange/90 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-0 group rounded-lg"
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
                              Entrar
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
                
                <div className="text-center pt-6 mt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                    <Button 
                      variant="link" 
                      className="text-churrasco-orange hover:text-churrasco-orange/80 p-0 h-auto font-semibold hover:underline transition-colors text-sm"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Fazer login' : 'Criar conta'}
                    </Button>
                  </div>
                </div>
              </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
