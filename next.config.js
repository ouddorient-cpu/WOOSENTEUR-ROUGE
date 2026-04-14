

try {
  require('dotenv').config();
} catch (e) {
  console.warn('dotenv not found');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Externalise les packages serveur qui utilisent des require() dynamiques
    // incompatibles avec le bundler Webpack de Next.js
    serverComponentsExternalPackages: [
      'firebase-admin',
      'genkit',
      '@genkit-ai/google-genai',
      '@genkit-ai/googleai',
      '@opentelemetry/sdk-node',
      '@opentelemetry/instrumentation',
      '@opentelemetry/exporter-jaeger',
      'require-in-the-middle',
      'shimmer',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Genkit dépend de @opentelemetry/exporter-jaeger qui n'est pas installé.
      // On l'alias vers un module vide pour éviter l'erreur de build Webpack.
      config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/exporter-jaeger': false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.replicate.delivery',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.woosenteur.fr',
          },
        ],
        destination: 'https://woosenteur.fr/:path*',
        permanent: true,
      },
    ];
  },
  trailingSlash: true,
  env: {
    // All public keys are now loaded from .env.local (gitignored)
    // Firebase Console App Hosting > Environment Variables for production
  }
};

module.exports = nextConfig;
