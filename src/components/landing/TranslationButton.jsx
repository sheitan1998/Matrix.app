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
        style={{ border: '1.5px solid hsl(var(--border))', background: 'hsl(var(--card))' }} title="Changer de langue">
        <Globe className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
      </button>
      {open && <div className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl overflow-hidden shadow-2xl z-50"
        style={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}>
        <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b" style={{ borderColor: 'hsl(var(--border))' }}>Langue</p>
        <div className="max-h-64 overflow-y-auto no-scrollbar">
          {LANGUAGES.map(lang => <button key={lang.code} disabled={saving} onClick={() => selectLanguage(lang.code)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-foreground/5 transition text-left disabled:opacity-50">
            <span className="text-base">{lang.flag}</span><span className="flex-1 text-xs font-semibold text-foreground">{lang.label}</span>
            {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-green-400" />}
          </button>)}
        </div>
      </div>}
    </div>
  );
}