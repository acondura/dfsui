// src/app/page.tsx
import Link from 'next/link';

export const runtime = 'edge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      
      {/* HEADER */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-2xl font-extrabold text-blue-600 tracking-tight">
          DFS UI
        </div>
        <nav>
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors mr-6"
          >
            Dashboard
          </Link>
          <a 
            href="https://github.com/acondura/dfsui" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="container mx-auto px-6 pt-20 pb-24 text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          The Open-Source Interface for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            DataForSEO
          </span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop building internal tools from scratch. DFS UI is a lightning-fast, edge-cached dashboard for your SEO data. Bring your API keys or use our free hosted version.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
          >
            Go to Dashboard
          </Link>
          <a 
            href="https://github.com/acondura/dfsui"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 text-lg font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
            Star on GitHub
          </a>
        </div>
      </main>

      {/* FEATURE GRID */}
      <section className="bg-white border-t border-slate-200 py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Feature 1 */}
            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Edge Cached</h3>
              <p className="text-slate-600 leading-relaxed">
                Powered by Cloudflare. Never pay for the same API query twice. We cache your historical data at the edge for instant retrieval and zero additional cost.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zero-Trust Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Authentication is handled securely via Cloudflare Access. No passwords to manage, just secure OTP login straight to your isolated data environment.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Extensible Open Source</h3>
              <p className="text-slate-600 leading-relaxed">
                Fork it, modify it, host it yourself. DFS UI provides a clean Next.js foundation to build exactly the SEO tools your agency or business needs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      {/* HOW IT WORKS */}
      <section className="bg-slate-50 border-t border-slate-200 py-32">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center pb-6">
            <h3 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight pb-6">How to Get Started</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {/* Desktop Line */}
            <div className="hidden md:block absolute top-[1.25rem] left-[10%] right-[10%] h-[2px] bg-slate-200" />
            
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-4 relative z-10 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                1
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Access DFS UI</h4>
              <p className="text-base text-slate-500 leading-relaxed">
                Sign in securely to your workspace at <span className="text-blue-600 font-semibold">dfsui.com</span>. Magic link sent to email, no password needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-4 relative z-10 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                2
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Get API Keys</h4>
              <p className="text-base text-slate-500 leading-relaxed">
                Create an account at <span className="text-blue-600 font-semibold">DataForSEO.com</span>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-4 relative z-10 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                3
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Connect Account</h4>
              <p className="text-base text-slate-500 leading-relaxed">
                Input your credentials in the dashboard settings.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-4 relative z-10 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                4
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Scale Research</h4>
              <p className="text-base text-slate-500 leading-relaxed">
                Start running professional keyword research instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} DFS UI. An open-source project.</p>
        </div>
      </footer>

    </div>
  );
}