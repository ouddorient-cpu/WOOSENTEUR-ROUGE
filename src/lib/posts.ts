export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;        // ISO 8601 : "2026-03-20"
  updatedAt?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
    linkedin: string;
  };
  coverImage?: string;
  readingTime: number; // minutes
  featured?: boolean;
}

// ─── Auteur par défaut ────────────────────────────────────────────────────────

const AUTHOR = {
  name: 'Abderrahmane El Malki',
  role: 'Fondateur de Woosenteur · Entrepreneur Digital',
  avatar: 'https://res.cloudinary.com/dzagwz94z/image/upload/v1767267988/ChatGPT_Image_29_d%C3%A9c._2025_23_42_04_dku5kn.png',
  linkedin: 'https://www.linkedin.com/in/abderrahmen-elmalki-553051273/',
};

// ─── Base articles ────────────────────────────────────────────────────────────

export const posts: Post[] = [
  {
    slug: 'ia-generaliste-fiches-produits-ecommerce',
    title: 'Pourquoi les IA généralistes ratent les fiches produits e-commerce',
    excerpt:
      "ChatGPT rédige vite. Mais une fiche produit qui performe sur Google, c'est un titre SEO, une méta à 155 caractères, un slug, du JSON-LD. Voilà ce que les outils généralistes ne font pas — et pourquoi ça coûte cher.",
    date: '2026-03-18',
    category: 'SEO E-commerce',
    tags: ['fiche produit SEO', 'IA e-commerce', 'WooCommerce', 'Rank Math', 'Shopify'],
    author: AUTHOR,
    readingTime: 6,
    featured: true,
    content: `
<h2>La promesse et la réalité</h2>
<p>J'ai passé des nuits à optimiser des fiches produits pour des clients e-commerce. Chaque ligne écrite, chaque balise renseignée, chaque slug reformulé — une bataille méthodique pour satisfaire Rank Math, contenter Yoast, et finalement apparaître sur la première page de Google.</p>
<p>Quand les outils d'IA générative sont arrivés, beaucoup ont cru que cette corvée était terminée. "Tu n'as qu'à demander à ChatGPT." J'ai essayé. Longuement. Et voilà ce que j'ai trouvé.</p>

<h2>Ce que font les outils IA généralistes — et ce qu'ils ne font pas</h2>
<p>Un outil comme ChatGPT, Gemini ou Claude dans leur usage standard rédigent du texte fluide, souvent convaincant. Pour beaucoup de tâches, c'est suffisant. Pour une fiche produit qui doit performer sur Google, c'est insuffisant.</p>
<p>Une fiche produit e-commerce optimisée, ce n'est pas qu'un paragraphe de description. C'est une architecture :</p>
<ul>
  <li>Un <strong>titre SEO</strong> formaté selon les conventions de votre CMS (60 caractères, mot-clé principal en tête)</li>
  <li>Une <strong>méta-description</strong> calibrée à 155 caractères avec appel à l'action</li>
  <li>Un <strong>slug URL</strong> propre, sans stop words, en minuscules</li>
  <li>Des <strong>balises alt</strong> pour chaque image (accessibilité + référencement image)</li>
  <li>Un bloc <strong>JSON-LD</strong> de données structurées (schema.org Product) pour les rich snippets Google</li>
  <li>Une <strong>description longue</strong> avec les mots-clés LSI naturellement intégrés</li>
</ul>
<p>Quand vous demandez à un outil généraliste de "rédiger une fiche produit", vous obtenez le dernier point de cette liste. Parfois le premier. Rarement tout.</p>

<h2>Le problème du reformatage</h2>
<p>La conséquence concrète : vous recevez du texte. Du bon texte, souvent. Mais vous devez ensuite :</p>
<ul>
  <li>Extraire manuellement ce qui pourrait servir de titre SEO</li>
  <li>Rédiger vous-même la méta-description</li>
  <li>Créer le slug</li>
  <li>Ajouter les balises alt à la main dans votre média WooCommerce</li>
  <li>Générer séparément le JSON-LD avec un outil tiers</li>
</ul>
<p>Où est le gain de temps ? Vous avez économisé 20 minutes sur la rédaction pour en passer 40 sur le formatage. Et si vous gérez 100, 200 ou 500 références, cette friction se transforme en goulot d'étranglement réel.</p>

<h2>Pourquoi ce n'est pas la faute des IA généralistes</h2>
<p>Ce serait une erreur de critiquer ces outils pour ce qu'ils ne prétendent pas faire. ChatGPT a été conçu pour l'utilisateur moyen — rédiger des emails, résumer des documents, expliquer des concepts. Son audience est universelle.</p>
<p>Une fiche produit WooCommerce optimisée Rank Math s'adresse à un contexte très spécifique : un e-commerçant, une plateforme précise, des règles SEO connues, un acheteur ciblé. Ce niveau de spécialisation demande un outil construit pour ce contexte — pas un outil généraliste qu'on essaie de spécialiser à coups de prompts.</p>

<h2>La différence entre "produire du texte" et "produire une fiche"</h2>
<p>C'est la distinction fondamentale. Un outil généraliste produit du texte. Un outil e-commerce produit une fiche — c'est-à-dire une structure de données complète, prête à être importée dans WooCommerce ou exportée en CSV Shopify.</p>
<p>Cette différence a une valeur économique directe. Une fiche incomplète qui n'apparaît pas dans les résultats Google ne vend pas. Une fiche structurée qui remonte en position 3 sur une requête longue traîne génère des ventes sans publicité payante.</p>

<h2>Ce qu'on a construit avec Woosenteur</h2>
<p>Woosenteur est né de cette frustration. Après avoir cherché l'outil qui n'existait pas, nous l'avons construit. L'idée directrice : chaque génération produit une architecture complète, pas un paragraphe.</p>
<p>L'IA connaît les règles de Rank Math et Yoast. Elle connaît le format d'import WooCommerce et le CSV Shopify. Elle adapte le vocabulaire à votre niche — parfums, cosmétiques, mode, maison, sport — parce que ces marchés ont chacun leur lexique, leurs attentes sémantiques, leurs acheteurs spécifiques.</p>
<p>Vous renseignez le nom du produit et quelques informations. Vous obtenez en retour : titre, méta, slug, description courte, description longue, balises alt suggérées, données JSON-LD. Tout ce que vous auriez passé 1 à 2 heures à assembler manuellement.</p>

<h2>La vraie question à se poser</h2>
<p>Ce n'est pas "faut-il utiliser l'IA pour ses fiches produits ?" La réponse est évidente pour quiconque gère plus d'une dizaine de références. La vraie question est : quel outil a été conçu pour WooCommerce, pour Rank Math, pour votre acheteur — et pas pour l'utilisateur moyen d'un chatbot généraliste ?</p>
<p>Les 5 premières fiches sont gratuites sur <a href="https://woosenteur.fr" class="text-primary font-semibold hover:underline">woosenteur.fr</a>. Sans carte bancaire. La suite, c'est à vous d'en juger.</p>
    `,
  },

  {
    slug: 'rediger-100-fiches-produits-sans-se-ruiner',
    title: 'Rédiger 100 fiches produits sans se ruiner : le calcul que tout e-commerçant devrait faire',
    excerpt:
      "Un copywriter freelance facture entre 40 et 120 € la fiche. Pour 150 références, la facture monte vite. Et le faire soi-même, c'est 1 à 2 heures par fiche. Voilà pourquoi ce problème n'a pas eu de vraie solution pendant 20 ans.",
    date: '2026-03-22',
    category: 'E-commerce',
    tags: ['copywriting e-commerce', 'fiche produit', 'WooCommerce', 'Shopify', 'productivité'],
    author: AUTHOR,
    readingTime: 7,
    featured: false,
    content: `
<h2>Le dilemme que personne ne résout vraiment</h2>
<p>La semaine dernière, une gérante de boutique WooCommerce me confiait son problème. Elle venait de finaliser son catalogue : 147 références. Robes, accessoires, quelques articles maison. Une belle collection. Un seul obstacle : les fiches produits.</p>
<p>"Je n'ai pas les mots pour décrire chaque article de façon professionnelle. Et je n'ai pas non plus le budget pour payer quelqu'un."</p>
<p>Ce dilemme, je l'ai entendu des dizaines de fois. Et pendant longtemps, il n'avait pas de vraie solution.</p>

<h2>Le calcul que tout e-commerçant devrait faire</h2>
<p>Voici les trois options qui s'offrent traditionnellement à un gérant de boutique en ligne :</p>

<h3>Option 1 : Confier à un copywriter freelance</h3>
<p>Un rédacteur freelance spécialisé e-commerce facture entre 40 et 120 € la fiche, selon sa réputation et la complexité de votre niche. Pour 150 références :</p>
<ul>
  <li>Au tarif bas : <strong>6 000 €</strong></li>
  <li>Au tarif moyen : <strong>12 000 €</strong></li>
  <li>Au tarif haut : <strong>18 000 €</strong></li>
</ul>
<p>Un investissement colossal pour une PME ou un indépendant. Et c'est sans compter les allers-retours de corrections, les délais, et l'optimisation SEO qui demande souvent des ajustements supplémentaires.</p>

<h3>Option 2 : Le faire soi-même</h3>
<p>Comptez 1 à 2 heures par fiche pour un résultat correct — rédaction, optimisation SEO, vérification Rank Math, formatage WooCommerce. Pour 150 fiches, c'est entre 150 et 300 heures de travail. Six à douze semaines à plein temps, en parallèle de la gestion quotidienne de votre boutique.</p>
<p>Et encore, sans la garantie que le résultat sera bien référencé. La plupart des gérants de boutique ne sont pas experts SEO. Une fiche écrite "à l'instinct" peut être bien rédigée sans pour autant apparaître dans les résultats Google.</p>

<h3>Option 3 : Ne pas faire les fiches</h3>
<p>C'est l'option que beaucoup choisissent par défaut : copier la description du fournisseur, écrire deux lignes génériques, ou laisser certaines fiches quasi vides. Les conséquences sont prévisibles : duplicate content pénalisé par Google, taux de conversion faible, produits invisibles en recherche organique.</p>

<h2>Pourquoi ce problème a duré 20 ans</h2>
<p>Le copywriting e-commerce n'est pas une invention d'internet. Les grandes enseignes — La Redoute, Les 3 Suisses, le Bon Marché — employaient des équipes entières pour rédiger leurs catalogues papier. Chaque description était travaillée, testée, optimisée.</p>
<p>WooCommerce, Shopify et PrestaShop ont rendu la vente en ligne accessible à tout le monde. Mais ils n'ont pas résolu le problème de la rédaction. Des millions de commerçants indépendants se sont retrouvés à devoir maîtriser une compétence que des équipes entières assuraient autrefois.</p>
<p>Pendant 20 ans, les seules solutions étaient : payer cher, y passer du temps, ou faire sans. Aucune n'était satisfaisante.</p>

<h2>Ce que l'IA généraliste a changé — et ce qu'elle n'a pas résolu</h2>
<p>L'arrivée de ChatGPT a ouvert une nouvelle option. Rédiger une description en 30 secondes, dans n'importe quelle langue, pour n'importe quel produit. Le gain est réel sur la vitesse de rédaction.</p>
<p>Mais un problème persiste : ces outils produisent du texte, pas des fiches. Un titre rédigé par ChatGPT n'est pas formaté pour Rank Math. La méta-description n'est pas calibrée à 155 caractères. Le slug n'existe pas. Le JSON-LD non plus. Vous gagnez du temps sur la rédaction pour en perdre sur le formatage et l'optimisation.</p>
<p>Pour quelqu'un qui gère 150 références, la frustration change de forme — elle ne disparaît pas.</p>

<h2>Une approche différente</h2>
<p>Woosenteur a été construit pour répondre à cette question spécifique : comment produire une fiche complète — pas juste du texte — en quelques minutes, sans expertise SEO préalable ?</p>
<p>Concrètement, chaque génération produit :</p>
<ul>
  <li>Un titre SEO optimisé (60 caractères, mot-clé en tête)</li>
  <li>Une méta-description (155 caractères, appel à l'action)</li>
  <li>Un slug URL propre</li>
  <li>Une description courte et une description longue adaptées à votre niche</li>
  <li>Des suggestions de balises alt pour vos images</li>
  <li>Un bloc JSON-LD schema.org Product pour les rich snippets Google</li>
</ul>
<p>L'export est directement compatible WooCommerce (publication en 1 clic) ou Shopify (CSV prêt à l'import). Pas de reformatage. Pas de copier-coller.</p>

<h2>Le calcul revisité</h2>
<p>Pour revenir à la gérante de boutique avec ses 147 fiches à créer :</p>
<ul>
  <li>Copywriter freelance : entre 5 880 € et 17 640 €</li>
  <li>Faire soi-même : 147 à 294 heures de travail</li>
  <li>Avec Woosenteur : environ 3 à 5 minutes par fiche, soit 7 à 12 heures au total</li>
</ul>
<p>Ce n'est pas une question de remplacement. C'est une question d'accès. Le copywriting produit de qualité était réservé aux entreprises qui pouvaient se l'offrir. Aujourd'hui, il ne l'est plus.</p>

<h2>Pour commencer</h2>
<p>Les 5 premières fiches sont gratuites sur <a href="https://woosenteur.fr" class="text-primary font-semibold hover:underline">woosenteur.fr</a>. Sans inscription obligatoire, sans carte bancaire. Vous verrez la structure complète générée pour votre produit, et vous jugerez par vous-même si c'est ce dont vous avez besoin.</p>
    `,
  },
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

export function getAllPosts(): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getFeaturedPost(): Post | undefined {
  return posts.find((p) => p.featured);
}

export function getRelatedPosts(slug: string, limit = 2): Post[] {
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}
