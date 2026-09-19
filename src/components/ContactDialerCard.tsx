import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, Plus, Trash2, User, MessageSquare, ShieldAlert, Search } from 'lucide-react';
import { soundFX } from '../lib/audio';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

interface ContactDialerCardProps {
  onOpenFakeCall?: () => void;
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: 'Emergency Helpline (आपातकालीन)', phone: '112', relation: 'SOS' },
  { id: '2', name: 'Police Control (पुलिस)', phone: '100', relation: 'Safety' },
  { id: '3', name: 'Ambulance (एम्बुलेंस)', phone: '102', relation: 'Medical' },
  { id: '4', name: 'Mom (माँ)', phone: '+919876543210', relation: 'Family' },
  { id: '5', name: 'Dad (पापा)', phone: '+919812345678', relation: 'Family' },
];

export const ContactDialerCard: React.FC<ContactDialerCardProps> = ({ onOpenFakeCall }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('devil_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CONTACTS;
  });

  const [dialNumber, setDialNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('devil_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !dialNumber.trim()) return;
    soundFX.playConfirm();
    const newContact: Contact = {
      id: Date.now().toString(),
      name: contactName.trim(),
      phone: dialNumber.trim(),
      relation: 'Custom',
    };
    setContacts((prev) => [newContact, ...prev]);
    setContactName('');
    setDialNumber('');
    setShowAddForm(false);
  };

  const handleDeleteContact = (id: string) => {
    soundFX.playClick();
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="my-2 p-3.5 bg-slate-950 border border-red-500/50 rounded-xl shadow-2xl space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-red-950/80">
        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
          <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
          <span>DEVIL Contact Radar & Call Launcher</span>
        </div>
        <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/60 px-2 py-0.5 rounded-full font-sans">
          Quick Dial Active
        </span>
      </div>

      {/* Manual Dial Input */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <input
              type="tel"
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              placeholder="नंबर दर्ज करें (Enter phone number)..."
              className="w-full bg-slate-900 border border-red-900/60 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <a
            href={dialNumber ? `tel:${dialNumber}` : '#'}
            onClick={(e) => {
              if (!dialNumber) {
                e.preventDefault();
                alert('कृपया कॉल करने के लिए नंबर दर्ज करें!');
              } else {
                soundFX.playConfirm();
              }
            }}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Now</span>
          </a>
        </div>
      </div>

      {/* Search & Add Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="कांटेक्ट खोजें (Search)..."
            className="w-full pl-8 pr-2 py-1.5 bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg text-[11px] text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>
        <button
          onClick={() => {
            soundFX.playClick();
            setShowAddForm(!showAddForm);
          }}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-red-500/30 text-red-400 text-[11px] font-semibold flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* New Contact Form */}
      {showAddForm && (
        <form onSubmit={handleAddContact} className="p-2.5 bg-slate-900 rounded-lg border border-red-900/50 space-y-2 text-xs">
          <div className="font-bold text-red-300 text-[11px]">नया कांटेक्ट जोड़ें (Add Contact)</div>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="नाम (Contact Name)..."
            required
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
          />
          <input
            type="tel"
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            placeholder="फोन नंबर (Mobile Number)..."
            required
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-[11px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-red-600 text-white font-bold text-[11px] hover:bg-red-500"
            >
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-3 text-slate-500 text-xs">कोई कांटेक्ट नहीं मिला।</div>
        ) : (
          filteredContacts.map((c, idx) => (
            <div
              key={`${c.id}_${idx}`}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-red-500/40 transition group text-xs"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0 text-red-300 font-bold text-[11px]">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-slate-200 truncate text-[11px]">{c.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{c.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Direct Call Link */}
                <a
                  href={`tel:${c.phone}`}
                  onClick={() => soundFX.playConfirm()}
                  className="p-1.5 rounded-md bg-emerald-950 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-300 transition flex items-center gap-1 text-[10px] font-bold"
                  title="Direct Call"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">Call</span>
                </a>

                {/* WhatsApp Chat Link */}
                <a
                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundFX.playClick()}
                  className="p-1.5 rounded-md bg-green-950 hover:bg-green-800 border border-green-500/50 text-green-300 transition text-[10px]"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3 h-3 text-green-400" />
                </a>

                {/* Delete custom contact */}
                {c.relation === 'Custom' && (
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fake Call Quick Trigger */}
      {onOpenFakeCall && (
        <button
          type="button"
          onClick={() => {
            soundFX.playClick();
            onOpenFakeCall();
          }}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-xs font-semibold flex items-center justify-between transition shadow-md group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🎭</span>
            <span>Fake Number Calling Simulator (फेक कॉल)</span>
          </div>
          <span className="text-[10px] bg-cyan-900/60 group-hover:bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded font-mono">
            Launch →
          </span>
        </button>
      )}

      {/* Emergency Quick SOS Bar */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1 text-red-400 font-bold">
          <ShieldAlert className="w-3 h-3" />
          <span>Quick SOS:</span>
        </span>
        <div className="flex gap-2">
          <a href="tel:112" className="px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 hover:bg-red-900 font-bold">112 SOS</a>
          <a href="tel:100" className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800">100 Police</a>
          <a href="tel:102" className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800">102 Medical</a>
        </div>
      </div>
    </div>
  );
};
