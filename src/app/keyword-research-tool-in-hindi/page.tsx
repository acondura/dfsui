// src/app/keyword-research-tool-in-hindi/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Zap, Target, BarChart3, ShieldCheck, 
  Sparkles, TrendingUp, ArrowRight, HelpCircle, 
  ChevronDown, Check, RefreshCw, Layers 
} from 'lucide-react';

// Suggested keywords in Hindi to help users test (defined outside to avoid react hook dependencies)
const testKeywords = [
  'ब्लॉगिंग से पैसे कैसे कमाए',
  'यूट्यूब चैनल कैसे बनाएं',
  'SEO क्या है और कैसे करें',
  'ऑनलाइन पैसे कमाने के तरीके'
];

// Steps for simulated analysis loading screen (defined outside to avoid react hook dependencies)
const analysisSteps = [
  'कीवर्ड वॉल्यूम और CPC डेटा लोड हो रहा है...',
  'शीर्ष 10 Google SERP प्रतिस्पर्धियों की सूची तैयार की जा रही है...',
  'शीर्ष साइटों के Title, H1 और Meta Description का रीयल-टाइम ऑडिट चल रहा है...',
  'रैंकिंग रोडमैप और कीवर्ड अवसरों की गणना की जा रही है...'
];

export default function HindiKeywordResearchPage() {
  // Interactive mockup state variables
  const [keywordInput, setKeywordInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Simulated analysis execution
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnalyzing) {
      if (analysisStep < analysisSteps.length) {
        timer = setTimeout(() => {
          setAnalysisStep(prev => prev + 1);
        }, 1200);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAnalyzing(false);
        setShowResults(true);
      }
    }
    return () => clearTimeout(timer);
  }, [isAnalyzing, analysisStep]);

  // Handler to trigger mockup analysis
  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowResults(false);
  };

  // Select a preset keyword
  const handleSelectPreset = (kw: string) => {
    setKeywordInput(kw);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowResults(false);
  };

  // Toggle FAQ items
  const toggleFaq = (index: number) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

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

        {/* INTERACTIVE DEMO CONTAINER (GLASSMORPHISM) */}
        <section id="demo" className="max-w-3xl mx-auto mb-28">
          <div className="p-8 md:p-10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/60 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-zinc-950 dark:text-white uppercase tracking-tight">
              <Layers className="text-primary" size={20} /> लाइव कीवर्ड टूल का अनुभव करें
            </h3>
            
            <form onSubmit={handleStartAnalysis} className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -tranzinc-y-1/2 text-zinc-400" size={18} />
                <input 
                  id="keyword-input"
                  type="text" 
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="कोई भी कीवर्ड टाइप करें (उदा: ब्लॉगिंग से पैसे कैसे कमाए)"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-base font-medium outline-none focus:border-primary/50 transition-all dark:text-white"
                />
              </div>
              <button 
                id="analyze-btn"
                type="submit"
                disabled={isAnalyzing}
                className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : null}
                विश्लेषण करें
              </button>
            </form>

            {/* PRESET QUICK CLICKABLE BUTTONS */}
            <div className="mb-8">
              <p className="text-xs font-black uppercase text-zinc-400 mb-3 tracking-widest">त्वरित परीक्षण के लिए चुनें:</p>
              <div className="flex flex-wrap gap-2">
                {testKeywords.map((kw, idx) => (
                  <button
                    key={idx}
                    id={`preset-kw-${idx}`}
                    onClick={() => handleSelectPreset(kw)}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-transparent dark:text-zinc-300 rounded-xl text-xs font-bold transition-all text-left"
                  >
                    🔍 {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* SIMULATED LOADER */}
            {isAnalyzing && (
              <div className="p-6 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="animate-spin text-primary" size={20} />
                  <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300">डेटा प्रोसेस किया जा रहा है...</span>
                </div>
                <div className="space-y-3">
                  {analysisSteps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs font-medium flex items-start gap-2 transition-opacity duration-300 ${
                        analysisStep >= idx ? 'opacity-100 text-zinc-800 dark:text-zinc-200' : 'opacity-30'
                      }`}
                    >
                      <span className={analysisStep > idx ? 'text-primary' : 'text-zinc-400'}>
                        {analysisStep > idx ? '✓' : '•'}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIMULATED RESULTS CARD */}
            {showResults && !isAnalyzing && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">परिणाम कीवर्ड</span>
                    <h4 className="text-lg font-black dark:text-white">&quot;{keywordInput}&quot;</h4>
                  </div>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold uppercase">
                    रीयल-टाइम डेटा
                  </span>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-400 block mb-1">मंथली वॉल्यूम</span>
                    <span className="text-base md:text-xl font-black text-zinc-900 dark:text-white font-mono">14,800</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-400 block mb-1">औसत CPC</span>
                    <span className="text-base md:text-xl font-black text-zinc-900 dark:text-white font-mono">$0.42</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-400 block mb-1">प्रतिस्पर्धा</span>
                    <span className="text-base md:text-xl font-black text-amber-500 dark:text-amber-400 font-mono">Medium</span>
                  </div>
                </div>

                {/* MOCK SERP COMPETITOR AUDIT */}
                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-2 flex items-center gap-1.5">
                    <Target size={14} /> शीर्ष प्रतिस्पर्धी ऑन-पेज ऑडिट (SERP Roadmap)
                  </h5>
                  
                  <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                      <span className="font-bold text-zinc-500">1. www.hindimehelp.com/...</span>
                      <span className="text-emerald-500 font-bold">100% अनुकूलित</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 md:grid-cols-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-primary" /> Title
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-primary" /> URL
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-primary" /> H1 Tag
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-primary" /> Description
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
                      <span className="font-bold text-zinc-500">2. www.deepawali.co.in/...</span>
                      <span className="text-amber-500 font-bold">75% अनुकूलित</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 md:grid-cols-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-primary" /> Title
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-500 font-black">✗</span> URL
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-primary" /> H1 Tag
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-primary" /> Description
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
                  >
                    पूर्ण रिपोर्ट डैशबोर्ड पर देखें <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

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
                डैशबोर्ड खोलें <ArrowRight size={16} className="group-hover:tranzinc-x-1 transition-transform" />
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

        {/* ACCORDION FAQ SECTION */}
        <section id="faq" className="py-20 border-t border-zinc-200 dark:border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-zinc-950 dark:text-white mb-4">
              अक्सर पूछे जाने वाले प्रश्न (FAQ)
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              कीवर्ड रिसर्च के संबंध में सामान्य प्रश्नों के त्वरित उत्तर
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "कीवर्ड रिसर्च (Keyword Research) क्या है और यह क्यों महत्वपूर्ण है?",
                a: "कीवर्ड रिसर्च उन शब्दों या वाक्यों (Keywords) को खोजने की प्रक्रिया है जिन्हें लोग सर्च इंजन जैसे Google में टाइप करते हैं। सही कीवर्ड खोजने से आपकी वेबसाइट पर सही प्रकार का ऑर्गैनिक ट्रैफ़िक आता है जो आपके ब्लॉग या व्यवसाय के लिए मूल्यवान होता है।"
              },
              {
                q: "DFSUI टूल प्रतिस्पर्धा का विश्लेषण कैसे करता है?",
                a: "हम केवल एक सामान्य कठिनाई (Difficulty) स्कोर नहीं दिखाते। हमारा सिस्टम रीयल-टाइम में Google SERP के शीर्ष 10 परिणामों की जांच करता है। हम देखते हैं कि क्या वे वेबसाइटें अपने मुख्य कीवर्ड को URL, Title, Heading 1, और Meta Description में प्रयोग कर रही हैं या नहीं, जिससे आपको सीधा रोडमैप मिलता है।"
              },
              {
                q: "क्या यह टूल हिंदी ब्लॉगर्स के लिए उपयोगी है?",
                a: "हाँ, बिल्कुल! यह टूल विशेष रूप से हिंदी (Devanagari) और अन्य स्थानीय भाषाओं के कीवर्ड्स को रीयल-टाइम प्रोसेस करने के लिए डिज़ाइन किया गया है। आप भारत और वैश्विक स्तर पर हिंदी में हो रहे सर्च ट्रेंड्स और वॉल्यूम का पता लगा सकते हैं।"
              },
              {
                q: "क्या DFSUI का उपयोग करने के लिए शुल्क देना होगा?",
                a: "DFSUI एक ओपन-सोर्स आर्किटेक्चर पर काम करता है जहां आप अपनी API कीज़ का उपयोग करते हैं। इसका मतलब है कि आप सीधे डेटा प्रदाता (DataForSEO) को भुगतान करते हैं और बिचौलियों के भारी शुल्क से बचते हैं, जिससे आपकी लागत 90% तक कम हो जाती है।"
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    id={`faq-btn-${idx}`}
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-black text-sm md:text-base text-zinc-900 dark:text-white uppercase tracking-tight"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle size={18} className="text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA CARD */}
        <section className="py-16">
          <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                क्या आप अपनी रैंकिंग में सुधार करने के लिए तैयार हैं?
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
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
