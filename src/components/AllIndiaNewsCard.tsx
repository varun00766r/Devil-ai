import React, { useState, useEffect } from 'react';
import { IndiaNewsItem } from '../types';
import { soundFX, speakTextNative } from '../lib/audio';
import {
  Newspaper,
  RefreshCw,
  Volume2,
  ExternalLink,
  Share2,
  Check,
  Search,
  Flame,
  Globe,
  Landmark,
  TrendingUp,
  Trophy,
  Cpu,
  MapPin,
  Clock,
  Sparkles,
  Radio,
  ChevronRight,
  Filter
} from 'lucide-react';

interface AllIndiaNewsCardProps {
  initialNews?: IndiaNewsItem[];
  onSelectHeadline?: (headline: string) => void;
}

const DEFAULT_INDIA_NEWS: IndiaNewsItem[] = [
  {
    id: 'in-1',
    title: 'भारत का आर्थिक विकास: डिजिटल पब्लिक इंफ्रास्ट्रक्चर और UPI का वैश्विक विस्तार जारी',
    summary: 'भारतीय रिज़र्व बैंक और वित्त मंत्रालय की रिपोर्ट के अनुसार डिजिटल लेन-देन में ऐतिहासिक वृद्धि दर्ज हुई है और विश्व स्तर पर UPI स्वीकृति का दायरा कई अन्य देशों में बढ़ा है।',
    category: 'business',
    source: 'Press Trust of India (PTI)',
    url: 'https://www.pib.gov.in',
    time: 'अभी-अभी (Live)',
    tag: 'TOP STORY',
  },
  {
    id: 'in-2',
    title: 'ISRO का नया अंतरिक्ष मिशन: गगनयान और चंद्र मिशनों के आगामी परीक्षणों की तैयारी तेज',
    summary: 'भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) ने मानवरहित गगनयान टेस्ट व्हीकल मिशन और अगले चरण के पेलोड के सफल एकीकरण की पुष्टि की।',
    category: 'tech',
    source: 'ISRO / ANI News',
    url: 'https://www.isro.gov.in',
    time: '15 मिनट पहले',
    tag: 'SCIENCE & SPACE',
  },
  {
    id: 'in-3',
    title: 'संसद व राष्ट्रीय सुरक्षा समीक्षा: सीमावर्ती इंफ्रास्ट्रक्चर और आधुनिक रक्षा प्रणालियों पर उच्चस्तरीय बैठक',
    summary: 'रक्षा मंत्रालय ने मेक-इन-इंडिया रक्षा उपकरणों के उत्पादन में अभूतपूर्व प्रगति और आधुनिक निगरानी रडार नेटवर्क की स्थापना का ब्यौरा साझा किया।',
    category: 'national',
    source: 'National News Bureau',
    url: 'https://newsonair.gov.in',
    time: '35 मिनट पहले',
    tag: 'NATIONAL',
  },
  {
    id: 'in-4',
    title: 'भारतीय शेयर बाज़ार: सेंसेक्स और निफ्टी में बैंकिंग व आईटी शेयरों की अगुवाई में स्थिरता',
    summary: 'विदेशी संस्थागत निवेशकों (FIIs) के सकारात्मक प्रवाह और घरेलू ऑटोमोबाइल बिक्री के मजबूत आंकड़ों से बाजार में तेजी का माहौल।',
    category: 'business',
    source: 'Economic Times / NSE',
    url: 'https://economictimes.indiatimes.com',
    time: '1 घंटा पहले',
    tag: 'MARKETS',
  },
  {
    id: 'in-5',
    title: 'भारतीय क्रिकेट टीम: आगामी अंतरराष्ट्रीय सीरीज और घरेलू टूर्नामेंट्स के लिए टीम रणनीति पर मंथन',
    summary: 'बीसीसीआई और टीम प्रबंधन ने युवाओं को मौका देने और आगामी विश्वस्तरीय टूर्नामेंट की तैयारियों के लिए विशेष प्रशिक्षण शिविर आयोजित किया।',
    category: 'sports',
    source: 'BCCI / Sports Desk',
    url: 'https://www.bcci.tv',
    time: '2 घंटे पहले',
    tag: 'SPORTS',
  },
  {
    id: 'in-6',
    title: 'मध्य प्रदेश व ग्वालियर रीजन: हाई-स्पीड कनेक्टिविटी व ग्वालियर एयरपोर्ट टर्मिनल विस्तार से क्षेत्रीय व्यापार में उछाल',
    summary: 'ग्वालियर राजमाता विजयाराजे सिंधिया एयरपोर्ट विस्तार और एक्सप्रेसवे कॉरिडोर से चंबल व ग्वालियर अंचल में औद्योगिक निवेश और रोजगार के नए अवसर सृजित हुए हैं।',
    category: 'states',
    source: 'MP Regional Desk / Dainik Bhaskar',
    url: 'https://mpinfo.org',
    time: '3 घंटे पहले',
    tag: 'MP & GWALIOR',
  },
  {
    id: 'in-7',
    title: 'भारतीय मौसम विज्ञान विभाग (IMD): देश भर के राज्यों के लिए मौसमी पूर्वानुमान और कृषि परामर्श जारी',
    summary: 'आईएमडी ने विभिन्न कृषि क्षेत्रों के लिए अनुकूल मौसमी परिस्थितियों और रबी-खरीफ फसलों के सुरक्षित भंडारण को लेकर किसानों के लिए एडवाइजरी जारी की।',
    category: 'national',
    source: 'India Meteorological Dept (IMD)',
    url: 'https://mausam.imd.gov.in',
    time: '4 घंटे पहले',
    tag: 'WEATHER INTEL',
  },
  {
    id: 'in-8',
    title: 'भारत का एआई व सेमीकंडक्टर मिशन: देश के प्रमुख राज्यों में सेमीकंडक्टर फैब यूनिट्स का निर्माण कार्य प्रगति पर',
    summary: 'इलेक्ट्रॉनिक्स और आईटी मंत्रालय के अनुसार भारत में स्वदेशी चिप निर्माण और भारतजीपीटी जैसी घरेलू एआई पहलों को राष्ट्रीय प्राथमिकता के तहत तीव्र गति दी जा रही है।',
    category: 'tech',
    source: 'Ministry of Electronics & IT (MeitY)',
    url: 'https://meity.gov.in',
    time: '5 घंटे पहले',
    tag: 'TECH & AI',
  },
];

type CategoryKey = 'all' | 'national' | 'politics' | 'business' | 'sports' | 'tech' | 'states';

export const AllIndiaNewsCard: React.FC<AllIndiaNewsCardProps> = ({
  initialNews,
  onSelectHeadline,
}) => {
  const [news, setNews] = useState<IndiaNewsItem[]>(initialNews && initialNews.length > 0 ? initialNews : DEFAULT_INDIA_NEWS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(() =>
    new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
  );

  // Categories configuration with badges
  const categories: { key: CategoryKey; label: string; hindi: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'all', label: 'All India', hindi: 'अखिल भारतीय', icon: Globe },
    { key: 'national', label: 'National', hindi: 'राष्ट्रीय', icon: Landmark },
    { key: 'business', label: 'Economy', hindi: 'अर्थव्यवस्था', icon: TrendingUp },
    { key: 'tech', label: 'Tech & ISRO', hindi: 'तकनीक व अंतरिक्ष', icon: Cpu },
    { key: 'sports', label: 'Sports/Cricket', hindi: 'खेल व क्रिकेट', icon: Trophy },
    { key: 'states', label: 'States & Gwalior', hindi: 'राज्य व ग्वालियर', icon: MapPin },
  ];

  // Refresh news from server
  const fetchLiveNews = async (cat: CategoryKey = selectedCategory) => {
    setIsLoading(true);
    soundFX.playScanPing();
    try {
      const queryParam = cat !== 'all' ? `?category=${cat}` : '';
      const res = await fetch(`/api/news/india${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.news) && data.news.length > 0) {
          setNews(data.news);
          setLastRefreshedTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }));
          soundFX.playConfirm();
        }
      }
    } catch (err) {
      console.warn('Failed to refresh news live from server, using existing cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items
  const filteredNews = news.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (item: IndiaNewsItem) => {
    const textToCopy = `🇮🇳 [DEVIL All-India News]\n${item.title}\n${item.summary}\nस्रोत: ${item.source} (${item.time})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    soundFX.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakItem = (item: IndiaNewsItem) => {
    if (speakingId === item.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
    } else {
      soundFX.playClick();
      setSpeakingId(item.id);
      const textToSpeak = `${item.title}। ${item.summary}`;
      speakTextNative(textToSpeak, 'devil', () => {
        setSpeakingId(null);
      });
    }
  };

  const handleSpeakBriefing = () => {
    if (speakingId === 'full-briefing') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
    } else {
      soundFX.playPowerUp();
      setSpeakingId('full-briefing');
      const topHeadlines = filteredNews.slice(0, 3).map((n, i) => `खबर नंबर ${i + 1}: ${n.title}`).join('। ');
      const briefingText = `नमस्ते बॉस! अखिल भारतीय ताज़ा समाचार रडार ब्रिफ़िंग: ${topHeadlines}। सभी समाचार सीधे DEVIL लाइव फीड से अद्यतन हैं।`;
      speakTextNative(briefingText, 'devil', () => {
        setSpeakingId(null);
      });
    }
  };

  return (
    <div id="all-india-news-radar" className="w-full my-3 rounded-2xl bg-slate-950 border border-red-500/40 shadow-2xl overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-cyan-950/80 p-3.5 border-b border-red-500/30 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-red-950/50">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                LIVE ALL-INDIA INTEL RADAR
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                24x7 REAL-TIME
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span>अखिल भारतीय ताज़ा समाचार (New News All India)</span>
            </h3>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleSpeakBriefing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition shadow-sm ${
              speakingId === 'full-briefing'
                ? 'bg-red-600 text-white border-red-400 animate-pulse'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-red-400 hover:text-red-300'
            }`}
            title="Listen to Top India News Briefing"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">वॉयस ब्रिफ़िंग</span>
            <span className="sm:hidden">बोलें</span>
          </button>

          <button
            onClick={() => fetchLiveNews(selectedCategory)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-cyan-300 text-xs font-mono transition shadow-sm disabled:opacity-50"
            title="Refresh Live News"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">ताज़ा करें</span>
          </button>
        </div>
      </div>

      {/* Sub-header status bar */}
      <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>अपडेट IST: <span className="text-slate-200 font-semibold">{lastRefreshedTime}</span></span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PTI • ANI • PIB • ISRO • IMD Feed Active</span>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 space-y-2.5">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 touch-pan-x select-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedCategory(cat.key);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-red-950/90 text-red-200 border border-red-500/60 shadow-md shadow-red-950/40'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{cat.hindi}</span>
                <span className="text-[10px] opacity-60 font-mono hidden md:inline">({cat.label})</span>
              </button>
            );
          })}
        </div>

        {/* Quick Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="समाचार में खोजें (जैसे: चंद्रयान, क्रिकेट, सेंसेक्स, बजट, ग्वालियर)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-200 font-mono"
            >
              साफ़ करें
            </button>
          )}
        </div>
      </div>

      {/* News Feed List */}
      <div className="p-3 divide-y divide-slate-800/80 max-h-96 overflow-y-auto space-y-3">
        {filteredNews.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono space-y-2">
            <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
            <p>इस श्रेणी या खोज में कोई समाचार नहीं मिला।</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-cyan-400 underline text-xs"
            >
              सभी समाचार देखें
            </button>
          </div>
        ) : (
          filteredNews.map((item, idx) => {
            const isSpeakingThis = speakingId === item.id;
            const isCopied = copiedId === item.id;

            return (
              <div key={`${item.id}_${idx}`} className="pt-3 first:pt-0 group">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tag && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700/40 uppercase tracking-tight">
                        {item.tag}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <span>•</span>
                      <span>{item.source}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ({item.time})
                    </span>
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleSpeakItem(item)}
                      className={`p-1 rounded hover:bg-slate-800 transition text-slate-400 ${
                        isSpeakingThis ? 'text-red-400 animate-pulse bg-red-950/40' : 'hover:text-slate-200'
                      }`}
                      title="Listen to this news headline"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-1 rounded hover:bg-slate-800 transition text-slate-400 hover:text-slate-200"
                      title="Copy headline"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* News Headline */}
                <h4
                  onClick={() => onSelectHeadline && onSelectHeadline(item.title)}
                  className={`text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-red-300 transition leading-snug cursor-pointer ${
                    onSelectHeadline ? 'hover:underline' : ''
                  }`}
                >
                  {item.title}
                </h4>

                {/* News Summary */}
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {item.summary}
                </p>

                {/* Footer link */}
                {item.url && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      <span>स्रोत पर पढ़ें (Official Press/Portal)</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tactical Footer */}
      <div className="bg-slate-950 p-2.5 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-red-400">
          <Sparkles className="w-3 h-3 text-red-400" />
          <span>DEVIL Real-Time Neural Grounding Engine Active</span>
        </div>
        <div className="text-slate-500">
          वॉइस या चैट में बोलें: <span className="text-slate-300 font-semibold">"New news all India"</span>
        </div>
      </div>
    </div>
  );
};
