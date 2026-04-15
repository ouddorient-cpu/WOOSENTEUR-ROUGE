const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>WooSenteur - Server Check</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .success { color: green; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>WooSenteur - Server Check</h1>
        <p class="success">✅ Serveur Node.js démarré avec succès!</p>
        <p>Cette page confirme que Node.js fonctionne correctement sur votre système.</p>
        <p>Pour lancer le projet Next.js complet, les dépendances doivent être installées et corrigées.</p>
        <hr>
        <h3>Détails du projet:</h3>
        <pre>
Nom: WooSenteur
Type: Application Next.js + Firebase
Fonctionnalité: Génération de fiches produits optimisées SEO pour WooCommerce
        </pre>
      </body>
    </html>
  `);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});