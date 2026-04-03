'use client';

import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import Logo from '@/components/logo';
import Footer from '@/components/footer';

const forgotSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse e-mail valide.' }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsSubmitting(true);
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      toast({
        title: 'Email envoyé',
        description: 'Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.',
      });
    } catch (error: any) {
      const message =
        error.code === 'auth/user-not-found'
          ? 'Aucun compte associé à cet email.'
          : 'Une erreur est survenue. Réessayez.';
      toast({ variant: 'destructive', title: 'Erreur', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/50">
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="mx-auto max-w-sm w-full shadow-2xl">
          <CardHeader className="items-center text-center">
            <Link href="/">
              <Logo className="h-16 w-16" />
            </Link>
            <CardTitle className="text-2xl font-headline">Mot de passe oublié</CardTitle>
            <CardDescription>
              {emailSent
                ? 'Un lien de réinitialisation a été envoyé.'
                : 'Entrez votre email pour recevoir un lien de réinitialisation.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Vérifiez votre boîte mail (et vos spams).
                  Le lien expire dans 1 heure.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setEmailSent(false)}>
                  Renvoyer l'email
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="exemple@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Envoyer le lien
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Link
              href="/login"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
