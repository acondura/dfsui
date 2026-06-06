// src/app/keyword-research-tool-in-hindi/layout.tsx
import { Metadata } from 'next';

// Configure the runtime for Cloudflare Workers compatibility
export const runtime = 'edge';

// SEO Meta details for the Hindi Keyword Research page
export const metadata: Metadata = {
  title: 'Keyword Research Tool in Hindi - हिंदी कीवर्ड रिसर्च टूल | DFSUI',
  description: 'हिंदी में सर्वश्रेष्ठ और सबसे सटीक कीवर्ड रिसर्च टूल। DataForSEO API द्वारा संचालित, प्रतिस्पर्धी विश्लेषण, सर्च वॉल्यूम, और Google रैंकिंग रोडमैप प्राप्त करें।',
  keywords: ['keyword research tool in hindi', 'हिंदी कीवर्ड रिसर्च टूल', 'seo keyword tool hindi', 'dataforseo hindi tool'],
};

export default function HindiKeywordResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
