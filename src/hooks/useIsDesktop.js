import { useEffect, useState } from 'react';

const QUERY = '(min-width: 1280px)';

export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const onChange = (event) => setIsDesktop(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}