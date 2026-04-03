'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { HeartCrack, Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Step = 'survey' | 'offer';

const surveyOptions = [
    {
        category: "Attentes de l'IA",
        options: [
            "Je voulais plus de contrôle que ce que l'IA permet",
            "Les visuels / légendes n'étaient pas impressionnants",
            "Sortie IA plus avancée attendue",
        ]
    },
    {
        category: "Limitations des fonctionnalités",
        options: [
            "La publication automatique n'a pas répondu à mes besoins",
            "Manquait les intégrations de plateforme (ex: Shopify)",
            "Options de personnalisation limitées",
            "Caractéristiques se sentaient basiques ou incomplètes",
        ]
    },
    {
        category: "Ma situation a changé",
        options: [
            "Je faisais juste d'explorer / tester",
            "Je ne gère plus les médias sociaux",
            "Je ne gère plus de marque",
            "J'ai accidentellement créé plusieurs comptes",
        ]
    }
];


export function SubscriptionCancellation({
  isOpen,
  onOpenChange,
  stripePortalUrl,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stripePortalUrl: string;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('survey');

  const handleClose = () => {
    onOpenChange(false);
    // Reset to first step after a delay to allow for closing animation
    setTimeout(() => setStep('survey'), 300);
  };
  
  const handleConfirmSurvey = () => {
    setStep('offer');
  };

  const handleAcceptOffer = () => {
    toast({
        variant: "success",
        title: "Offre appliquée !",
        description: "Votre réduction de 25% a bien été prise en compte pour la prochaine année. Merci de votre confiance !"
    });
    handleClose();
  };

  const handleContinueToCancel = () => {
    window.open(stripePortalUrl, '_blank');
    handleClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl">
        {step === 'survey' && (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <HeartCrack className="h-6 w-6 text-destructive" />
                <AlertDialogTitle className="text-2xl">Triste de vous voir partir...</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Pour nous aider à nous améliorer, pourriez-vous nous dire pourquoi vous partez ? Sélectionnez les raisons qui s'appliquent.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                {surveyOptions.map(category => (
                    <div key={category.category}>
                        <h4 className="font-semibold mb-3">{category.category}</h4>
                        <div className="space-y-3">
                            {category.options.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox id={option} />
                                    <label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Rester abonné</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSurvey}>Confirmer et continuer</AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}

        {step === 'offer' && (
          <>
            <AlertDialogHeader>
                <div className="flex items-center gap-2">
                    <Tag className="h-6 w-6 text-primary" />
                    <AlertDialogTitle className="text-2xl">Une dernière offre avant de partir !</AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                    Nous apprécions sincèrement votre confiance. Pour vous remercier, nous souhaitons vous offrir une réduction exclusive.
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="my-6 p-8 bg-primary/10 rounded-lg text-center">
                <p className="text-lg">Bénéficiez de</p>
                <p className="text-6xl font-bold text-primary my-2">25% de réduction</p>
                <p className="text-lg">sur votre abonnement actuel pendant <span className="font-semibold">1 an</span>.</p>
            </div>

            <AlertDialogFooter className="sm:justify-between gap-2">
              <Button variant="ghost" onClick={handleContinueToCancel}>
                <X className="mr-2 h-4 w-4" />
                Non merci, poursuivre la résiliation
              </Button>
              <Button onClick={handleAcceptOffer}>Oui, je profite de l'offre !</Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
