import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Larder & Leaf',
    short_name: 'Larder & Leaf',
    description: 'The Intelligent Pantry',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f7f6',
    theme_color: '#006949',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
