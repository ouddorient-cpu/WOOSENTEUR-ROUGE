'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plug, Save, Loader2, CreditCard, ExternalLink, Settings, XCircle } from 'lucide-react';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { saveWooCommerceCredentials } from '@/lib/firebase-helpers';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { SubscriptionCancellation } from '@/components/dashboard/SubscriptionCancellation';

const wooCommerceSchema = z.object({
  storeUrl: z.string().url({ message: 'Veuillez entrer une URL valide pour votre boutique.' }),
  consumerKey: z.string().min(10, { message: 'La clé client (Consumer Key) semble trop courte.' }),
  consumerSecret: z.string().min(10, { message: 'La clé secrète (Consumer Secret) semble trop courte.' }),
});

type WooCommerceFormValues = z.infer<typeof wooCommerceSchema>;


export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isCancellationFlowOpen, setIsCancellationFlowOpen] = useState(false);

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
    
    saveWooCommerceCredentials(user.uid, data);
    
    toast({
        title: 'Sauvegarde en cours...',
        description: 'Vos identifiants WooCommerce sont en cours d\'enregistrement.',
    });

    setTimeout(() => {
        setIsSaving(false);
         toast({
            title: 'Connexion mise à jour !',
            description: 'Vos identifiants WooCommerce ont été enregistrés.',
        });
    }, 1500);
  };

  const isLoading = userLoading || profileLoading;

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSuperAdmin = userProfile?.role === 'superadmin';
  const customerPortalLink = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK;

  const handleManageBilling = () => {
    if (customerPortalLink && user?.email) {
      window.open(`${customerPortalLink}?prefilled_email=${user.email}`, '_blank');
    }
  };


  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white">Profil & Paramètres</h1>
          <p className="text-muted-foreground">Gérez les informations de votre compte et vos intégrations.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <Plug className="h-5 w-5"/>
                          Connexion WooCommerce
                      </CardTitle>
                      <CardDescription>
                          Connectez votre boutique pour publier automatiquement les fiches produits.
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
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <Button type="submit" disabled={isSaving}>
                              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                              {isSaving ? 'Enregistrement...' : 'Enregistrer les identifiants'}
                          </Button>
                      </form>
                      </Form>
                  </CardContent>
              </Card>
          </div>

          <div className="space-y-6">
               <Card>
                  <CardHeader>
                      <CardTitle>Votre compte</CardTitle>
                  </CardHeader>
                  <CardContent>
                       <div className="space-y-2">
                          <Label>Email</Label>
                          <Input disabled value={user.email || ''} />
                      </div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle>Votre abonnement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                              <p className="text-sm font-medium">Plan actuel</p>
                              <p className="text-sm text-muted-foreground capitalize">{userProfile?.subscriptionPlan ?? 'N/A'}</p>
                          </div>
                           <Badge variant={isSuperAdmin ? "destructive" : "secondary"}>
                              {isSuperAdmin ? 'Admin' : userProfile?.subscriptionPlan ?? 'Aucun'}
                          </Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                              <p className="text-sm font-medium">Crédits restants</p>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-lg">
                              <CreditCard className="h-5 w-5 text-primary" />
                              <span>{isSuperAdmin ? '∞' : userProfile?.creditBalance ?? 0}</span>
                          </div>
                      </div>
                       <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                              <p className="text-sm font-medium">Statut</p>
                          </div>
                           <Badge variant={userProfile?.subscriptionStatus === 'active' ? 'default' : 'outline'} className="capitalize">
                              {userProfile?.subscriptionStatus ?? 'Inactif'}
                          </Badge>
                      </div>
                  </CardContent>
                   {!isSuperAdmin && customerPortalLink && (
                      <CardFooter className="flex flex-col gap-2">
                          <Button className="w-full" onClick={handleManageBilling}>
                              <Settings className="mr-2 h-4 w-4" />
                              Gérer mon abonnement
                          </Button>
                          <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => setIsCancellationFlowOpen(true)}>
                              Résilier l'abonnement
                          </Button>
                      </CardFooter>
                  )}
              </Card>
          </div>
        </div>
      </div>
      {user && !isSuperAdmin && customerPortalLink && (
        <SubscriptionCancellation
          isOpen={isCancellationFlowOpen}
          onOpenChange={setIsCancellationFlowOpen}
          stripePortalUrl={`${customerPortalLink}?prefilled_email=${user.email}`}
        />
      )}
    </>
  );
}
