import React, { useState, useMemo } from 'react';
import {
  Globe,
  Phone,
  Shield,
  Building,
  Rocket,
  Search,
  ExternalLink,
  MapPin,
  Flame,
  Radio,
  Copy,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { soundFX } from '../lib/audio';

interface StateInfo {
  code: string;
  name: string;
  hindiName: string;
  capital: string;
  type: 'state' | 'ut';
  language: string;
  vehicleCode: string;
  population: string;
}

const ALL_INDIA_STATES: StateInfo[] = [
  { code: 'MP', name: 'Madhya Pradesh', hindiName: 'मध्य प्रदेश (ग्वालियर अंचल)', capital: 'Bhopal', type: 'state', language: 'Hindi', vehicleCode: 'MP', population: '8.5 Cr' },
  { code: 'UP', name: 'Uttar Pradesh', hindiName: 'उत्तर प्रदेश', capital: 'Lucknow', type: 'state', language: 'Hindi', vehicleCode: 'UP', population: '24.1 Cr' },
  { code: 'MH', name: 'Maharashtra', hindiName: 'महाराष्ट्र', capital: 'Mumbai', type: 'state', language: 'Marathi', vehicleCode: 'MH', population: '12.6 Cr' },
  { code: 'DL', name: 'Delhi (NCT)', hindiName: 'दिल्ली राष्ट्रीय राजधानी', capital: 'New Delhi', type: 'ut', language: 'Hindi / English', vehicleCode: 'DL', population: '2.1 Cr' },
  { code: 'RJ', name: 'Rajasthan', hindiName: 'राजस्थान', capital: 'Jaipur', type: 'state', language: 'Hindi / Rajasthani', vehicleCode: 'RJ', population: '8.1 Cr' },
  { code: 'GJ', name: 'Gujarat', hindiName: 'गुजरात', capital: 'Gandhinagar', type: 'state', language: 'Gujarati', vehicleCode: 'GJ', population: '7.1 Cr' },
  { code: 'KA', name: 'Karnataka', hindiName: 'कर्नाटक', capital: 'Bengaluru', type: 'state', language: 'Kannada', vehicleCode: 'KA', population: '6.8 Cr' },
  { code: 'TN', name: 'Tamil Nadu', hindiName: 'तमिलनाडु', capital: 'Chennai', type: 'state', language: 'Tamil', vehicleCode: 'TN', population: '7.7 Cr' },
  { code: 'TG', name: 'Telangana', hindiName: 'तेलंगाना', capital: 'Hyderabad', type: 'state', language: 'Telugu', vehicleCode: 'TG', population: '3.8 Cr' },
  { code: 'AP', name: 'Andhra Pradesh', hindiName: 'आंध्र प्रदेश', capital: 'Amaravati', type: 'state', language: 'Telugu', vehicleCode: 'AP', population: '5.3 Cr' },
  { code: 'WB', name: 'West Bengal', hindiName: 'पश्चिम बंगाल', capital: 'Kolkata', type: 'state', language: 'Bengali', vehicleCode: 'WB', population: '9.9 Cr' },
  { code: 'BR', name: 'Bihar', hindiName: 'बिहार', capital: 'Patna', type: 'state', language: 'Hindi', vehicleCode: 'BR', population: '13.1 Cr' },
  { code: 'PB', name: 'Punjab', hindiName: 'पंजाब', capital: 'Chandigarh', type: 'state', language: 'Punjabi', vehicleCode: 'PB', population: '3.1 Cr' },
  { code: 'HR', name: 'Haryana', hindiName: 'हरियाणा', capital: 'Chandigarh', type: 'state', language: 'Hindi', vehicleCode: 'HR', population: '3.0 Cr' },
  { code: 'KL', name: 'Kerala', hindiName: 'केरल', capital: 'Thiruvananthapuram', type: 'state', language: 'Malayalam', vehicleCode: 'KL', population: '3.6 Cr' },
  { code: 'OD', name: 'Odisha', hindiName: 'ओडिशा', capital: 'Bhubaneswar', type: 'state', language: 'Odia', vehicleCode: 'OD', population: '4.6 Cr' },
  { code: 'AS', name: 'Assam', hindiName: 'असम', capital: 'Dispur', type: 'state', language: 'Assamese', vehicleCode: 'AS', population: '3.6 Cr' },
  { code: 'JH', name: 'Jharkhand', hindiName: 'झारखंड', capital: 'Ranchi', type: 'state', language: 'Hindi', vehicleCode: 'JH', population: '3.9 Cr' },
  { code: 'CG', name: 'Chhattisgarh', hindiName: 'छत्तीसगढ़', capital: 'Raipur', type: 'state', language: 'Hindi / Chhattisgarhi', vehicleCode: 'CG', population: '3.0 Cr' },
  { code: 'UK', name: 'Uttarakhand', hindiName: 'उत्तराखंड', capital: 'Dehradun', type: 'state', language: 'Hindi', vehicleCode: 'UK', population: '1.2 Cr' },
  { code: 'HP', name: 'Himachal Pradesh', hindiName: 'हिमाचल प्रदेश', capital: 'Shimla', type: 'state', language: 'Hindi', vehicleCode: 'HP', population: '75 Lakh' },
  { code: 'GA', name: 'Goa', hindiName: 'गोवा', capital: 'Panaji', type: 'state', language: 'Konkani', vehicleCode: 'GA', population: '16 Lakh' },
  { code: 'JK', name: 'Jammu & Kashmir', hindiName: 'जम्मू और कश्मीर', capital: 'Srinagar / Jammu', type: 'ut', language: 'Urdu / Dogri / Kashmiri', vehicleCode: 'JK', population: '1.4 Cr' },
  { code: 'LA', name: 'Ladakh', hindiName: 'लद्दाख', capital: 'Leh', type: 'ut', language: 'Ladakhi / Hindi', vehicleCode: 'LA', population: '3.0 Lakh' },
  { code: 'TR', name: 'Tripura', hindiName: 'त्रिपुरा', capital: 'Agartala', type: 'state', language: 'Bengali / Kokborok', vehicleCode: 'TR', population: '42 Lakh' },
  { code: 'ML', name: 'Meghalaya', hindiName: 'मेघालय', capital: 'Shillong', type: 'state', language: 'English / Khasi', vehicleCode: 'ML', population: '34 Lakh' },
  { code: 'MN', name: 'Manipur', hindiName: 'मणिपुर', capital: 'Imphal', type: 'state', language: 'Meitei', vehicleCode: 'MN', population: '32 Lakh' },
  { code: 'NL', name: 'Nagaland', hindiName: 'नागालैंड', capital: 'Kohima', type: 'state', language: 'English', vehicleCode: 'NL', population: '22 Lakh' },
  { code: 'MZ', name: 'Mizoram', hindiName: 'मिज़ोरम', capital: 'Aizawl', type: 'state', language: 'Mizo', vehicleCode: 'MZ', population: '13 Lakh' },
  { code: 'SK', name: 'Sikkim', hindiName: 'सिक्किम', capital: 'Gangtok', type: 'state', language: 'Nepali / English', vehicleCode: 'SK', population: '7.0 Lakh' },
  { code: 'AR', name: 'Arunachal Pradesh', hindiName: 'अरुणाचल प्रदेश', capital: 'Itanagar', type: 'state', language: 'English', vehicleCode: 'AR', population: '16 Lakh' },
  { code: 'CH', name: 'Chandigarh', hindiName: 'चंडीगढ़', capital: 'Chandigarh', type: 'ut', language: 'Hindi / Punjabi', vehicleCode: 'CH', population: '12 Lakh' },
  { code: 'AN', name: 'Andaman & Nicobar', hindiName: 'अंडमान और निकोबार', capital: 'Port Blair', type: 'ut', language: 'Hindi / English', vehicleCode: 'AN', population: '4.3 Lakh' },
  { code: 'PY', name: 'Puducherry', hindiName: 'पुडुचेरी', capital: 'Puducherry', type: 'ut', language: 'Tamil / French', vehicleCode: 'PY', population: '15 Lakh' },
];

const EMERGENCY_SERVICES = [
  { number: '112', title: 'National Emergency', hindi: 'राष्ट्रीय आपातकालीन (पुलिस, अग्निशमन, एम्बुलेंस ऑल-इन-वन)', category: 'all' },
  { number: '100', title: 'Police Control Room', hindi: 'पुलिस सहायता नियंत्रण कक्ष', category: 'police' },
  { number: '101', title: 'Fire Service', hindi: 'अग्निशमन विभाग / फायर ब्रिगेड', category: 'fire' },
  { number: '108', title: 'Emergency Ambulance', hindi: 'इमरजेंसी मेडिकल एम्बुलेंस सेवा', category: 'medical' },
  { number: '1090', title: 'Women Powerline', hindi: 'महिला सुरक्षा व त्वरित सहायता', category: 'women' },
  { number: '1930', title: 'Cyber Crime Helpline', hindi: 'साइबर वित्तीय धोखाधड़ी रिपोर्टिंग (गृह मंत्रालय)', category: 'cyber' },
  { number: '139', title: 'Indian Railways', hindi: 'रेलवे पूछताछ, सुरक्षा व शिकायत (रेल मदद)', category: 'rail' },
  { number: '1098', title: 'Childline Helpline', hindi: 'बच्चों की सुरक्षा व संरक्षण हेल्पलाइन', category: 'child' },
  { number: '1906', title: 'LPG Leak Helpline', hindi: 'एलपीजी गैस रिसाव आपातकालीन नंबर', category: 'gas' },
  { number: '1075', title: 'Health Emergency', hindi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय', category: 'health' },
];

const DIGITAL_PORTALS = [
  { name: 'UPI & NPCI Payments', desc: 'Unified Payments Interface - Instant 24x7 banking and QR payments', url: 'https://www.npci.org.in' },
  { name: 'DigiLocker', desc: 'Official Cloud Locker for DL, Aadhaar, PAN, Vehicle RC, and Marksheets', url: 'https://www.digilocker.gov.in' },
  { name: 'UIDAI Aadhaar Portal', desc: 'Official Aadhaar verification, update, and PVC card portal', url: 'https://myaadhaar.uidai.gov.in' },
  { name: 'Passport Seva', desc: 'Ministry of External Affairs Passport application and appointment tracker', url: 'https://passportindia.gov.in' },
  { name: 'IRCTC Rail Booking', desc: 'Indian Railways ticket booking, PNR status, and live train tracker', url: 'https://www.irctc.co.in' },
  { name: 'Income Tax e-Filing', desc: 'Instant PAN linking, ITR filing, and refund status tracker', url: 'https://www.incometax.gov.in' },
  { name: 'National Scholarship Portal', desc: 'Central and state government student scholarships', url: 'https://scholarships.gov.in' },
];

export const AllIndiaDataCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'emergency' | 'digital' | 'gwalior'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    soundFX.playConfirm();
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return ALL_INDIA_STATES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_INDIA_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.hindiName.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.vehicleCode.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="w-full my-3 rounded-2xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-md overflow-hidden shadow-2xl shadow-cyan-950/40">
      {/* Top Banner Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-amber-950/40 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">DEVIL ALL-INDIA DATA MATRIX</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                🇮🇳 BHARAT INTEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">अखिल भारतीय सामरिक डेटाबेस, राज्य, आपातकालीन सेवाएं व सरकारी पोर्टल्स</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[11px] text-cyan-300/80 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>28 STATES • 8 UTs • LIVE</span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-800/80 bg-slate-900/60 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 राष्ट्रीय परिदृश्य', icon: TrendingUp },
          { id: 'states', label: '🏛️ राज्य व यूटी (36)', icon: Building },
          { id: 'emergency', label: '🚨 आपातकालीन (SOS)', icon: Phone },
          { id: 'digital', label: '💻 डिजिटल पोर्टल्स', icon: Shield },
          { id: 'gwalior', label: '📍 मध्य प्रदेश / ग्वालियर', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundFX.playClick();
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-4 text-xs">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* High Level Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">राजधानी (Capital)</span>
                <span className="text-sm font-bold text-cyan-300 mt-1">नई दिल्ली (New Delhi)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">National Capital Territory</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">जनसंख्या (Population)</span>
                <span className="text-sm font-bold text-amber-300 mt-1">~1.44 बिलियन (1st)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">विश्व में सर्वाधिक</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">अर्थव्यवस्था (GDP)</span>
                <span className="text-sm font-bold text-emerald-300 mt-1">$3.95 Trillion (5th)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">तेजी से बढ़ती अर्थव्यवस्था</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">मुद्रा व कोड</span>
                <span className="text-sm font-bold text-purple-300 mt-1">INR (₹) / +91</span>
                <span className="text-[10px] text-slate-500 mt-0.5">IST (UTC +05:30)</span>
              </div>
            </div>

            {/* Quick Strategic Pillars */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-cyan-300 flex items-center space-x-1.5">
                  <Rocket className="w-4 h-4 text-cyan-400" />
                  <span>इसरो व भारतीय अंतरिक्ष मिशन (ISRO Space & Defense Intel)</span>
                </h4>
                <p className="text-slate-300 text-[11px] mt-1">
                  • गगनयान मानवरहित कक्षीय मिशन व अंतरिक्ष स्टेशन (BAS) तैयारियाँ जारी।<br />
                  • चंद्रयान-4 सैंपल रिटर्न और आदित्य-एल1 सौर वेधशाला लाइव टेलीमेट्री सक्रिय।<br />
                  • DRDO स्वदेशी अग्नि-5 MIRV और तेजस एमके-1ए लड़ाकू विमान विकास।
                </p>
              </div>
              <a
                href="https://www.isro.gov.in"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-xs font-medium flex items-center space-x-1 whitespace-nowrap transition-colors"
              >
                <span>ISRO Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => {
                  setActiveTab('states');
                  soundFX.playClick();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 flex items-center space-x-1.5 transition-colors"
              >
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span>28 राज्य व 8 यूटी की सूची देखें</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('emergency');
                  soundFX.playClick();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/50 flex items-center space-x-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>112 ऑल-इंडिया हेल्पलाइन डायल करें</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('gwalior');
                  soundFX.playClick();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 flex items-center space-x-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>ग्वालियर व मध्य प्रदेश डेटा</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: States & UTs */}
        {activeTab === 'states' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="राज्य, राजधानी या व्हीकल कोड खोजें (उदा: MP, Gwalior, Delhi, UP)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* States Grid */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-2 no-scrollbar">
              {filteredStates.map((state) => (
                <div
                  key={state.code}
                  className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-800 font-mono font-bold text-cyan-300 border border-slate-700 flex items-center justify-center text-xs">
                      {state.vehicleCode}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-100">{state.hindiName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({state.name})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                        <span>राजधानी: <strong className="text-slate-300">{state.capital}</strong></span>
                        <span>भाषा: <strong className="text-slate-300">{state.language}</strong></span>
                        <span>आबादी: <strong className="text-cyan-400">{state.population}</strong></span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-medium ${
                    state.type === 'ut' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {state.type === 'ut' ? 'Union Territory' : 'State'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Emergency SOS */}
        {activeTab === 'emergency' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <span className="font-semibold">अखिल भारतीय आपातकालीन हेल्पलाइन निर्देशिका (24x7 SOS)</span>
              </div>
              <span className="text-[10px] font-mono text-rose-300">TOLL-FREE IN INDIA</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {EMERGENCY_SERVICES.map((srv) => (
                <div
                  key={srv.number}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-10 h-8 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-black text-sm flex items-center justify-center">
                      {srv.number}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-100">{srv.title}</h5>
                      <p className="text-[10px] text-slate-400">{srv.hindi}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleCopy(srv.number)}
                      title="Copy Number"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {copiedNumber === srv.number ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`tel:${srv.number}`}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-rose-900/40 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>कॉल</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Digital Portals */}
        {activeTab === 'digital' && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {DIGITAL_PORTALS.map((portal) => (
              <div
                key={portal.name}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition-colors"
              >
                <div>
                  <h5 className="font-semibold text-cyan-300 flex items-center space-x-1.5">
                    <span>{portal.name}</span>
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">{portal.desc}</p>
                </div>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 text-xs font-medium flex items-center space-x-1 ml-2 whitespace-nowrap transition-colors"
                >
                  <span>खोलें</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Gwalior / Madhya Pradesh */}
        {activeTab === 'gwalior' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
              <div className="flex items-center space-x-2 text-amber-300 font-semibold mb-1">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>ग्वालियर, मध्य प्रदेश — सामरिक हब (Gwalior Strategic Intel)</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                ग्वालियर मध्य प्रदेश का प्रमुख ऐतिहासिक व शैक्षणिक महानगर है, जिसे "जिब्राल्टर ऑफ इंडिया" (ग्वालियर दुर्ग) के नाम से भी जाना जाता है।
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">जीपीएस कोऑर्डिनेट्स</span>
                <p className="font-bold text-cyan-300 text-xs mt-0.5">26.2183° N, 78.1828° E</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">पिनकोड व एसटीडी</span>
                <p className="font-bold text-cyan-300 text-xs mt-0.5">474001 / STD 0751</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">एयरपोर्ट कोड</span>
                <p className="font-bold text-amber-300 text-xs mt-0.5">GWL (राजमाता सिंधिया टर्मिनल)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">हाई कोर्ट बेंच</span>
                <p className="font-bold text-purple-300 text-xs mt-0.5">MP High Court Gwalior</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">प्रमुख संस्थान</span>
                <p className="font-bold text-emerald-300 text-xs mt-0.5">IIITM, जीवाजी वि.वि., DRDE</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">स्थानीय पुलिस सहायता</span>
                <p className="font-bold text-rose-400 text-xs mt-0.5">100 / 0751-2445200</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center space-x-1 text-cyan-400">
          <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
          <span>DEVIL FAST KNOWLEDGE MATRIX: ACTIVE</span>
        </span>
        <span>IST UTC+05:30 • 100% SECURE</span>
      </div>
    </div>
  );
};
