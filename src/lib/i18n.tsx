'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = string;

interface Dictionary {
  [key: string]: string;
}

const localDictionaries: { [lang: string]: Dictionary } = {
  en: {
    dashboard: 'Dashboard',
    keywords: 'Keywords',
    settings: 'Settings',
    sign_out: 'Sign Out',
    workspace: 'Workspace',
    search: 'Search',
    language: 'Language',
    location: 'Location',
    analyze: 'Analyze',
    roadmap: 'Roadmap to #1 Spot',
    winning_potential: 'Winning Potential',
    traffic_potential: 'Traffic Potential',
    serp_audit: 'SERP Audit',
    avg_optimization: 'Avg. Optimization',
    disclaimer: 'Disclaimer',
    balance: 'Balance',
    research: 'Research',
    seed_keyword: 'Seed keyword...',
    api_source: 'API Source',
    method: 'Method',
    search_engine: 'Search Engine',
    recent_queries: 'Recent Queries',
    keyword: 'Keyword',
    intent: 'Intent',
    volume: 'Volume',
    trend: 'Trend',
    cpc: 'CPC',
    audit: 'Audit',
    action: 'Action',
    hide: 'Hide',
    peak: 'Peak',
    keyword_research: 'Keyword Research',
    no_results_found: 'No Results Found',
    back_to_history: 'Back to History',
    retry_in_live_mode: 'Retry in LIVE Mode',
    querying_dataforseo: 'Querying DataForSEO...',
    back: 'Back',
    refresh_from_api: 'Refresh from API',
    page: 'Page',
    of: 'of',
    prev: 'Prev',
    next: 'Next',
    no_recent_queries: 'No recent queries',
    start_research_to_build_history: 'Start your research above to build history',
    source: 'Source',
    engine: 'Engine',
    personal: 'Personal',
    ideas: 'Ideas'
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    keywords: 'कीवर्ड्स',
    settings: 'सेटिंग्स',
    sign_out: 'साइन आउट',
    workspace: 'कार्यस्थान',
    search: 'खोजें',
    language: 'भाषा',
    location: 'स्थान',
    analyze: 'विश्लेषण करें',
    roadmap: '#1 स्थान का रोडमैप',
    winning_potential: 'जीतने की संभावना',
    traffic_potential: 'ट्रैफिक संभावना',
    serp_audit: 'SERP ऑडिट',
    avg_optimization: 'औसत अनुकूलन',
    disclaimer: 'अस्वीकरण',
    balance: 'बैलेंस',
    research: 'अनुसंधान',
    seed_keyword: 'बीज कीवर्ड...',
    api_source: 'API स्रोत',
    method: 'तरीका',
    search_engine: 'सर्च इंजन',
    recent_queries: 'हाल के प्रश्न',
    keyword: 'कीवर्ड',
    intent: 'इरादा',
    volume: 'वॉल्यूम',
    trend: 'ट्रेंड',
    cpc: 'CPC',
    audit: 'ऑडिट',
    action: 'कार्रवाई',
    hide: 'छिपाएं',
    peak: 'पीक',
    keyword_research: 'कीवर्ड अनुसंधान',
    no_results_found: 'कोई परिणाम नहीं मिला',
    back_to_history: 'इतिहास पर वापस जाएं',
    retry_in_live_mode: 'LIVE मोड में पुनः प्रयास करें',
    querying_dataforseo: 'DataForSEO से पूछताछ की जा रही है...',
    back: 'पीछे',
    refresh_from_api: 'API से रिफ्रेश करें',
    page: 'पृष्ठ',
    of: 'का',
    prev: 'पिछला',
    next: 'अगला',
    no_recent_queries: 'कोई हालिया प्रश्न नहीं',
    start_research_to_build_history: 'इतिहास बनाने के लिए ऊपर अपना शोध शुरू करें',
    source: 'स्रोत',
    engine: 'इंजन',
    personal: 'व्यक्तिगत',
    ideas: 'विचार'
  },
  ro: {
    dashboard: 'Panou',
    keywords: 'Cuvinte Cheie',
    settings: 'Setări',
    sign_out: 'Deconectare',
    workspace: 'Spațiu de lucru',
    search: 'Căutare',
    language: 'Limbă',
    location: 'Locație',
    analyze: 'Analizează',
    roadmap: 'Drumul spre locul #1',
    winning_potential: 'Potențial de câștig',
    traffic_potential: 'Potențial de trafic',
    serp_audit: 'Audit SERP',
    avg_optimization: 'Optimizare Medie',
    disclaimer: 'Declinare',
    balance: 'Balanță',
    research: 'Cercetare',
    seed_keyword: 'Cuvânt cheie...',
    api_source: 'Sursă API',
    method: 'Metodă',
    search_engine: 'Motor de căutare',
    recent_queries: 'Căutări recente',
    keyword: 'Cuvânt cheie',
    intent: 'Intenție',
    volume: 'Volum',
    trend: 'Trend',
    cpc: 'CPC',
    audit: 'Audit',
    action: 'Acțiune',
    hide: 'Ascunde',
    peak: 'Vârf',
    keyword_research: 'Cercetare Cuvinte Cheie',
    no_results_found: 'Niciun rezultat găsit',
    back_to_history: 'Înapoi la Istoric',
    retry_in_live_mode: 'Reîncearcă în modul LIVE',
    querying_dataforseo: 'Se interoghează DataForSEO...',
    back: 'Înapoi',
    refresh_from_api: 'Actualizează din API',
    page: 'Pagina',
    of: 'din',
    prev: 'Prev',
    next: 'Următor',
    no_recent_queries: 'Nicio căutare recentă',
    start_research_to_build_history: 'Începeți cercetarea de mai sus pentru a construi istoricul',
    source: 'Sursă',
    engine: 'Motor',
    personal: 'Personal',
    ideas: 'Idei'
  }
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [dynamicDict, setDynamicDict] = useState<Dictionary>({});

  useEffect(() => {
    const saved = localStorage.getItem('ui-lang');
    if (saved) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    if (lang === 'en' || lang === 'hi' || lang === 'ro') {
      setDynamicDict({});
      return;
    }

    // Attempt to translate the whole dictionary using machine translation
    // This is a "magic" fallback for any language requested by the user
    async function translateDictionary() {
      const keys = Object.keys(localDictionaries.en);
      const values = Object.values(localDictionaries.en);
      const query = values.join(' ||| ');
      
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(query)}`);
        const data = await res.json() as any;
        const translatedText = data[0].map((item: any) => item[0]).join('');
        const translatedValues = translatedText.split(' ||| ');
        
        const newDict: Dictionary = {};
        keys.forEach((key, i) => {
          newDict[key] = translatedValues[i] || values[i];
        });
        setDynamicDict(newDict);
      } catch (e) {
        console.error('Translation failed', e);
      }
    }

    translateDictionary();
  }, [lang]);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('ui-lang', newLang);
  };

  const t = (key: string) => {
    if (dynamicDict[key]) return dynamicDict[key];
    const dict = localDictionaries[lang] || localDictionaries.en;
    return dict[key] || localDictionaries.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
