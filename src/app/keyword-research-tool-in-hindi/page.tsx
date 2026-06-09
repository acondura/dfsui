// src/app/keyword-research-tool-in-hindi/page.tsx
import React from 'react';
import Link from 'next/link';
import { 
  Zap, TrendingUp, Sparkles, ArrowRight, 
  ShieldCheck, BarChart3 
} from 'lucide-react';
import { 
  HindiKeywordResearchDemo, 
  HindiKeywordResearchFaq 
} from '@/components/HindiKeywordResearchClient';
import type { Metadata } from 'next';

export const runtime = 'edge';

// Localized SEO Metadata for Hindi search terms (e.g. keyword research tool in hindi / हिंदी कीवर्ड रिसर्च टूल)
export const metadata: Metadata = {
  title: "Hindi Keyword Research Tool: हिंदी कीवर्ड रिसर्च टूल | DFSUI",
  description: "गूगल रैंकिंग में पहले स्थान के लिए रीयल-टाइम प्रतिस्पर्धी कीवर्ड विश्लेषण। DFSUI टूल की मदद से खोजें सबसे आसान कीवर्ड्स।",
  alternates: {
    canonical: '/keyword-research-tool-in-hindi',
  }
};

export default function HindiKeywordResearchPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary/20 overflow-x-hidden">
      
      {/* Background decoration orbs matching homepage */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform">
              <Zap size={22} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
              DFS UI
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">
              होम
            </Link>
            <Link 
              href="/dashboard" 
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-105 transition-all"
            >
              डैशबोर्ड
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
            <Sparkles size={14} className="fill-current text-primary" /> हिंदी कीवर्ड रिसर्च टूल - 100% सटीक
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] text-zinc-950 dark:text-white mb-6">
            कीवर्ड्स को सिर्फ खोजें नहीं, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-emerald-500 to-indigo-400">
              SERP पर राज करें।
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            DFSUI रॉ डेटा को ऑन-पेज एक्शन प्लान में बदलता है। अपने प्रतिस्पर्धियों (Competitors) की खामियां ढूंढें और रीयल-टाइम SERP ऑडिट के साथ Google रैंकिंग में पहला स्थान हासिल करें।
          </p>
        </div>

        {/* INTERACTIVE DEMO (CLIENT COMPONENT) */}
        <HindiKeywordResearchDemo />

        {/* 4-STEP PROCESS SECTION */}
        <section id="process" className="py-20 border-t border-zinc-200 dark:border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-950 dark:text-white mb-4">
              हमारा टूल कैसे काम करता है?
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              4 आसान चरणों में रीयल-टाइम डेटा प्राप्त करें और अपने प्रतिस्पर्धियों को पछाड़ें
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "मुख्य कीवर्ड खोजें",
                desc: "अपना पसंदीदा विषय या कीवर्ड दर्ज करें। हम सीधे DataForSEO Labs और Google Ads API से रियल डेटा लाते हैं।"
              },
              {
                step: "02",
                title: "SERP एनालिसिस",
                desc: "हम तुरंत Google के टॉप 10 प्रतिस्पर्धियों का ऑडिट करते हैं ताकि उनके ऑन-पेज कंटेंट का विश्लेषण किया जा सके।"
              },
              {
                step: "03",
                title: "कमियां उजागर करें",
                desc: "हम आपको बताते हैं कि प्रतिस्पर्धी वेबसाइटें किस जगह टाइटल, यूआरएल या डिस्क्रिप्शन में कीवर्ड डालना भूल गईं।"
              },
              {
                step: "04",
                title: "नंबर #1 पर रैंक करें",
                desc: "कमियों को ठीक करने के लिए हमारे रीयल-टाइम सुझाव (Roadmap) का पालन करें और अपनी रैंक बढ़ाएं।"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl relative group hover:border-primary transition-all">
                <span className="text-4xl font-black text-zinc-200 dark:text-zinc-800 block mb-6 group-hover:text-primary/20 transition-colors">
                  {item.step}
                </span>
                <h4 className="text-lg font-black uppercase text-zinc-950 dark:text-white tracking-tight mb-3">
                  {item.title}
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CORE ADVANTAGES SECTION */}
        <section id="advantages" className="py-20">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3">
              <h2 className="text-3xl md:text-5xl font-black text-zinc-950 dark:text-white leading-tight mb-6">
                आपको DFSUI का उपयोग क्यों करना चाहिए?
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">
                मार्केट में उपलब्ध अन्य महंगे टूल्स के विपरीत, हम केवल सटीक और व्यावहारिक डेटा देने पर ध्यान केंद्रित करते हैं।
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm group"
              >
                डैशबोर्ड खोलें <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                {
                  title: "90% तक की भारी बचत",
                  desc: "महीने के $150 देने के बजाय, अपने स्वयं के API कीज़ लाएं और केवल उतनी ही राशि का भुगतान करें जिसका आप उपयोग करते हैं।",
                  icon: TrendingUp
                },
                {
                  title: "रीयल-टाइम Google डेटा",
                  desc: "कई अन्य टूल्स सप्ताह पुराना डेटा दिखाते हैं। DFSUI तुरंत वर्तमान SERP का विश्लेषण कर लाइव जानकारी दिखाता है।",
                  icon: Sparkles
                },
                {
                  title: "एक्शन-ओरिएंटेड चेकलिस्ट",
                  desc: "हम सिर्फ स्कोर नहीं देते, बल्कि हम आपको एक चेकलिस्ट प्रदान करते हैं जिसे पूरा करके आप सीधे पहले पायदान पर जा सकते हैं।",
                  icon: BarChart3
                },
                {
                  title: "सुरक्षित एवं गोपनीय",
                  desc: "आपका सर्च इतिहास और एपीआई की डेटा सुरक्षित एन्क्रिप्टेड है। हम आपके प्रतिस्पर्धी डेटा को कभी लीक नहीं करते।",
                  icon: ShieldCheck
                }
              ].map((adv, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <adv.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-zinc-950 dark:text-white mb-2 uppercase tracking-tight">
                      {adv.title}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      {adv.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACCORDION FAQ SECTION (CLIENT COMPONENT) */}
        <section id="faq" className="py-20 border-t border-zinc-200 dark:border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-950 dark:text-white mb-4">
              अक्सर पूछे जाने वाले प्रश्न (FAQ)
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              कीवर्ड रिसर्च के संबंध में सामान्य प्रश्नों के त्वरित उत्तर
            </p>
          </div>

          <HindiKeywordResearchFaq />
        </section>

        {/* CTA CARD */}
        <section className="py-16">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                क्या आप अपनी रैंकिंग में सुधार करने के लिए तैयार हैं?
              </h2>
              <p className="text-lg md:text-xl text-zinc-800 dark:text-white/80 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                आज ही DFSUI डैशबोर्ड पर साइन इन करें और कीवर्ड रिसर्च को स्वचालित बनाकर Google के नंबर #1 स्थान पर कब्जा करें।
              </p>
              <Link 
                href="/dashboard"
                className="px-10 py-5 bg-zinc-950 text-white rounded-2xl text-base font-black uppercase tracking-[0.15em] shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                मुफ़्त में शुरुआत करें <Zap size={18} className="fill-current text-primary" />
              </Link>
            </div>
            {/* Background elements for aesthetic wow effect */}
            <div className="absolute top-0 right-0 -mr-36 -mt-36 w-80 h-80 bg-white/10 rounded-full blur-[90px]" />
            <div className="absolute bottom-0 left-0 -ml-36 -mb-36 w-80 h-80 bg-white/10 rounded-full blur-[90px]" />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-primary fill-current" />
            <span className="text-lg font-black uppercase tracking-widest italic">DFS UI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-black uppercase tracking-widest text-zinc-400">
            <Link href="/keyword-research-tool-in-hindi" className="hover:text-primary transition-colors">हिंदी में कीवर्ड रिसर्च टूल</Link>
            <a href="https://github.com/acondura/dfsui" target="_blank" className="hover:text-primary transition-colors">Github</a>
            <Link href="/disclaimer" className="hover:text-primary transition-colors">डिस्क्लेमर</Link>
          </div>
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600">
            © {new Date().getFullYear()} DFS UI Project. सभी अधिकार सुरक्षित।
          </p>
        </div>
      </footer>
    </div>
  );
}
