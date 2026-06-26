'use client';

import { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';
import { Loader2 } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export default function MobileLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = useCallback((user: User) => {
    toast({ title: 'Connexion réussie !', description: `Bienvenue, ${user.displayName || user.email} !` });
    router.replace('/m/accueil');
  }, [router, toast]);

  const handleLoginFailure = useCallback((error: any) => {
    console.error('Login failed:', error);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <Loader2 className="h-10 w-10 animate-spin text-[#C2553B]" />
        </div>
      )}
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <Logo className="h-14 w-14" />
          <CardTitle className="font-headline text-2xl">Se connecter</CardTitle>
          <CardDescription>Accède à tes fiches produits où tu veux.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm
            onSuccess={handleLoginSuccess}
            onFailure={handleLoginFailure}
            onLoading={setIsLoading}
            hideGoogle
          />
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="font-semibold text-[#C2553B] underline">S'inscrire</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
