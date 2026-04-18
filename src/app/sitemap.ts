import { MetadataRoute } from 'next';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv } from '@/lib/auth';

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let env: CloudflareEnv;
  try {
    const context = getRequestContext() as { env: CloudflareEnv };
    env = context.env;
  } catch (e) {
    // Fallback for local build time if necessary
    return [
      {
        url: 'https://dfsui.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }

  const raw = await env.dfsui.get('pseo:published');
  const published: string[] = raw ? JSON.parse(raw) : [];

  const baseUrl = 'https://dfsui.com';

  const pseoPages: MetadataRoute.Sitemap = published.map((keyword) => {
    const slug = keyword.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return {
      url: `${baseUrl}/analysis/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...pseoPages,
  ];
}
