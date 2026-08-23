// Minimal AWS SES v2 sender using SigV4 — no SDK, only Web Crypto (edge-compatible).

interface SesEnv {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  EMAIL_FROM?: string;
}

// HMAC-SHA256 using Web Crypto
async function hmac(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data));
}

async function sha256hex(data: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return toHex(hash);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function signingKey(secret: string, date: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate    = await hmac(new TextEncoder().encode(`AWS4${secret}`).buffer as ArrayBuffer, date);
  const kRegion  = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

/**
 * Returns a fetch-ready headers object with the AWS4 Authorization header added.
 */
async function signedHeaders(
  method: string,
  url: string,
  extraHeaders: Record<string, string>,
  body: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string,
): Promise<Record<string, string>> {
  const parsed    = new URL(url);
  const now       = new Date();
  // Format: 20240101T000000Z
  const amzDate   = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);

  const allHeaders: Record<string, string> = {
    ...extraHeaders,
    host: parsed.host,
    'x-amz-date': amzDate,
  };

  const sortedKeys      = Object.keys(allHeaders).sort();
  const canonicalHdrs   = sortedKeys.map(k => `${k}:${allHeaders[k].trim()}`).join('\n') + '\n';
  const signedHdrsList  = sortedKeys.join(';');
  const payloadHash     = await sha256hex(body);

  const canonicalRequest = [
    method,
    parsed.pathname,
    parsed.search.replace(/^\?/, ''),
    canonicalHdrs,
    signedHdrsList,
    payloadHash,
  ].join('\n');

  const credScope   = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credScope,
    await sha256hex(canonicalRequest),
  ].join('\n');

  const key       = await signingKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmac(key, stringToSign));

  return {
    ...allHeaders,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credScope}, SignedHeaders=${signedHdrsList}, Signature=${signature}`,
  };
}

/**
 * Sends an email via AWS SES v2. Returns an error string on failure.
 */
export async function sendEmailSES(
  env: SesEnv,
  to: string,
  subject: string,
  html: string,
): Promise<{ error?: string }> {
  const region   = env.AWS_REGION;
  const from     = env.EMAIL_FROM || `DFSUI <noreply@dfsui.com>`;
  const endpoint = `https://email.${region}.amazonaws.com/v2/email/outbound-emails`;

  const body = JSON.stringify({
    FromEmailAddress: from,
    Destination: { ToAddresses: [to] },
    Content: {
      Simple: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    },
  });

  const headers = await signedHeaders(
    'POST',
    endpoint,
    { 'content-type': 'application/json' },
    body,
    env.AWS_ACCESS_KEY_ID,
    env.AWS_SECRET_ACCESS_KEY,
    region,
    'ses',
  );

  const res = await fetch(endpoint, { method: 'POST', headers, body });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[SES] ${res.status}: ${text}`);
    return { error: 'Failed to send email. Please try again.' };
  }

  return {};
}
