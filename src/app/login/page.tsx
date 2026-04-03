'use client';
import { useState, useCallback, Suspense } from 'react';
import {
  getAuth,
  User,
} from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';
import Footer from '@/components/footer';
import { Loader2 } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLoginSuccess = useCallback((user: User) => {
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    
    toast({
        title: 'Connexion réussie !',
        description: `Bienvenue, ${user.displayName || user.email} !`,
    });

    router.push(redirectUrl);
  }, [router, searchParams, toast]);

  const handleLoginFailure = useCallback((error: any) => {
    console.error("Login failed:", error);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-muted/50 relative">
        {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )}
        <main className="flex-grow flex items-center justify-center p-4">
            <Card className="mx-auto max-w-sm w-full shadow-2xl">
                <CardHeader className='items-center text-center'>
                    <Link href="/">
                      <Logo className="h-16 w-16" />
                    </Link>
                    <CardTitle className="text-3xl font-headline">Se connecter</CardTitle>
                    <CardDescription>
                        Accédez à votre tableau de bord.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <LoginForm
                        onSuccess={handleLoginSuccess}
                        onFailure={handleLoginFailure}
                        onLoading={setIsLoading}
                    />
                </CardContent>
                <CardFooter className="flex-col gap-4 justify-center text-center text-sm">
                   <p className="text-muted-foreground">
                     Vous n'avez pas de compte ?{' '}
                     <Link href="/signup" className="underline font-semibold text-primary">S'inscrire</Link>
                   </p>
                   <p className="text-muted-foreground text-xs">
                     En vous connectant, vous acceptez nos <Link href="/legal/terms" className="underline hover:text-primary">Conditions d'utilisation</Link> et notre <Link href="/legal/privacy" className="underline hover:text-primary">Politique de confidentialité</Link>.
                   </p>
                </CardFooter>
            </Card>
        </main>
        <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <LoginPageContent />
      </Suspense>
  )
}
