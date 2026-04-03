
'use client';

import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function WelcomeBanner() {
    const searchParams = useSearchParams();
    const isNewUser = searchParams.get('new_user') === 'true';

    if (!isNewUser) {
        return null;
    }

    return (
        <Alert className="max-w-2xl mx-auto mb-12 text-left bg-primary/10 border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="font-bold">Bienvenue sur Woosenteur v2 !</AlertTitle>
            <AlertDescription>
                Pour commencer, choisissez un plan ci-dessous. Sélectionnez le plan "Gratuit" pour obtenir vos 5 crédits offerts et accéder au générateur.
            </AlertDescription>
        </Alert>
    );
}
