
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode implementar a lógica de autenticação
    console.log('Login attempt:', { email, password });
    // Por enquanto, apenas redireciona para o dashboard
    navigate('/');
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      {/* Background wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Logo Principal */}
      <div className="relative z-10 mb-12 flex flex-col items-center">
        <div className="bg-gradient-to-r from-churrasco-red to-churrasco-orange backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
          <img 
            src="/lovable-uploads/eb8e406f-5f0e-4eaa-93cd-77f66e6ffe4d.png" 
            alt="Logo da Empresa" 
            className="w-48 h-auto max-w-full"
          />
        </div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/40 bg-card/90 backdrop-blur-md">
        <CardHeader className="text-center space-y-4 pb-8">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Faça seu login
          </CardTitle>
          <p className="text-muted-foreground">
            Acesse o sistema de gestão de estoque
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:border-churrasco-red/50 focus:ring-churrasco-red/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
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
                  className="pr-10 transition-all duration-200 focus:border-churrasco-red/50 focus:ring-churrasco-red/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
              className="w-full bg-gradient-to-r from-churrasco-red to-churrasco-orange hover:from-churrasco-red/90 hover:to-churrasco-orange/90 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Entrar
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              className="text-churrasco-red hover:text-churrasco-red/80 text-sm"
              onClick={() => console.log('Forgot password clicked')}
            >
              Esqueceu sua senha?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
