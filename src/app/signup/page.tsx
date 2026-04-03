'use client';
import { useState, useCallback, Suspense } from 'react';
import { User } from 'firebase/auth';
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
import SignupForm from '@/components/auth/SignupForm';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignupSuccess = useCallback((user: User) => {
    // Redirect to a specific onboarding page or dashboard
    const redirectUrl = searchParams.get('redirect') || '/dashboard/onboarding';
    
    toast({
        title: 'Inscription réussie !',
        description: `Bienvenue, ${user.displayName || user.email} ! Configurez votre compte.`,
    });

    router.push(redirectUrl);
  }, [router, searchParams, toast]);

  const handleSignupFailure = useCallback((error: any) => {
    console.error("Signup failed:", error);
    // Error toast is handled inside the form components
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
                    <CardTitle className="text-3xl font-headline">Créer un compte</CardTitle>
                    <CardDescription>
                        Commencez votre essai gratuit et générez vos premières fiches produits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignupForm 
                        onSuccess={handleSignupSuccess}
                        onFailure={handleSignupFailure}
                        onLoading={setIsLoading}
                    />
                </CardContent>
                 <CardFooter className="flex-col gap-2 text-center text-sm text-muted-foreground">
                    <div className="mt-4">
                        Vous avez déjà un compte ?{' '}
                        <Link href="/login" className="underline font-semibold text-primary">
                            Se connecter
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </main>
        <Footer />
    </div>
  );
}

export default function SignupPage() {
  return (
       <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SignupPageContent />
       </Suspense>
  )
}
