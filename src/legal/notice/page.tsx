
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales',
  robots: {
    index: false,
    follow: false,
  }
};

const LegalNoticePage = () => {
  return (
    <>
      <h1>Mentions Légales</h1>
      <p className="lead">Conformément aux dispositions des lois marocaines, notamment la loi n° 31-08 édictant des mesures de protection du consommateur.</p>

      <h2>Éditeur du Site</h2>
      <p>
        <strong>Raison sociale :</strong> Abderrahmane EL MALKI (Auto-Entrepreneur)
        <br />
        <strong>Nom commercial :</strong> Woosenteur v2
        <br />
        <strong>Activité exercée :</strong> 10066 - Vente par INTERNET
        <br />
        <strong>Identifiant de l'auto-entrepreneur :</strong> 003405900000095
        <br />
        <strong>N° de la taxe professionnelle :</strong> 36206974
        <br />
        <strong>Identifiant fiscal :</strong> 60120121
        <br />
        <strong>Adresse du siège :</strong> ZONE 2 BLOC F ELBASSATINE MEKNES 50000, Maroc
        <br />
        <strong>E-mail :</strong> contact@woosenteur.fr
        <br />
        <strong>N° de téléphone :</strong> 0699-24-55-42
        <br />
        <strong>Directeur de la publication :</strong> Abderrahmane EL MALKI
      </p>

      <h2>Hébergement du Site</h2>
      <p>
        Le site Woosenteur v2 est hébergé par :
        <br />
        <strong>Vercel Inc.</strong>
        <br />
        440 N Rengstorff Ave,
        <br />
        Mountain View, CA 94043, USA
        <br />
        Email : <a href="mailto:privacy@vercel.com">privacy@vercel.com</a>
      </p>
      
      <h2>Propriété Intellectuelle</h2>
      <p>
        L'ensemble de ce site (contenu, textes, images, vidéos et tout autre élément) est la propriété exclusive de Woosenteur v2 ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Woosenteur v2.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Woosenteur v2 s'efforce de fournir des informations aussi précises que possible. Toutefois, nous ne pourrons être tenus responsables des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de notre fait ou du fait des tiers partenaires qui nous fournissent ces informations.
      </p>
    </>
  );
};

export default LegalNoticePage;
