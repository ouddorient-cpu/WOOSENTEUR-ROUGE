
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  robots: {
    index: false,
    follow: false,
  }
};

const PrivacyPage = () => {
  return (
    <>
      <h1>Politique de Confidentialité</h1>
      <p className="lead">Dernière mise à jour : 31 Juillet 2024</p>
      
      <p>
        La présente Politique de Confidentialité décrit la manière dont WooSenteur (« nous », « notre » ou « nos ») collecte, utilise et divulgue vos informations personnelles lorsque vous utilisez notre site web (le « Service »).
      </p>

      <h2>1. Collecte et Utilisation des Informations</h2>
      <p>Nous collectons plusieurs types d'informations à différentes fins pour fournir et améliorer notre Service.</p>
      
      <h3>Types de Données Collectées</h3>
      <ul>
        <li>
          <strong>Données Personnelles :</strong> Lors de l'utilisation de notre Service, nous pouvons vous demander de nous fournir certaines informations personnelles identifiables qui могут être utilisées pour vous contacter ou vous identifier (« Données Personnelles »). Ces informations peuvent inclure, mais ne sont pas limitées à :
          <ul>
            <li>Adresse e-mail</li>
            <li>Prénom et nom de famille</li>
            <li>Données d'utilisation (voir ci-dessous)</li>
          </ul>
        </li>
        <li>
          <strong>Données d'Utilisation :</strong> Nous pouvons également collecter des informations sur la manière dont le Service est accédé et utilisé. Ces Données d'Utilisation peuvent inclure des informations telles que l'adresse de protocole Internet de votre ordinateur (par exemple, l'adresse IP), le type de navigateur, la version du navigateur, les pages de notre Service que vous visitez, l'heure et la date de votre visite, le temps passé sur ces pages et d'autres données de diagnostic.
        </li>
        <li>
          <strong>Données des Cookies :</strong> Nous utilisons des cookies et des technologies de suivi similaires pour suivre l'activité sur notre Service. Veuillez consulter notre Politique relative aux Cookies pour plus de détails.
        </li>
      </ul>

      <h2>2. Utilisation des Données</h2>
      <p>WooSenteur utilise les données collectées pour diverses finalités :</p>
      <ul>
        <li>Fournir et maintenir notre Service</li>
        <li>Gérer votre compte et vous fournir le support client</li>
        <li>Traiter vos paiements et abonnements via notre fournisseur tiers, Stripe</li>
        <li>Vous informer des modifications apportées à notre Service</li>
        <li>Recueillir des analyses ou des informations précieuses afin d'améliorer notre Service</li>
        <li>Surveiller l'utilisation de notre Service</li>
      </ul>
      
      <h2>3. Partage et Transfert de Données</h2>
      <p>
        Vos informations, y compris les Données Personnelles, peuvent être transférées et conservées sur des ordinateurs situés en dehors de votre état, province, pays ou autre juridiction gouvernementale où les lois sur la protection des données peuvent différer de celles de votre juridiction.
      </p>
      <p>
        Nous ne vendons, n'échangeons, ni ne louons vos informations d'identification personnelles à des tiers. Nous pouvons partager vos informations avec des fournisseurs de services tiers de confiance qui nous aident à exploiter notre entreprise, tels que Firebase (pour l'authentification et la base de données) et Stripe (pour les paiements).
      </p>

      <h2>4. Sécurité des Données</h2>
      <p>
        La sécurité de vos données est importante pour nous, mais rappelez-vous qu'aucune méthode de transmission sur Internet ou méthode de stockage électronique n'est sécurisée à 100 %. Bien que nous nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos Données Personnelles, nous ne pouvons garantir leur sécurité absolue.
      </p>

      <h2>5. Vos Droits en matière de Protection des Données (RGPD)</h2>
      <p>Si vous êtes un résident de l'Espace Économique Européen (EEE), vous disposez de certains droits en matière de protection des données :</p>
      <ul>
        <li>Le droit d'accès, de mise à jour ou de suppression des informations que nous avons sur vous.</li>
        <li>Le droit de rectification.</li>
        <li>Le droit d'opposition.</li>
        <li>Le droit à la limitation du traitement.</li>
        <li>Le droit à la portabilité des données.</li>
        <li>Le droit de retirer votre consentement.</li>
      </ul>
      <p>Pour exercer ces droits, veuillez nous contacter à l'adresse contact@woosenteur.fr.</p>

      <h2>6. Modifications de cette Politique de Confidentialité</h2>
      <p>
        Nous pouvons mettre à jour notre Politique de Confidentialité de temps à autre. Nous vous informerons de toute modification en publiant la nouvelle Politique de Confidentialité sur cette page.
      </p>

      <h2>7. Nous Contacter</h2>
      <p>
        Si vous avez des questions concernant cette Politique de Confidentialité, veuillez nous contacter : contact@woosenteur.fr.
      </p>
    </>
  );
};

export default PrivacyPage;
