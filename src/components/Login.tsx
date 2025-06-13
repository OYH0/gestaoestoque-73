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
    <div 
      className="min-h-screen flex relative overflow-hidden"
      style={{
        height: '100dvh',
        background: `
          linear-gradient(
            135deg,
            #f5f3f0 0%,
            rgba(245, 243, 240, 0.9) 25%,
            #faf8f5 50%,
            rgba(245, 243, 240, 0.8) 75%,
            rgba(245, 243, 240, 0.6) 100%
          )
        `,
      }}
    >
      {/* Custom wallpaper overlay */}
      <div 
        className="absolute inset-0 opacity-95"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              transparent 0%,
              rgba(245, 243, 240, 0.1) 35%,
              rgba(221, 95, 41, 0.05) 70%,
              rgba(101, 70, 41, 0.1) 100%
            )
          `,
        }}
      />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent 0px,
              transparent 4px,
              rgba(101, 70, 41, 0.03) 4px,
              rgba(101, 70, 41, 0.03) 8px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent 0px,
              transparent 4px,
              rgba(221, 95, 41, 0.02) 4px,
              rgba(221, 95, 41, 0.02) 8px
            ),
            radial-gradient(
              circle at 25% 25%,
              rgba(231, 139, 69, 0.05) 1px,
              transparent 1px
            ),
            radial-gradient(
              circle at 75% 75%,
              rgba(101, 70, 41, 0.03) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '40px 40px, 40px 40px, 60px 60px, 80px 80px',
          backgroundPosition: '0 0, 0 0, 30px 30px, 40px 40px',
        }}
      />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl animate-pulse"
          style={{
            background: 'linear-gradient(to bottom right, rgba(221, 95, 41, 0.1), rgba(231, 139, 69, 0.1))',
          }}
        ></div>
        <div 
          className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: 'linear-gradient(to top right, rgba(101, 70, 41, 0.08), rgba(221, 95, 41, 0.08))',
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="absolute -bottom-32 right-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{
            background: 'linear-gradient(to bottom left, rgba(231, 139, 69, 0.12), rgba(245, 243, 240, 0.15))',
            animationDelay: '4s'
          }}
        ></div>
        
        {/* Small animated dots */}
        <div 
          className="absolute top-20 left-1/4 w-4 h-4 rounded-full animate-ping"
          style={{ 
            backgroundColor: 'rgba(221, 95, 41, 0.2)',
            animationDelay: '2s', 
            animationDuration: '3s' 
          }}
        ></div>
        <div 
          className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full animate-ping"
          style={{ 
            backgroundColor: 'rgba(231, 139, 69, 0.25)',
            animationDelay: '4s', 
            animationDuration: '4s' 
          }}
        ></div>
        <div 
          className="absolute top-2/3 left-1/6 w-2 h-2 rounded-full animate-ping"
          style={{ 
            backgroundColor: 'rgba(101, 70, 41, 0.3)',
            animationDelay: '1s', 
            animationDuration: '5s' 
          }}
        ></div>
      </div>
      
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative z-10 p-12">
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
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl rounded-3xl overflow-hidden border-0">
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
  );
}
