'use client';

import { useState, useCallback } from 'react';
import { MessageSquarePlus, Star, Send, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase/auth/use-user';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { usePathname } from 'next/navigation';

type Status = 'idle' | 'open' | 'sending' | 'sent';

export default function FeedbackButton() {
  const { user } = useUser();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>('idle');
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [message, setMessage] = useState('');

  const handleSend = useCallback(async () => {
    if (!message.trim() || rating === 0 || !user) return;

    setStatus('sending');
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userEmail: user.email ?? '',
        rating,
        message: message.trim(),
        page: pathname,
        createdAt: serverTimestamp(),
      });
      setStatus('sent');
      setTimeout(() => {
        setStatus('idle');
        setRating(0);
        setMessage('');
      }, 2500);
    } catch (e) {
      console.error('Feedback error:', e);
      setStatus('open');
    }
  }, [message, rating, user, pathname]);

  if (!user) return null;

  return (
    <>
      {/* Floating trigger button */}
      {status === 'idle' && (
        <button
          onClick={() => setStatus('open')}
          className="fixed bottom-24 left-4 sm:left-6 z-50 flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full shadow-lg shadow-primary/30 text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105"
          aria-label="Donner mon avis"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Donner mon avis</span>
        </button>
      )}

      {/* Feedback panel */}
      {(status === 'open' || status === 'sending' || status === 'sent') && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Votre avis compte
            </p>
            {status !== 'sending' && status !== 'sent' && (
              <button
                onClick={() => { setStatus('idle'); setRating(0); setMessage(''); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {status === 'sent' ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-foreground">Merci pour votre retour !</p>
              <p className="text-xs text-muted-foreground text-center px-4">
                Votre avis nous aide à améliorer Woosenteur.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Star rating */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Note globale</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110"
                      disabled={status === 'sending'}
                    >
                      <Star
                        className={cn(
                          'h-7 w-7 transition-colors',
                          (hovered || rating) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/40'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Ce qui vous a aidé, ce qui manque, un bug…
                </p>
                <Textarea
                  rows={3}
                  placeholder="Ex: La génération est rapide mais j'aurais aimé pouvoir choisir le ton..."
                  className="resize-none text-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === 'sending'}
                />
              </div>

              <Button
                size="sm"
                className="w-full"
                onClick={handleSend}
                disabled={!message.trim() || rating === 0 || status === 'sending'}
              >
                {status === 'sending' ? (
                  <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Envoi...</>
                ) : (
                  <><Send className="mr-2 h-3.5 w-3.5" /> Envoyer mon avis</>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
