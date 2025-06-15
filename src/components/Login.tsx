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
    <div className="relative flex items-center justify-center min-h-[100svh] overflow-hidden">
      {/* Background image sem blur e overlay escuro forte */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/lovable-uploads/dec7bb0c-8b1d-4d76-bfb6-ecd835292847.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          // Removido o blur para acabar com a luz branca
        }}
      />
      {/* Overlay preto, mais sólido para sumir com o esbranquiçado */}
      <div className="absolute inset-0 bg-black/80 z-10" aria-hidden="true" />

      {/* Conteúdo */}
      <div className="relative z-20 flex w-full">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-6">
              <div className="mx-auto w-48 h-48 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
                  alt="Companhia do Churrasco Logo"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl text-churrasco-brown font-medium">
                Sistema de Gestão de Estoque
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Controle inteligente e eficiente do seu estoque, 
                desde a câmara fria até os descartáveis.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 py-8">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl rounded-3xl overflow-hidden border-0 bg-white/80">
              {/* Mobile logo (visible only on small screens) */}
              <div className="lg:hidden pt-8 pb-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-32 h-32 flex items-center justify-center mb-2">
                    <img 
                      src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
                      alt="Companhia do Churrasco Logo"
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground">
                      {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isSignUp ? 'Preencha os dados para criar sua conta' : 'Faça login para acessar o sistema'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Desktop header */}
              <CardHeader className="text-center space-y-3 pb-6 pt-8 px-8 lg:block hidden">
                <h2 className="text-2xl font-bold text-foreground">
                  {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
                </h2>
                <p className="text-muted-foreground">
                  {isSignUp ? 'Preencha os dados para criar sua conta' : 'Faça login para acessar o sistema'}
                </p>
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
      </div>
    </div>
  );
}

export default Login;
