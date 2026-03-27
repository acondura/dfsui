import type { NextConfig } from "next";

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
        permanent: true, // This triggers the SEO-friendly 301 redirect
      },
    ];
  },
};

export default nextConfig;
