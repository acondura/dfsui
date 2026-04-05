import type { NextConfig } from "next";

// Fix: Use .then() instead of 'await' to prevent the ReferenceError
if (process.env.NODE_ENV === 'development') {
  import('@cloudflare/next-on-pages/next-dev').then(({ setupDevPlatform }) => {
    setupDevPlatform();
  }).catch(console.error);
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'dfsui.pages.dev',
          },
        ],
        destination: 'https://dfsui.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;