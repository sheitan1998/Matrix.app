export const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export function getPreferredLanguage() {
  const stored = localStorage.getItem('matrix_lang');
  if (stored && LANGUAGES.some(l => l.code === stored)) return stored;
  const browser = (navigator.language || 'fr').toLowerCase();
  return LANGUAGES.find(l => l.code.toLowerCase() === browser)?.code ||
    LANGUAGES.find(l => l.code.toLowerCase() === browser.split('-')[0])?.code || 'fr';
}

let loading = false;
export function startTranslation(language) {
  if (language === 'fr') return;
  if (!document.getElementById('google_translate_element')) {
    const element = document.createElement('div');
    element.id = 'google_translate_element';
    element.style.display = 'none';
    document.body.appendChild(element);
  }
  const translate = () => {
    const select = document.querySelector('.goog-te-combo');
    if (!select) return false;
    const target = language === 'zh' ? 'zh-CN' : language;
    if (select.value !== target) {
      select.value = target;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return true;
  };
  if (translate() || loading) return;
  loading = true;
  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement({
      pageLanguage: 'fr',
      includedLanguages: LANGUAGES.map(l => l.code === 'zh' ? 'zh-CN' : l.code).join(','),
      autoDisplay: false,
    }, 'google_translate_element');
    let retries = 0;
    const wait = () => { if (!translate() && retries++ < 30) setTimeout(wait, 300); };
    wait();
  };
  if (window.google?.translate) window.googleTranslateElementInit();
  else {
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => { loading = false; };
    document.head.appendChild(script);
  }
}

export function changeLanguage(language) {
  localStorage.setItem('matrix_lang', language);
  document.documentElement.lang = language;
  const value = language === 'fr' ? '' : `/fr/${language === 'zh' ? 'zh-CN' : language}`;
  document.cookie = `googtrans=${value}; path=/; SameSite=Lax`;
  // Clear legacy domain-scoped translations too when returning to French.
  if (language === 'fr') document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${window.location.hostname}; path=/`;
  // A fresh React tree is required when returning to French from translated DOM nodes.
  window.location.reload();
}