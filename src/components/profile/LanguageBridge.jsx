import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getPreferredLanguage, startTranslation } from '@/lib/languagePreference';

export default function LanguageBridge() {
  const { user } = useAuth();
  useEffect(() => {
    const language = user?.interface_language || getPreferredLanguage();
    if (user?.interface_language) localStorage.setItem('matrix_lang', language);
    document.documentElement.lang = language;
    if (language !== 'fr') startTranslation(language);
  }, [user?.interface_language]);
  return null;
}