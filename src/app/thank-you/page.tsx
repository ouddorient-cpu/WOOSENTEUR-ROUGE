
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ThankYouContent() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (userLoading) return;
        
        if (!user) {
            toast({
                title: 'Veuillez vous connecter',
                description: 'Vous devez être connecté pour réclamer vos crédits.',
                variant: 'destructive',
            });
            router.push('/login');
            return;
        }

        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
            setErrorMessage("ID de session de paiement manquant. Vos crédits n'ont pas pu être ajoutés automatiquement. Veuillez contacter le support si le problème persiste.");
            setStatus('error');
            return;
        }

        const claimCredits = async () => {
            try {
                const idToken = await user.getIdToken(true);
                const response = await fetch('/api/claim-credits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ session_id: sessionId }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Une erreur est survenue lors de l\'attribution des crédits.');
                }
                
                setStatus('success');
                toast({
                    variant: 'success',
                    title: 'Paiement confirmé !',
                    description: data.message,
                });

            } catch (error: any) {
                console.error("Failed to claim credits:", error);
                setErrorMessage(error.message || "Une erreur inconnue est survenue lors de la vérification de votre paiement.");
                setStatus('error');
                 toast({
                    variant: 'destructive',
                    title: 'Erreur de vérification',
                    description: error.message,
                });
            }
        };

        claimCredits();

    }, [user, userLoading, searchParams, router, toast]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                        <CardTitle className="text-2xl">Vérification de votre paiement...</CardTitle>
                        <CardDescription>
                            Veuillez patienter pendant que nous ajoutons les crédits à votre compte.
                        </CardDescription>
                    </>
                );
            case 'success':
                return (
                    <>
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="text-2xl">Merci pour votre achat !</CardTitle>
                        <CardDescription>
                            Vos crédits ont été ajoutés. Vous pouvez maintenant commencer à créer des fiches produits incroyables.
                        </CardDescription>
                        <Button asChild className="mt-6" size="lg">
                           <Link href="/dashboard/generate">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Commencer à générer
                           </Link>
                        </Button>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
                        <CardTitle className="text-2xl">Une erreur est survenue</CardTitle>
                         <Alert variant="destructive" className="text-left">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erreur de réclamation</AlertTitle>
                            <AlertDescription>
                               {errorMessage}
                            </AlertDescription>
                        </Alert>
                         <div className="flex gap-4 mt-6">
                            <Button asChild variant="outline">
                               <Link href="/pricing">Retour aux tarifs</Link>
                            </Button>
                             <Button asChild>
                               <Link href="/dashboard">Aller au Tableau de Bord</Link>
                            </Button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
             <Card className="w-full max-w-lg">
                <CardHeader className="items-center text-center">
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center space-y-4">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}


export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ThankYouContent />
        </Suspense>
    );
}
