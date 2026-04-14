// Types pour le système de marketing de Woosenteur

export interface PerfumeData {
  id: string;
  name: string; // Ex: "Tom Ford Black Orchid"
  brand: string; // Ex: "Tom Ford"
  fragranceNotes: {
    top: string[]; // Ex: ["Bergamote", "Petit Grain"]
    heart: string[]; // Ex: ["Orchidée noire", "Rose"]
    base: string[]; // Ex: ["Vétiver", "Musc"]
  };
  price: number;
  imageUrl?: string;
}

export interface ClonePerfume extends PerfumeData {
  originalPerfumeId: string;
  priceReduction: number; // % moins cher que l'original
}

export interface MarketingContent {
  id: string;
  originalPerfume: PerfumeData;
  clonePerfume: ClonePerfume;
  slogan: string; // "Tu aimes X mais pas son prix? Voici la solution B ✨"
  visualElements: VisualElement[]; // Éléments olfactifs à dessiner
  imageUrl: string; // Image finale avec slogan + éléments olfactifs
  createdAt: Date;
  status: "draft" | "ready" | "published";
}

export interface VisualElement {
  type: "flower" | "leaf" | "spice" | "molecule" | "star" | "sparkle";
  icon: string; // Emoji ou nom
  label: string; // Ex: "Orchidée noire"
  color: string; // Hex color
  position: { x: number; y: number }; // Position % sur l'image
  size: "small" | "medium" | "large";
}

export interface MarketingRequest {
  uploadedImageBase64: string;
  targetPlatform: "tiktok" | "instagram" | "facebook" | "linkedin";
  customSlogan?: string;
  detectedProduct?: string;
}

export interface MarketingResponse {
  success: boolean;
  data?: MarketingContent;
  error?: string;
}

export interface SocialSharePayload {
  contentId: string;
  platform: "tiktok" | "instagram" | "facebook" | "linkedin";
  caption?: string;
}
