// src/app/keyword-research/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Target, Zap, BarChart3, Search, CheckCircle2, ArrowRight, ShieldCheck, TrendingUp, Sparkles, LayoutPanelTop } from 'lucide-react';

export const runtime = 'edge';

export default function KeywordResearchLanding() {
  const steps = [
    {
      title: "Seed Discovery",
      desc: "Input your target niche or competitor URL. We pull raw data from DataForSEO Labs & Google Ads APIs for maximum accuracy.",
      icon: Search,
      color: "bg-blue-500"
    },
    {
      title: "Tactical Deep-Dive",
      desc: "Our 'Roadmap to #1' engine audits the top 10 competitors in real-time, checking their Title, H1, Meta, and URL optimization.",
      icon: Target,
      color: "bg-primary"
    },
    {
      title: "Identify the Gaps",
      desc: "We show you exactly which technical on-page elements your competitors are missing, giving you an immediate blueprint to outrank them.",
      icon: LayoutPanelTop,
      color: "bg-amber-500"
    },
    {
      title: "Execute & Dominate",
      desc: "Use the tactical roadmap to optimize your content. No more guessing. Just data-driven execution.",
      icon: Zap,
      color: "bg-indigo-500"
    }
  ];

  const advantages = [
    {
      title: "90% Cost Savings",
      desc: "Stop paying $150/mo for a suite you only use for keyword research. Bring your own API keys and pay only for what you use.",
      icon: TrendingUp
    },
    {
      title: "Real-Time SERP Analysis",
      desc: "While others use cached data from weeks ago, DFSUI audits the live SERP as it stands right now.",
      icon: Sparkles
    },
    {
      title: "Action-Oriented UI",
      desc: "We don't just give you a 'Difficulty' score. We give you a checklist of things to fix to take the #1 spot.",
      icon: BarChart3
    },
    {
      title: "Privacy First",
      desc: "Your search history and API keys are isolated and secure. We never sell your data or monitor your research.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-primary/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-primary">DFS</span>UI
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Home</Link>
            <Link href="#steps" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Process</Link>
            <Link href="#advantages" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Advantages</Link>
            <Link href="/dashboard" className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 animate-fade-in">
                <Zap size={14} className="fill-current" /> Next-Gen Keyword Research
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-8">
                Don't just research keywords. <br />
                <span className="text-primary">Own the SERP.</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed font-medium">
                DFSUI turns raw SEO data into a tactical roadmap to #1. Audit your competitors, find their technical weaknesses, and claim your spot at the top.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link 
                  href="/dashboard" 
                  className="w-full sm:w-auto px-10 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-base font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Start Ranking Now <ArrowRight size={18} />
                </Link>
                <Link 
                  href="#steps" 
                  className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-base font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
                >
                  See the Process
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(5,150,105,0.2)] border border-slate-200 dark:border-slate-800 animate-float">
                <Image 
                  src="/dashboard_mockup_seo_roadmap_1776494369292.png" 
                  alt="DFSUI Dashboard Mockup" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative Background Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[120px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="steps" className="py-32 bg-white dark:bg-slate-900/50 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">How It Works</h2>
            <p className="text-lg text-slate-500 font-medium">We've distilled years of SEO consulting expertise into a 4-step automated workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="group relative p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-primary transition-all">
                <div className={`w-14 h-14 ${step.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {step.desc}
                </p>
                <div className="absolute top-6 right-8 text-5xl font-black text-slate-200 dark:text-slate-700 opacity-50 group-hover:text-primary/20 transition-colors">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantage Section */}
      <section id="advantages" className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="lg:w-1/3">
              <div className="sticky top-32">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-8 leading-tight">Why the World's Best SEOs Choose <span className="text-primary">DFSUI.</span></h2>
                <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                  We didn't build just another keyword tool. We built a competitive intelligence platform that empowers you to win.
                </p>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm group"
                >
                  Explore the dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12">
              {advantages.map((adv, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-primary">
                    <adv.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight uppercase">{adv.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 max-w-5xl mx-auto px-6">
        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">Ready to stop guessing?</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Join thousands of data-driven marketers who use DFSUI to automate their keyword research and dominate the search results.
            </p>
            <Link 
              href="/dashboard" 
              className="px-12 py-6 bg-slate-950 text-white rounded-3xl text-lg font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
            >
              Get Started for Free <Zap size={20} className="fill-current" />
            </Link>
          </div>
          {/* Decorative background pulse */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
              <span className="text-primary">DFS</span>UI
            </Link>
            <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-slate-400">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <a href="https://github.com/acondura/dfsui" target="_blank" className="hover:text-primary transition-colors">GitHub</a>
              <Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
            </div>
            <p className="text-xs font-bold text-slate-400">© {new Date().getFullYear()} DFS UI. Built for the modern SEO.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
