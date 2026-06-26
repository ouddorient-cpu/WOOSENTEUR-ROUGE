'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, signInWithEmailAndPassword, User } from 'firebase/auth';
import Link from 'next/link';
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
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse e-mail valide.' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: (user: User) => void;
  onFailure: (error: any) => void;
  onLoading: (loading: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onFailure, onLoading }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    onLoading(true);
    
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      onSuccess(userCredential.user);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.code === 'auth/invalid-credential'
          ? "Email ou mot de passe incorrect. Si tu t'es inscrit avec Google, clique sur \"Mot de passe oublié ?\" pour définir un mot de passe et te connecter ainsi sur mobile et sur le web."
          : error.message,
      });
      onFailure(error);
    } finally {
      setIsSubmitting(false);
      onLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
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
           <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-muted-foreground underline hover:text-[#C2553B]">
              Mot de passe oublié ?
            </Link>
          </div>
          <Button type="submit" className="w-full bg-[#C2553B] hover:bg-[#A23F29] text-white" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
