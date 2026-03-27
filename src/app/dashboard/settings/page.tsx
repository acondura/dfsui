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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage your DataForSEO API integration and local storage.</p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
            
            <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className={`w-3 h-3 rounded-full ${hasKeys ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {hasKeys ? 'Connected to DataForSEO' : 'No API Keys Found'}
                </p>
                <p className="text-xs text-slate-500">
                  Linked to identity: {userEmail}
                </p>
              </div>
            </div>

            <form action={saveCredentials} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Update API Login</label>
                <input 
                  type="text" 
                  name="login" 
                  placeholder="New API Login"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Update API Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Update Keys
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-500 mb-6">
              Removing your keys will immediately stop all SEO tools from working and clear your session data from the Edge.
            </p>
            
            <form action={deleteCredentials}>
              <button 
                type="submit" 
                className="px-4 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
                onClick={(e) => { if(!confirm("Are you sure you want to disconnect?")) e.preventDefault(); }}
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