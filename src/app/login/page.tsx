import LoginClient from './LoginClient';
import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'Sign in — DFSUI',
  robots: { index: false },
};

// Error messages for failed verify attempts
const errorMessages: Record<string, string> = {
  expired: 'This sign-in link has expired. Please request a new one.',
  invalid: 'This sign-in link is invalid or has already been used.',
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? (errorMessages[error] || 'Something went wrong. Please try again.') : undefined;
  return <LoginClient initialError={errorMessage} />;
}
