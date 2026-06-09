// src/components/HindiKeywordResearchClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Target, 
  ArrowRight, HelpCircle, ChevronDown, Check, 
  RefreshCw, Layers 
} from 'lucide-react';

// Suggested keywords in Hindi to help users test the interactive mockup.
const testKeywords = [
  'ब्लॉगिंग से पैसे कैसे कमाए',
  'यूट्यूब चैनल कैसे बनाएं',
  'SEO क्या है और कैसे करें',
  'ऑनलाइन पैसे कमाने के तरीके'
];

// Steps for simulated analysis loading screen.
const analysisSteps = [
  'कीवर्ड वॉल्यूम और CPC डेटा लोड हो रहा है...',
  'शीर्ष 10 Google SERP प्रतिस्पर्धियों की सूची तैयार की जा रही है...',
  'शीर्ष साइटों के Title, H1 और Meta Description का रीयल-टाइम ऑडिट चल रहा है...',
  'रैंकिंग रोडमैप और कीवर्ड अवसरों की गणना की जा रही है...'
];

/**
 * Interactive Mockup Demo Component for the Hindi Keyword Research Landing Page.
 * Implements client-side input state, timer simulation for audit steps, and mock results.
 */
export function HindiKeywordResearchDemo() {
  const [keywordInput, setKeywordInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Simulated analysis step incrementer
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

  // Handler to trigger the audit simulation
  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowResults(false);
  };

  // Select a preset keyword to run the simulation
  const handleSelectPreset = (kw: string) => {
    setKeywordInput(kw);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setShowResults(false);
  };

  return (
    <section id="demo" className="max-w-3xl mx-auto mb-28">
      <div className="p-8 md:p-10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/60 rounded-[2.5rem] shadow-2xl">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-zinc-950 dark:text-white uppercase tracking-tight">
          <Layers className="text-primary" size={20} /> लाइव कीवर्ड टूल का अनुभव करें
        </h3>
        
        <form onSubmit={handleStartAnalysis} className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
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
          <div className="p-6 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 animate-pulse">
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
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 bg-zinc-50 dark:bg-zinc-950/85 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
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
  );
}

interface FaqItem {
  q: string;
  a: string;
}

const faqItems: FaqItem[] = [
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
];

/**
 * Interactive Accordion FAQ Component for the Hindi Keyword Research Landing Page.
 */
export function HindiKeywordResearchFaq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqItems.map((faq, idx) => {
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
  );
}
