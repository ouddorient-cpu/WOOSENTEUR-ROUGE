
import { MetadataRoute } from 'next';
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Woosenteur v2 AI',
    short_name: 'Woosenteur v2',
    description: 'Générez des fiches produits SEO pour tout type de produit en quelques secondes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#3A0F6C',
    theme_color: '#6C2BB8',
    icons: [
      {
        src: 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544331/Gemini_Generated_Image_8vt1oa8vt1oa8vt1__1_-removebg-preview_slimrt.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://res.cloudinary.com/db2ljqpdt/image/upload/v1776544331/Gemini_Generated_Image_8vt1oa8vt1oa8vt1__1_-removebg-preview_slimrt.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
