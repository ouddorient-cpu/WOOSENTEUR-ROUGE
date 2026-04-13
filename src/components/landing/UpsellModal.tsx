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
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 100%)',
                }}
              >
                <div className="text-4xl mb-3">🎉</div>
                <DialogTitle className="text-2xl font-bold text-white leading-tight">
                  Votre fiche est prête !
                </DialogTitle>
                <DialogDescription className="text-white/90 mt-2 text-sm">
                  Créez votre compte gratuit et obtenez <strong className="text-white">5 fiches complètes</strong> offertes.
                </DialogDescription>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* What you get with free account */}
                <div className="space-y-2">
                  {[
                    '5 fiches produits complètes offertes',
                    'Slug SEO + Tags + FAQ Schema + JSON-LD',
                    'Publication WooCommerce en 1 clic',
                    'Historique de vos générations',
                    'Sans carte bancaire',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-green-50 text-sm">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-medium text-green-900">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-1">
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-600 to-amber-500 hover:opacity-90 text-white font-bold shadow-lg text-base"
                  >
                    <Link href="/signup">
                      <Star className="mr-2 h-4 w-4" />
                      Créer mon compte — 5 fiches gratuites
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="w-full text-muted-foreground">
                    <Link href="/pricing">
                      Voir les plans payants (dès 9,99€/mois)
                    </Link>
                  </Button>

                  <button
                    onClick={onClose}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    Non merci, continuer sans compte
                  </button>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t space-y-2 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                    Inscription en 30 secondes · Sans engagement
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
