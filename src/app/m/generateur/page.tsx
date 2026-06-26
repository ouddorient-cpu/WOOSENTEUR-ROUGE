'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { CreditsBadge } from '@/components/mobile/CreditsBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

const CATEGORIES = ['Parfum', 'Soin', 'Cosmétique', "parfum d'intérieur", 'Sport', 'Habillement', 'Maison', 'Autres'] as const;
const PLATFORMS = [
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'autre', label: 'Autre' },
];

const generateSchema = z.object({
  productName: z.string().min(2, { message: 'Le nom du produit est trop court.' }),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Choisis une catégorie.' }) }),
  characteristics: z.string().min(5, { message: 'Décris au moins 2-3 caractéristiques.' }),
  vibe: z.string().optional(),
  platform: z.enum(['woocommerce', 'shopify', 'autre']).default('autre'),
});

type GenerateFormValues = z.infer<typeof generateSchema>;

export default function MobileGenerateurPage() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(userProfilePath);

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: { productName: '', characteristics: '', vibe: '', platform: 'autre' },
  });

  const onSubmit = async (values: GenerateFormValues) => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/mobile/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          productName: values.productName,
          category: values.category,
          productMode: 'mon-produit',
          productDescription: `${values.characteristics}${values.platform !== 'autre' ? ` (boutique ${values.platform})` : ''}`,
          vibe: values.vibe,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération.');
      }
      router.push(`/m/resultat/${data.id}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Génération impossible',
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <MobileHeader title="Créer une fiche" />
      <div className="space-y-5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Décris ton produit en quelques mots</p>
          <CreditsBadge profile={profile} loading={profileLoading} />
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#C2553B]" />
            <p className="font-medium">Génération en cours…</p>
            <p className="text-sm text-muted-foreground">10 à 20 secondes, on prépare ta fiche.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Eau de parfum Asad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisis une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="characteristics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2 à 5 caractéristiques</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={'Ex:\n- Notes boisées et épicées\n- Tenue longue durée\n- Flacon 100ml'}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vibe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ton souhaité (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: sensuel, dynamique, élégant…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plateforme cible</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisis ta plateforme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-[#C2553B] hover:bg-[#A23F29] text-white" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Générer ma fiche
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
