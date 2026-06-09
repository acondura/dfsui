import { MetadataRoute } from 'next';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv } from '@/lib/auth';
import { articles } from '@/lib/articles';

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let env: CloudflareEnv | undefined;
  try {
    const context = getRequestContext() as { env: CloudflareEnv };
    env = context?.env;
  } catch (e) {
    // Fallback for local build/dev environments
  }

  const baseUrl = 'https://dfsui.com';

  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  ];

  if (!env || !env.dfsui) {
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
      {
        url: `${baseUrl}/keyword-research`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/keyword-research-tool-in-hindi`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      ...blogPages,
    ];
  }

  const raw = await env.dfsui.get('pseo:published');
  const published: string[] = raw ? JSON.parse(raw) : [];

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
    {
      url: `${baseUrl}/keyword-research`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/keyword-research-tool-in-hindi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPages,
    ...pseoPages,
  ];
}
