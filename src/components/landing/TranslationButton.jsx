import React, { useState, useEffect, useRef } from "react";
import { Globe, Check } from "lucide-react";

const LANGUAGES = [
{ code: "fr", label: "Français", flag: "🇫🇷" },
{ code: "en", label: "English", flag: "🇬🇧" },
{ code: "es", label: "Español", flag: "🇪🇸" },
{ code: "de", label: "Deutsch", flag: "🇩🇪" },
{ code: "it", label: "Italiano", flag: "🇮🇹" },
{ code: "pt", label: "Português", flag: "🇵🇹" },
{ code: "nl", label: "Nederlands", flag: "🇳🇱" },
{ code: "ru", label: "Русский", flag: "🇷🇺" },
{ code: "ja", label: "日本語", flag: "🇯🇵" },
{ code: "ko", label: "한국어", flag: "🇰🇷" },
{ code: "zh-CN", label: "中文", flag: "🇨🇳" },
{ code: "ar", label: "العربية", flag: "🇸🇦" }];


export default function TranslationButton() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("fr");
  const ref = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("matrix_lang");
    if (stored) setCurrentLang(stored);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const selectLanguage = (code) => {
    setCurrentLang(code);
    localStorage.setItem("matrix_lang", code);
    setOpen(false);

    if (code === "fr") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/";
      window.location.reload();
      return;
    }

    // Set the googtrans cookie (multiple formats for domain matching)
    document.cookie = `googtrans=/fr/${code}; path=/`;
    document.cookie = `googtrans=/fr/${code}; domain=.${window.location.hostname}; path=/`;

    const triggerTranslation = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
        return true;
      }
      return false;
    };

    // Load Google Translate script if not already loaded
    if (!window.google || !window.google.translate) {
      const existing = document.getElementById("google_translate_element");
      if (existing) existing.innerHTML = "";

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement({
            pageLanguage: "fr",
            includedLanguages: LANGUAGES.map((l) => l.code).join(","),
            autoDisplay: false
          }, "google_translate_element");
          // Retry until the select element is ready
          let attempts = 0;
          const tryTranslate = () => {
            if (triggerTranslation() || attempts++ > 10) return;
            setTimeout(tryTranslate, 300);
          };
          setTimeout(tryTranslate, 500);
        }
      };

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    } else {
      // Already loaded — retry in case the select isn't immediately ready
      let attempts = 0;
      const tryTranslate = () => {
        if (triggerTranslation() || attempts++ > 5) return;
        setTimeout(tryTranslate, 200);
      };
      tryTranslate();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full transition tap-sm pt-2 pr-3 pb-2 pl-3 mt-8 mr-3 ml-32"
        style={{
          border: "1.5px solid rgba(168,85,247,0.4)",
          background: "rgba(168,85,247,0.05)"
        }}
        title="Changer de langue">
        
        <Globe className="w-3.5 h-3.5 text-white" />
        <span className="text-xs font-bold text-white">{currentLang.toUpperCase()}</span>
      </button>

      {open &&
      <div
        className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden shadow-2xl z-50"
        style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)" }}>
        
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5">
            Langue
          </p>
          <div className="max-h-64 overflow-y-auto no-scrollbar">
            {LANGUAGES.map((lang) =>
          <button
            key={lang.code}
            onClick={() => selectLanguage(lang.code)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition text-left">
            
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-xs font-semibold text-white">{lang.label}</span>
                {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-green-400" />}
              </button>
          )}
          </div>
        </div>
      }

      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }} />
    </div>);

}