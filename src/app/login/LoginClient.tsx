'use client';

import { useState, useTransition } from 'react';
import { sendMagicLink } from './actions';

interface Props {
  initialError?: string;
}

export default function LoginClient({ initialError }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await sendMagicLink(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">DFSUI</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your dashboard</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              {/* Mail icon */}
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-base">Check your email</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a sign-in link to <strong className="text-foreground">{email}</strong>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Link expires in 15 minutes. Check your spam folder if you don&apos;t see it.</p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending || !email}
                className="w-full bg-primary text-white font-black uppercase tracking-widest text-xs px-6 py-4 rounded-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? 'Sending...' : 'Send Sign-in Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
