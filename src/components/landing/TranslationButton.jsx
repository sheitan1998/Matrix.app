import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LANGUAGES, getPreferredLanguage, changeLanguage } from '@/lib/languagePreference';
import { toast } from 'sonner';

export default function TranslationButton() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getPreferredLanguage);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const selectLanguage = async (code) => {
    if (saving || code === currentLang) { setOpen(false); return; }
    setSaving(true);
    try {
      if (await base44.auth.isAuthenticated()) await base44.auth.updateMe({ interface_language: code });
      setCurrentLang(code);
      changeLanguage(code);
    } catch {
      toast.error('Impossible de changer la langue');
      setSaving(false);
    }
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-center w-9 h-9 rounded-full transition tap-sm"
        style={{ border: '1.5px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.05)' }} title="Changer de langue">
        <Globe className="w-4 h-4" style={{ color: '#a855f7' }} />
      </button>
      {open && <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden shadow-2xl z-50"
        style={{ background: '#13101a', border: '1px solid rgba(168,85,247,0.2)' }}>
        <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5">Langue</p>
        <div className="max-h-64 overflow-y-auto no-scrollbar">
          {LANGUAGES.map(lang => <button key={lang.code} disabled={saving} onClick={() => selectLanguage(lang.code)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left disabled:opacity-50">
            <span className="text-base">{lang.flag}</span><span className="flex-1 text-xs font-semibold text-white">{lang.label}</span>
            {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-green-400" />}
          </button>)}
        </div>
      </div>}
    </div>
  );
}