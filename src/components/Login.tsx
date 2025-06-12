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
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-churrasco-red/20 via-transparent to-churrasco-orange/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-churrasco-red/30 to-churrasco-orange/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-tr from-churrasco-brown/20 to-churrasco-red/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-bl from-churrasco-orange/25 to-churrasco-cream/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-grid-pattern"></div>
        </div>
      </div>
      
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative z-10 p-12">
        <div className="max-w-md text-center space-y-8">
          {/* Logo */}
          <div className="space-y-6">
            <div className="mx-auto w-48 h-48 flex items-center justify-center">
              <img 
                src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
                alt="Companhia do Churrasco Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-xl text-slate-300 font-medium">
              Sistema de Gestão de Estoque
            </p>
            <p className="text-slate-400 leading-relaxed">
              Controle inteligente e eficiente do seu estoque, 
              desde a câmara fria até os descartáveis.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
          {/* Mobile logo (visible only on small screens) */}
          <div className="lg:hidden pt-8 pb-4">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">
                {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
              </h2>
              <p className="text-slate-600 mb-4">
                {isSignUp ? 'Preencha os dados para criar sua conta' : 'Faça login para acessar o sistema'}
              </p>
              <div className="mx-auto w-32 h-32 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
                  alt="Companhia do Churrasco Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          <CardHeader className="text-center space-y-2 pb-6 lg:block hidden">
            <h2 className="text-2xl font-bold text-slate-800">
              {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-slate-600">
              {isSignUp ? 'Preencha os dados para criar sua conta' : 'Faça login para acessar o sistema'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Nome Completo
                  </Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      className="h-12 pl-4 border-2 border-slate-200 hover:border-churrasco-red/50 focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-200 bg-white"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  E-mail
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 pl-4 border-2 border-slate-200 hover:border-churrasco-red/50 focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-200 bg-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
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
                    className="h-12 pl-4 pr-12 border-2 border-slate-200 hover:border-churrasco-red/50 focus:border-churrasco-red focus:ring-churrasco-red/20 transition-all duration-200 bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
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
                className="w-full h-12 bg-gradient-to-r from-churrasco-red to-churrasco-orange hover:from-churrasco-red/90 hover:to-churrasco-orange/90 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-0 group"
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
            </form>
            
            <div className="text-center pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
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
    </div>
  );
}
