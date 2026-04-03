
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique relative aux Cookies',
  robots: {
    index: false,
    follow: false,
  }
};

const CookiesPage = () => {
  return (
    <>
      <h1>Politique relative aux Cookies</h1>
      <p className="lead">Dernière mise à jour : 31 Juillet 2024</p>
      
      <p>
        Cette politique relative aux cookies explique ce que sont les cookies et comment nous les utilisons sur WooSenteur ("Site", "nous", "notre"). Vous devez lire cette politique pour comprendre quels types de cookies nous utilisons, les informations que nous collectons à l'aide de cookies et comment ces informations sont utilisées.
      </p>

      <h2>Que sont les cookies ?</h2>
      <p>
        Les cookies sont de petits fichiers texte qui sont stockés sur votre navigateur ou le disque dur de votre ordinateur ou appareil mobile lorsque vous visitez une page web ou une application. Les cookies permettent à un site de reconnaître un utilisateur et de mémoriser ses préférences.
      </p>

      <h2>Comment utilisons-nous les cookies ?</h2>
      <p>Nous utilisons des cookies pour les finalités suivantes :</p>
      <ul>
        <li>
          <strong>Cookies essentiels :</strong> Ces cookies sont nécessaires au fonctionnement de notre site. Ils incluent, par exemple, les cookies qui vous permettent de vous connecter à des zones sécurisées de notre site. Sans ces cookies, les services que vous avez demandés ne peuvent pas être fournis.
        </li>
        <li>
          <strong>Cookies de performance et d'analyse :</strong> Ils nous permettent de reconnaître et de compter le nombre de visiteurs et de voir comment les visiteurs se déplacent sur notre site lorsqu'ils l'utilisent. Cela nous aide à améliorer le fonctionnement de notre site, par exemple, en veillant à ce que les utilisateurs trouvent facilement ce qu'ils cherchent. Nous utilisons Google Analytics à cette fin.
        </li>
        <li>
          <strong>Cookies de fonctionnalité :</strong> Ces cookies sont utilisés pour vous reconnaître lorsque vous revenez sur notre site. Cela nous permet de personnaliser notre contenu pour vous et de mémoriser vos préférences (par exemple, votre choix de langue ou de région).
        </li>
        <li>
          <strong>Cookies tiers :</strong> Nous utilisons des services tiers comme Firebase (pour l'authentification) et Stripe (pour les paiements). Ces services peuvent placer leurs propres cookies sur votre appareil. Nous n'avons aucun contrôle sur ces cookies tiers. Veuillez consulter les politiques de confidentialité de ces tiers pour plus d'informations.
        </li>
      </ul>

      <h2>Vos choix concernant les cookies</h2>
      <p>
        La plupart des navigateurs web acceptent automatiquement les cookies, mais vous pouvez généralement modifier les paramètres de votre navigateur pour refuser les cookies si vous le préférez. Si vous choisissez de refuser les cookies, vous ne pourrez peut-être pas profiter pleinement des fonctionnalités interactives de notre site.
      </p>
      <p>
        Vous pouvez en savoir plus sur la gestion des cookies sur les sites web d'information populaires comme AllAboutCookies.org.
      </p>

      <h2>Modifications de cette politique de cookies</h2>
      <p>
        Nous pouvons mettre à jour cette politique de cookies de temps à autre. Nous vous notifierons de tout changement en publiant la nouvelle politique de cookies sur cette page.
      </p>

      <h2>Nous contacter</h2>
      <p>
        Si vous avez des questions sur cette politique de cookies, veuillez nous contacter à l'adresse contact@woosenteur.fr.
      </p>
    </>
  );
};

export default CookiesPage;
