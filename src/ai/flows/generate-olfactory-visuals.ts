'use server';
/**
 * Flow 4: Générer les éléments olfactifs visuels (pure logique, sans appel IA)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { VisualElement } from '@/types/marketing';

const SCENT_TO_VISUAL: Record<string, { type: VisualElement['type']; icon: string; color: string }> = {
  rose:       { type: 'flower',   icon: '🌹', color: '#E91E63' },
  orchidée:   { type: 'flower',   icon: '🌺', color: '#9C27B0' },
  orchidee:   { type: 'flower',   icon: '🌺', color: '#9C27B0' },
  jasmin:     { type: 'flower',   icon: '🌼', color: '#FDD835' },
  pivoine:    { type: 'flower',   icon: '🌸', color: '#FF69B4' },
  fleur:      { type: 'flower',   icon: '🌹', color: '#E91E63' },
  bergamote:  { type: 'sparkle',  icon: '✨', color: '#FFA500' },
  citron:     { type: 'sparkle',  icon: '💫', color: '#FFEB3B' },
  orange:     { type: 'sparkle',  icon: '✨', color: '#FF6F00' },
  agrume:     { type: 'sparkle',  icon: '💫', color: '#FFC107' },
  cèdre:      { type: 'leaf',     icon: '🍃', color: '#795548' },
  cedre:      { type: 'leaf',     icon: '🍃', color: '#795548' },
  santal:     { type: 'leaf',     icon: '🍂', color: '#8D6E63' },
  vétiver:    { type: 'leaf',     icon: '🌿', color: '#4CAF50' },
  vetiver:    { type: 'leaf',     icon: '🌿', color: '#4CAF50' },
  oud:        { type: 'leaf',     icon: '🍃', color: '#3E2723' },
  bois:       { type: 'leaf',     icon: '🍃', color: '#795548' },
  vanille:    { type: 'spice',    icon: '🌽', color: '#D2B48C' },
  cannelle:   { type: 'spice',    icon: '🌶️', color: '#CD5C5C' },
  cardamome:  { type: 'spice',    icon: '🌶️', color: '#FF6347' },
  poivre:     { type: 'spice',    icon: '🌶️', color: '#8B0000' },
  épice:      { type: 'spice',    icon: '🌶️', color: '#DC143C' },
  epice:      { type: 'spice',    icon: '🌶️', color: '#DC143C' },
  ambre:      { type: 'molecule', icon: '⚛️', color: '#FFB74D' },
  musc:       { type: 'molecule', icon: '⚛️', color: '#D7CCC8' },
  ambroxan:   { type: 'molecule', icon: '⚛️', color: '#FFB74D' },
  ambrox:     { type: 'molecule', icon: '⚛️', color: '#FFB74D' },
  pêche:      { type: 'flower',   icon: '🍑', color: '#FFAB91' },
  pomme:      { type: 'sparkle',  icon: '🍎', color: '#F44336' },
  raisin:     { type: 'sparkle',  icon: '🍇', color: '#9C27B0' },
  lavande:    { type: 'leaf',     icon: '🌿', color: '#7B68EE' },
  menthe:     { type: 'leaf',     icon: '🌿', color: '#00C853' },
  herbe:      { type: 'leaf',     icon: '🌿', color: '#4CAF50' },
};

const InputSchema = z.object({
  fragranceNotes: z.object({
    top:   z.array(z.string()).optional().default([]),
    heart: z.array(z.string()).optional().default([]),
    base:  z.array(z.string()).optional().default([]),
  }),
});

const VisualElementSchema = z.object({
  type:     z.string(),
  icon:     z.string(),
  label:    z.string(),
  color:    z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  size:     z.enum(['large', 'medium', 'small']),
});

export const generateOlfactoryVisuals = ai.defineFlow(
  {
    name: 'generateOlfactoryVisuals',
    inputSchema: InputSchema,
    outputSchema: z.array(VisualElementSchema),
  },
  async (input) => {
    const { fragranceNotes } = input;
    const allNotes = [
      ...(fragranceNotes.top ?? []),
      ...(fragranceNotes.heart ?? []),
      ...(fragranceNotes.base ?? []),
    ];

    const visualElements: VisualElement[] = [];

    allNotes.forEach((note, index) => {
      const visual = SCENT_TO_VISUAL[note.toLowerCase()];
      if (!visual) return;

      const col = index % 3;
      const row = Math.floor(index / 3);
      visualElements.push({
        type:     visual.type,
        icon:     visual.icon,
        label:    note,
        color:    visual.color,
        position: {
          x: 25 + col * 30 + Math.random() * 10,
          y: 30 + row * 25 + Math.random() * 15,
        },
        size: index < 3 ? 'large' : index < 6 ? 'medium' : 'small',
      });
    });

    while (visualElements.length < 5) {
      visualElements.push({
        type: 'star',
        icon: '⭐',
        label: 'Premium',
        color: '#FFD700',
        position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
        size: 'small',
      });
    }

    return visualElements;
  }
);
