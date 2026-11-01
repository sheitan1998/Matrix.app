import { useEffect, useState } from "react";

let sidebarCount = 0;
const listeners = new Set();

const notify = () => {
  const present = sidebarCount > 0;
  listeners.forEach((listener) => listener(present));
};

// Registers a mounted sidebar so floating actions can step aside when the
// sidebar already exposes the same shortcuts.
export function useRegisterSidebar() {
  useEffect(() => {
    sidebarCount += 1;
    notify();
    return () => {
      sidebarCount -= 1;
      notify();
    };
  }, []);
}

export function useSidebarPresence() {
  const [mounted, setMounted] = useState(sidebarCount > 0);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    listeners.add(setMounted);
    setMounted(sidebarCount > 0);
    return () => listeners.delete(setMounted);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return mounted && isDesktop;
}