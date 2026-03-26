// src/app/dashboard/page.tsx
import { headers } from 'next/headers';
import { fetchWithKVCache } from '@/lib/dataforseo';

export default async function DashboardPage() {
  // 1. Await the headers to get the logged-in user's email from Cloudflare Access
  const headersList = await headers();
  const userEmail = headersList.get('Cf-Access-Authenticated-User-Email') || 'unknown@user.com';

  // 2. Fetch the API balance using the new cache key structure
  // e.g., "user@email.com:account:balance"
  let balance = null;
  try {
    const data = await fetchWithKVCache('appendix/user_data', {
      method: 'GET',
      email: userEmail,
      category: 'account',
      child: 'balance',
      cacheTtl: 3600 // Cache balance for 1 hour
    });
    
    balance = data?.tasks?.[0]?.result?.[0]?.money?.balance;
  } catch (error) {
    console.error("Failed to load budget:", error);
  }

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