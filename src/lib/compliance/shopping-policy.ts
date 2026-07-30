/**
 * Filet de sécurité anti-"Misrepresentation" / "Offres trompeuses" pour Google Merchant Center.
 * Détecte, après génération IA, les mentions interdites : avis/notes fictifs, comparaison
 * implicite à des marques tierces, certifications non prouvées, superlatifs invérifiables.
 * Ce n'est PAS un contrôle de conformité exhaustif — c'est un filet de sécurité qui s'ajoute
 * aux instructions du prompt, pour le cas où le modèle ne les respecte pas parfaitement.
 */

const FORBIDDEN_PATTERNS: RegExp[] = [
  /\bavis\b/i,
  /\btémoignages?\b/i,
  /plébiscité/i,
  /grandes? maisons?/i,
  /milliers? d'acheteurs?/i,
  /\bcertifié/i,
  /\bofficiel(le)?\b/i,
  /alternative (sérieuse )?(aux?|à la)/i,
  /dans la même famille que/i,
  /aussi bien que/i,
  /équivalent de/i,
  /\bétoiles?\b/i,
  /note de \d/i,
  /\d+[\s,.]?\d*\s*(avis|clients satisfaits|acheteurs)/i,
  /rupture de stock/i,
  /n[°º]\s?1 des ventes/i,
  /exclusivité mondiale/i,
  /partenariat officiel/i,
];

// Marques tierces connues (parfumerie) — la marque du vendeur (ownBrand) est exclue de la détection.
const THIRD_PARTY_BRANDS = [
  'chanel', 'dior', 'christian dior', 'yves saint laurent', 'ysl', 'tom ford',
  'giorgio armani', 'armani', 'gucci', 'versace', 'prada', 'hermès', 'hermes',
  'guerlain', 'lancôme', 'lancome', 'paco rabanne', 'carolina herrera',
  'jean paul gaultier', 'montblanc', 'burberry', 'calvin klein', 'ralph lauren',
  'bvlgari', 'bulgari', 'dolce & gabbana', 'dolce gabbana', 'valentino',
  'nina ricci', 'issey miyake', 'thierry mugler', 'mugler', 'azzaro',
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface ComplianceCheckInput {
  productTitle: string;
  shortDescription: string;
  longDescription: string;
  ownBrand?: string;
}

// Renvoie la liste des mentions interdites détectées (vide si le texte est conforme).
export function findComplianceViolations({ productTitle, shortDescription, longDescription, ownBrand }: ComplianceCheckInput): string[] {
  const fullText = `${productTitle}\n${shortDescription}\n${longDescription}`;
  const violations = new Set<string>();

  for (const pattern of FORBIDDEN_PATTERNS) {
    const match = fullText.match(pattern);
    if (match) violations.add(match[0]);
  }

  const normalizedOwnBrand = ownBrand?.trim().toLowerCase();
  for (const brand of THIRD_PARTY_BRANDS) {
    if (normalizedOwnBrand && brand === normalizedOwnBrand) continue;
    const regex = new RegExp(`\\b${escapeRegExp(brand)}\\b`, 'i');
    if (regex.test(fullText)) violations.add(brand);
  }

  return Array.from(violations);
}
