/**
 * Flow 4: Générer les éléments olfactifs visuels
 * Mappe chaque note à un élément visuel (fleur, feuille, épice, etc.)
 */

import { defineFlow } from "genkit";
import type { VisualElement } from "@/types/marketing";

// Dictionnaire de mapping: note olfactive → élément visuel
const SCENT_TO_VISUAL: Record<
  string,
  { type: VisualElement["type"]; icon: string; color: string }
> = {
  // Florales
  rose: { type: "flower", icon: "🌹", color: "#E91E63" },
  orchidée: { type: "flower", icon: "🌺", color: "#9C27B0" },
  orchidee: { type: "flower", icon: "🌺", color: "#9C27B0" },
  jasmin: { type: "flower", icon: "🌼", color: "#FDD835" },
  pivoine: { type: "flower", icon: "🌸", color: "#FF69B4" },
  fleur: { type: "flower", icon: "🌹", color: "#E91E63" },

  // Agrumes
  bergamote: { type: "sparkle", icon: "✨", color: "#FFA500" },
  citron: { type: "sparkle", icon: "💫", color: "#FFEB3B" },
  orange: { type: "sparkle", icon: "✨", color: "#FF6F00" },
  agrume: { type: "sparkle", icon: "💫", color: "#FFC107" },

  // Bois
  cèdre: { type: "leaf", icon: "🍃", color: "#795548" },
  cedre: { type: "leaf", icon: "🍃", color: "#795548" },
  santal: { type: "leaf", icon: "🍂", color: "#8D6E63" },
  vétiver: { type: "leaf", icon: "🌿", color: "#4CAF50" },
  vetiver: { type: "leaf", icon: "🌿", color: "#4CAF50" },
  oud: { type: "leaf", icon: "🍃", color: "#3E2723" },
  bois: { type: "leaf", icon: "🍃", color: "#795548" },

  // Épices
  vanille: { type: "spice", icon: "🌽", color: "#D2B48C" },
  cannelle: { type: "spice", icon: "🌶️", color: "#CD5C5C" },
  cardamome: { type: "spice", icon: "🌶️", color: "#FF6347" },
  poivre: { type: "spice", icon: "🌶️", color: "#8B0000" },
  épice: { type: "spice", icon: "🌶️", color: "#DC143C" },
  epice: { type: "spice", icon: "🌶️", color: "#DC143C" },

  // Ambre & Musc
  ambre: { type: "molecule", icon: "⚛️", color: "#FFB74D" },
  musc: { type: "molecule", icon: "⚛️", color: "#D7CCC8" },
  ambroxan: { type: "molecule", icon: "⚛️", color: "#FFB74D" },
  ambrox: { type: "molecule", icon: "⚛️", color: "#FFB74D" },

  // Fruits
  pêche: { type: "flower", icon: "🍑", color: "#FFAB91" },
  pomme: { type: "sparkle", icon: "🍎", color: "#F44336" },
  raisin: { type: "sparkle", icon: "🍇", color: "#9C27B0" },

  // Herbes
  lavande: { type: "leaf", icon: "🌿", color: "#7B68EE" },
  menthe: { type: "leaf", icon: "🌿", color: "#00C853" },
  herbe: { type: "leaf", icon: "🌿", color: "#4CAF50" },
};

export const generateOlfactoryVisuals = defineFlow(
  {
    name: "generateOlfactoryVisuals",
    description:
      "Génère des éléments visuels basés sur les notes olfactives d'un parfum",
    inputSchema: {
      type: "object",
      properties: {
        fragranceNotes: {
          type: "object",
          properties: {
            top: { type: "array", items: { type: "string" } },
            heart: { type: "array", items: { type: "string" } },
            base: { type: "array", items: { type: "string" } },
          },
        },
      },
      required: ["fragranceNotes"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          icon: { type: "string" },
          label: { type: "string" },
          color: { type: "string" },
          position: {
            type: "object",
            properties: { x: { type: "number" }, y: { type: "number" } },
          },
          size: { type: "string" },
        },
      },
    },
  },
  async (input: any) => {
    const { fragranceNotes }: { fragranceNotes: { top?: string[]; heart?: string[]; base?: string[] } } = input;

    const allNotes = [
      ...(fragranceNotes.top || []),
      ...(fragranceNotes.heart || []),
      ...(fragranceNotes.base || []),
    ];

    const visualElements: VisualElement[] = [];

    // Convertir chaque note en élément visuel
    allNotes.forEach((note, index) => {
      const normalizedNote = note.toLowerCase();
      const visual = SCENT_TO_VISUAL[normalizedNote];

      if (visual) {
        // Distribue les éléments sur le fond blanc
        const totalNotes = allNotes.length;
        const positionIndex = index;

        // Grid layout: 3 colonnes
        const col = positionIndex % 3;
        const row = Math.floor(positionIndex / 3);

        // Positions aléatoires mais distribuées
        const baseX = 25 + col * 30 + Math.random() * 10;
        const baseY = 30 + row * 25 + Math.random() * 15;

        visualElements.push({
          type: visual.type,
          icon: visual.icon,
          label: note,
          color: visual.color,
          position: { x: baseX, y: baseY },
          size:
            index < 3 ? "large" : index < 6 ? "medium" : "small", // Top notes plus grandes
        });
      }
    });

    // Si pas assez d'éléments, ajoute des "étoiles décoratives"
    while (visualElements.length < 5) {
      visualElements.push({
        type: "star",
        icon: "⭐",
        label: "Premium",
        color: "#FFD700",
        position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
        size: "small",
      });
    }

    return visualElements;
  }
);
