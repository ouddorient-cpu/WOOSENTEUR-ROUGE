
'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createUser } from '@/lib/firebase/users';
import Image from 'next/image';

interface GoogleSignInButtonProps {
  onSuccess: (user: User) => void;
  onFailure: (error: any) => void;
  onLoading: (loading: boolean) => void;
  text?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onFailure, onLoading, text = 'Continuer avec Google' }) => {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    onLoading(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;
      
      // The signed-in user info.
      const user = result.user;
      await createUser(user); // Ensure user profile exists in Firestore

      toast({
        title: 'Connexion réussie',
        description: `Bienvenue, ${user.displayName || user.email}!`,
      });

      onSuccess(user);

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message,
      });
      onFailure(error);
    } finally {
        onLoading(false);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
       <Image 
          src="https://www.vectorlogo.zone/logos/google/google-icon.svg"
          alt="Google logo"
          width={20}
          height={20}
          className="mr-2"
        />
      {text}
    </Button>
  );
};

export default GoogleSignInButton;
