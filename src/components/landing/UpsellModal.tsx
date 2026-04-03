'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShieldCheck, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UpsellModalProps {
  open: boolean;
  onClose: () => void;
  creditsUsed: number;
}

const features = [
  { text: '60 crédits/mois', free: false },
  { text: 'Import massif CSV (x1000 produits)', free: false },
  { text: 'Publication 1-clic WooCommerce', free: false },
  { text: 'Support prioritaire Chat/Email', free: false },
  { text: 'Exports illimités + historique', free: false },
  { text: 'Tous avantages Essentiel inclus', free: false },
];

export default function UpsellModal({ open, onClose, creditsUsed }: UpsellModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Gradient Header */}
              <div
                className="px-6 py-8 text-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 50%, #EF4444 100%)',
                }}
              >
                <div className="text-4xl mb-3">🚀</div>
                <DialogTitle className="text-2xl font-bold text-white leading-tight">
                  Bravo ! Vos {creditsUsed} fiches gratuites sont prêtes !
                </DialogTitle>
                <DialogDescription className="text-white/90 mt-2 text-sm">
                  Passez au Standard pour scaler vos ventes e-commerce.
                </DialogDescription>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Feature comparison */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    <span>Fonctionnalité</span>
                    <div className="flex gap-6">
                      <span>Standard</span>
                      <span>Gratuit</span>
                    </div>
                  </div>
                  {features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm"
                    >
                      <span className="font-medium">{feature.text}</span>
                      <div className="flex gap-10">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        {feature.free ? (
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-lg shadow-amber-500/25"
                  >
                    <Link href="/pricing">
                      <Star className="mr-2 h-4 w-4" />
                      Choisir Standard 9,99€
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/pricing">
                      Voir tous les plans
                    </Link>
                  </Button>

                  {creditsUsed < 5 && (
                    <button
                      onClick={onClose}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      Continuer gratuit
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t space-y-2 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                    Garantie 14 jours satisfait ou remboursé
                  </p>
                  <p className="text-xs italic text-muted-foreground">
                    &ldquo;Boosté mes ventes +47% en 1 mois !&rdquo; — Ahmed, DubaiNegoce
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
