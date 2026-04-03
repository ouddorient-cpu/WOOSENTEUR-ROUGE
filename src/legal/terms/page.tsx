
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation',
  robots: {
    index: false,
    follow: false,
  }
};

const TermsPage = () => {
  return (
    <>
      <h1>Conditions Générales d'Utilisation (CGU)</h1>
      <p className="lead">Dernière mise à jour : 31 Juillet 2024</p>
      
      <h2>Article 1 : Objet</h2>
      <p>
        Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités de mise à disposition du service Woosenteur v2 (ci-après « le Service ») et les conditions d’utilisation du Service par l’Utilisateur.
      </p>
      
      <h2>Article 2 : Accès au service</h2>
      <p>
        L'accès au Service est subordonné à la création d'un compte. L'Utilisateur doit fournir des informations exactes et à jour. L'Utilisateur est seul responsable de la conservation du caractère confidentiel de ses identifiants de connexion.
      </p>
      
      <h2>Article 3 : Propriété Intellectuelle</h2>
      <p>
        La structure générale du site Woosenteur v2, ainsi que les textes, graphiques, images, sons et vidéos la composant, sont la propriété de l'éditeur ou de ses partenaires. Toute représentation et/ou reproduction et/ou exploitation partielle ou totale des contenus et services proposés par le site Woosenteur v2, par quelque procédé que ce soit, sans l'autorisation préalable et par écrit de l'éditeur est strictement interdite et serait susceptible de constituer une contrefaçon au sens des articles L 335-2 et suivants du Code de la propriété intellectuelle.
      </p>
      <p>
        Le contenu généré par l'intelligence artificielle pour l'Utilisateur (descriptions de produits, données SEO, etc.) devient la propriété de l'Utilisateur dès sa création, sous réserve du respect des présentes CGU et du paiement complet des services souscrits. L'Utilisateur assume l'entière responsabilité de l'utilisation, de la publication et de la diffusion de ce contenu.
      </p>

      <h2>Article 4 : Responsabilité de l'Utilisateur</h2>
      <p>
        L'Utilisateur est responsable des données qu'il fournit pour la génération de contenu (noms de produits, marques, etc.). Il s'engage à ne pas utiliser le Service à des fins illégales ou interdites par les présentes CGU.
      </p>
      <p>
        L'Utilisateur reconnaît que la qualité du contenu généré par l'IA dépend des informations qu'il fournit. Woosenteur v2 ne pourra être tenu responsable des inexactitudes ou du manque de pertinence du contenu généré si les données d'entrée sont erronées ou incomplètes.
      </p>
      
      <h2>Article 5 : Responsabilité de l'Éditeur</h2>
      <p>
        Le Service est fourni "en l'état" et "tel que disponible". Woosenteur v2 ne garantit pas que le Service sera ininterrompu, exempt d'erreurs ou sécurisé. Une obligation de moyen pèse sur l'éditeur concernant l'accès et l'utilisation du service.
      </p>
      <p>
        La responsabilité de Woosenteur v2 ne saurait être engagée en cas de force majeure ou du fait imprévisible et insurmontable d'un tiers.
      </p>

      <h2>Article 6 : Paiements et Abonnements</h2>
      <p>
        L'accès à certaines fonctionnalités du Service est payant. Les tarifs sont indiqués sur la page "Tarifs". Les paiements sont gérés par notre prestataire sécurisé Stripe. En souscrivant à un abonnement, l'Utilisateur accepte les conditions de paiement et de renouvellement automatique. L'Utilisateur peut résilier son abonnement à tout moment depuis son tableau de bord.
      </p>
      
      <h2>Article 7 : Droit de rétractation</h2>
      <p>
        Conformément à l'article L. 221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture d'un contenu numérique non fourni sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation. En utilisant le Service pour générer du contenu, vous renoncez expressément à votre droit de rétractation.
      </p>

      <h2>Article 8 : Droit applicable et juridiction compétente</h2>
      <p>
        Les présentes CGU sont soumises au droit français. En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux compétents de [Ville du tribunal compétent].
      </p>
    </>
  );
};

export default TermsPage;
