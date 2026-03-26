// src/app/dashboard/page.tsx
import { headers } from 'next/headers';
import { fetchWithKVCache } from '@/lib/dataforseo';
import { saveCredentials } from './actions';

// Tell Next.js to compile this for Cloudflare's Edge
export const runtime = 'edge';

export default async function DashboardPage() {
  // 1. Await the headers to get the logged-in user's email from Cloudflare Access
  const headersList = await headers();
  const userEmail = headersList.get('Cf-Access-Authenticated-User-Email') || 'unknown@user.com';

  let balance = null;
  let needsCredentials = false;

  // 2. Fetch the API balance using the cache key structure
  try {
    const data = await fetchWithKVCache('appendix/user_data', {
      method: 'GET',
      email: userEmail,
      category: 'account',
      child: 'balance',
      cacheTtl: 3600 // Cache balance for 1 hour
    });
    
    balance = data?.tasks?.[0]?.result?.[0]?.money?.balance;
  } catch (e) {
    // Safely cast the error to check its message without upsetting ESLint
    const error = e as Error;
    if (error.message === "MISSING_CREDENTIALS") {
      needsCredentials = true;
    } else {
      console.error("Failed to load budget:", error);
    }
  }

  // 3. Render the Onboarding UI if credentials are not found in KV
  if (needsCredentials) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your DataForSEO Account</h2>
        <p className="text-gray-600 mb-8">
          Welcome, {userEmail}! To start using DFS UI, you need to provide your DataForSEO API credentials. They will be stored securely in your isolated Edge cache.
        </p>
        
        {/* Wire the Server Action to the form */}
        <form action={saveCredentials} className="space-y-4 max-w-md mx-auto text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Login (Email)</label>
            <input type="text" name="login" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Password</label>
            <input type="password" name="password" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            Save Credentials
          </button>
        </form>
      </div>
    );
  }

  // 4. Render the standard Dashboard UI
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Welcome back, {userEmail}</h1>
      
      <div className="bg-gray-50 p-4 rounded border border-gray-100 flex justify-between items-center max-w-md">
        <span className="text-gray-600 font-medium">DataForSEO Available Budget:</span>
        <span className="text-2xl font-bold text-green-600">
          ${balance !== null ? balance.toFixed(2) : '---'}
        </span>
      </div>
      
      <p className="mt-6 text-sm text-gray-500">
        Select a tool from the sidebar to begin.
      </p>
    </div>
  );
}