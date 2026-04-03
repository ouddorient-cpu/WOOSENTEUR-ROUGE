
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plug, Save, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { saveWooCommerceCredentials } from '@/lib/firebase-helpers';
import Link from 'next/link';

const wooCommerceSchema = z.object({
  storeUrl: z.string().url({ message: 'Veuillez entrer une URL valide pour votre boutique.' }),
  consumerKey: z.string().min(10, { message: 'La clé client (Consumer Key) semble trop courte.' }),
  consumerSecret: z.string().min(10, { message: 'La clé secrète (Consumer Secret) semble trop courte.' }),
});

type WooCommerceFormValues = z.infer<typeof wooCommerceSchema>;

const WelcomeMessage = () => {
    return (
      <div className="text-center mb-12">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-fade-in-up" />
        <h1 className="font-headline text-4xl font-bold text-white animate-fade-in-up" style={{ animationDelay: '200ms'}}>Bienvenue à bord !</h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms'}}>
          Votre compte est prêt. Pour finaliser la configuration, veuillez connecter votre boutique WooCommerce ci-dessous.
        </p>
      </div>
    );
};


export default function OnboardingPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const form = useForm<WooCommerceFormValues>({
    resolver: zodResolver(wooCommerceSchema),
    defaultValues: {
      storeUrl: '',
      consumerKey: '',
      consumerSecret: '',
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (userProfile?.wooCommerce) {
      form.reset(userProfile.wooCommerce);
    }
  }, [userProfile, form]);
  
  const onSubmit = async (data: WooCommerceFormValues) => {
    if (!user) return;
    setIsSaving(true);
    
    try {
        await saveWooCommerceCredentials(user.uid, data);
        toast({
            title: 'Boutique connectée !',
            description: 'Vos identifiants WooCommerce ont été enregistrés avec succès.',
        });
        // Redirect to the main dashboard after successful connection
        router.push('/dashboard');
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible d\'enregistrer les identifiants. Veuillez réessayer.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const isLoading = userLoading || profileLoading;

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#3A0F6C] via-[#6C2BB8] to-[#3A0F6C]">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 pt-24 md:gap-8 md:p-8">
        <div className="max-w-2xl w-full">
            <Suspense fallback={null}>
                <WelcomeMessage />
            </Suspense>
            <Card className="animate-fade-in-up" style={{ animationDelay: '600ms'}}>
                <CardHeader className="items-center text-center">
                    <Plug className="h-12 w-12 text-primary mb-4" />
                    <CardTitle className="font-headline text-3xl">Connectez votre boutique</CardTitle>
                    <CardDescription>
                        C'est la dernière étape ! Connectez votre boutique pour permettre la publication automatique des fiches produits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="storeUrl"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL de la boutique</FormLabel>
                                <FormControl>
                                <Input placeholder="https://maboutique.com" {...field} />
                                </FormControl>
                                <FormDescription>L'adresse complète de votre site WooCommerce.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="consumerKey"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Clé Client (CK)</FormLabel>
                                <FormControl>
                                <Input placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx" {...field} type="password" />
                                </FormControl>
                                <FormDescription>Votre Consumer Key générée depuis WooCommerce.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="consumerSecret"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Clé Secrète (CS)</FormLabel>
                                <FormControl>
                                <Input placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx" {...field} type="password" />
                                </FormControl>
                                <FormDescription>Votre Consumer Secret générée depuis WooCommerce.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="flex flex-col gap-2">
                            <Button type="submit" disabled={isSaving} className="w-full" size="lg">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isSaving ? 'Connexion...' : 'Connecter et continuer'}
                            </Button>
                            <Button variant="ghost" asChild className="w-full">
                                <Link href="/dashboard">Configurer plus tard</Link>
                            </Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
