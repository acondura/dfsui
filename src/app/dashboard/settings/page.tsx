// src/app/dashboard/settings/page.tsx
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { deleteCredentials } from './actions';
import { saveCredentials } from '../actions'; // Reuse the logic we built

export const runtime = 'edge';

export default async function SettingsPage() {
  const headersList = await headers();
  const userEmail = headersList.get('Cf-Access-Authenticated-User-Email') || 'unknown@user.com';
  
  const { env } = getRequestContext();
  const credentialsKey = `${userEmail}:settings:credentials`;
  const hasKeys = await env.dfsui.get(credentialsKey);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Manage your DataForSEO API integration and local storage.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">API Configuration</h2>
            
            <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className={`w-3 h-3 rounded-full ${hasKeys ? 'bg-green-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {hasKeys ? 'Connected to DataForSEO' : 'No API Keys Found'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Linked to identity: {userEmail}
                </p>
              </div>
            </div>

            <form action={saveCredentials} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Update API Login
                </label>
                <input 
                  type="text" 
                  name="login" 
                  placeholder="New API Login"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Update API Password
                </label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Update Keys
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden transition-colors">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Removing your keys will immediately stop all SEO tools from working and clear your session data from the Edge.
            </p>
            
            <form action={deleteCredentials}>
              <button 
                type="submit" 
                className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                // No changes needed here, just ensuring dark classes match
              >
                Disconnect & Delete Keys
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}