'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv } from '@/lib/auth';
import { sendEmailSES } from '@/lib/aws-ses';
import { z } from 'zod';

const emailSchema = z.string().email().toLowerCase().trim();

export async function sendMagicLink(email: string): Promise<{ error?: string }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { error: 'Enter a valid email address.' };
  }
  const safeEmail = parsed.data;

  const { env } = getRequestContext() as { env: CloudflareEnv };

  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_REGION) {
    return { error: 'Email service not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION in Cloudflare Pages env vars.' };
  }

  // 64-char hex token — cryptographically secure
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Store magic link token in KV — single use, expires in 15 minutes
  await env.dfsui.put(
    `magic-link:${token}`,
    JSON.stringify({ email: safeEmail }),
    { expirationTtl: 900 }
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dfsui.com';
  const verifyUrl = `${siteUrl}/auth/verify?token=${token}`;

  const result = await sendEmailSES(
    {
      AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: env.AWS_REGION,
      EMAIL_FROM: env.EMAIL_FROM,
    },
    safeEmail,
    'Your DFSUI sign-in link',
    `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:32px;border:1px solid #e4e4e7;border-radius:16px;background:#fff">
        <h2 style="font-size:20px;font-weight:900;letter-spacing:-0.5px;margin:0 0 8px">Sign in to DFSUI</h2>
        <p style="color:#71717a;font-size:14px;margin:0 0 24px">Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#059669;color:#fff;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;padding:14px 28px;border-radius:10px;text-decoration:none">
          Sign in to DFSUI
        </a>
        <p style="color:#a1a1aa;font-size:11px;margin:24px 0 0">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  );

  return result;
}
