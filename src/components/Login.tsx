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
    <div className="relative flex items-center justify-center min-h-[100svh] bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Original background image with overlay */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/lovable-uploads/dec7bb0c-8b1d-4d76-bfb6-ecd835292847.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px) brightness(0.3)",
          opacity: 0.6
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-slate-900/40 to-black/60 z-10" aria-hidden="true" />

      {/* Animated particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex w-full animate-fade-in">
        {/* Left side - Enhanced Branding */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12">
          <div className="max-w-md text-center space-y-8 animate-scale-in">
            <div className="space-y-6">
              <div className="mx-auto w-56 h-56 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-6 border border-white/20 shadow-2xl">
                  <img 
                    src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
                    alt="Companhia do Churrasco Logo"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Sistema de Gestão de Estoque
              </h1>
              <p className="text-gray-300 leading-relaxed text-lg">
                Controle inteligente e eficiente do seu estoque, 
                desde a câmara fria até os descartáveis.
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Sistema Online</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Seguro & Confiável</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Enhanced Login form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 py-8">
          <div className="w-full max-w-md">
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden animate-slide-in-right">
              {/* Mobile logo (enhanced) */}
              <div className="lg:hidden pt-8 pb-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 flex items-center justify-center mb-2 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-3 border border-white/20">
                      <img 
                        src="/lovable-uploads/802f7946-9f7b-4f8d-a604-5110eaf96fd9.png" 
                        alt="Companhia do Churrasco Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">
                      {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
                    </h2>
                    <p className="text-sm text-gray-300">
                      {isSignUp ? 'Preencha os dados para criar sua conta' : 'Faça login para acessar o sistema'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Desktop header (enhanced) */}
              <CardHeader className="text-center space-y-4 pb-6 pt-8 px-8 lg:block hidden">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
                </h2>
                <p className="text-gray-300 text-lg">
                  {isSignUp ? 'Preencha os dados para criar sua conta' : 'Faça login para acessar o sistema'}
                </p>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {isSignUp && (
                    <div className="space-y-2 group">
                      <Label htmlFor="fullName" className="text-sm font-semibold flex items-center gap-2 text-gray-200 group-focus-within:text-white transition-colors">
                        <User className="w-4 h-4 text-blue-400" />
                        Nome Completo
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                        className="h-12 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-blue-400 transition-all duration-300 rounded-xl backdrop-blur-sm"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-gray-200 group-focus-within:text-white transition-colors">
                      <Mail className="w-4 h-4 text-blue-400" />
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-blue-400 transition-all duration-300 rounded-xl backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="space-y-2 group">
                    <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2 text-gray-200 group-focus-within:text-white transition-colors">
                      <Lock className="w-4 h-4 text-blue-400" />
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
                        className="h-12 px-4 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-blue-400 transition-all duration-300 rounded-xl backdrop-blur-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
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
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 border-0 group rounded-xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                      {loading ? (
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {isSignUp ? 'Criando conta...' : 'Entrando...'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 relative z-10">
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
                
                <div className="text-center pt-8 mt-6 border-t border-white/20">
                  <div className="text-sm text-gray-300">
                    {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                    <Button 
                      variant="link" 
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto font-semibold hover:underline transition-colors text-sm"
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
