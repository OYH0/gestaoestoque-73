
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/components/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-churrasco-cream via-background to-churrasco-cream/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-churrasco-red mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, showing login');
    return <Login />;
  }

  console.log('User authenticated, showing protected content');
  return <>{children}</>;
}
