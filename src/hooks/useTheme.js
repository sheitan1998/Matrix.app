import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "matrix_theme_prefs";

const DARK_VARS = {
  "--background": "0 0% 4%",
  "--foreground": "0 0% 98%",
  "--card": "0 0% 7%",
  "--card-foreground": "0 0% 98%",
  "--popover": "0 0% 6%",
  "--popover-foreground": "0 0% 98%",
  "--primary": "135 100% 50%",
  "--primary-foreground": "0 0% 5%",
  "--secondary": "0 0% 12%",
  "--secondary-foreground": "0 0% 98%",
  "--muted": "0 0% 10%",
  "--muted-foreground": "0 0% 64%",
  "--accent": "135 100% 50%",
  "--accent-foreground": "0 0% 5%",
  "--destructive": "0 84% 60%",
  "--destructive-foreground": "0 0% 98%",
  "--border": "0 0% 14%",
  "--input": "0 0% 12%",
  "--ring": "135 100% 50%",
};

const LIGHT_VARS = {
  "--background": "0 0% 97%",
  "--foreground": "0 0% 6%",
  "--card": "0 0% 100%",
  "--card-foreground": "0 0% 6%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "0 0% 6%",
  "--primary": "135 80% 38%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "0 0% 92%",
  "--secondary-foreground": "0 0% 10%",
  "--muted": "0 0% 90%",
  "--muted-foreground": "0 0% 40%",
  "--accent": "135 80% 38%",
  "--accent-foreground": "0 0% 100%",
  "--destructive": "0 84% 50%",
  "--destructive-foreground": "0 0% 100%",
  "--border": "0 0% 84%",
  "--input": "0 0% 88%",
  "--ring": "135 80% 38%",
};

const DEFAULT_PREFS = {
  mode: "original",
  customAccent: "#a855f7",
  customBg: "#0a050f",
  bgImageUrl: "",
  bgOpacity: 0.5,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function applyVars(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function applyThemeBackground(prefs) {
  const bgLayer = document.getElementById("matrix-theme-bg");
  if (!bgLayer) return;

  if (prefs.mode === "custom" && prefs.bgImageUrl) {
    bgLayer.style.display = "block";
    bgLayer.style.backgroundImage = `url(${prefs.bgImageUrl})`;
    bgLayer.style.backgroundSize = "cover";
    bgLayer.style.backgroundPosition = "center";
    bgLayer.style.backgroundAttachment = "fixed";
    bgLayer.style.opacity = String(prefs.bgOpacity || 0.5);
  } else {
    bgLayer.style.display = "none";
  }
}

export function applyTheme(prefs) {
  if (prefs.mode === "light") {
    applyVars(LIGHT_VARS);
  } else if (prefs.mode === "custom") {
    applyVars(DARK_VARS);
    const accentHex = prefs.customAccent || "#a855f7";
    const { h, s, l } = hexToHsl(accentHex);
    document.documentElement.style.setProperty("--primary", `${h} ${s}% ${l}%`);
    document.documentElement.style.setProperty("--accent", `${h} ${s}% ${l}%`);
    document.documentElement.style.setProperty("--ring", `${h} ${s}% ${l}%`);
  } else {
    // "original" and "dark" both use the default dark neon space theme
    applyVars(DARK_VARS);
  }
  applyThemeBackground(prefs);
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function useTheme() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [isVip, setIsVip] = useState(false);
  const [vipChecked, setVipChecked] = useState(false);

  useEffect(() => {
    applyTheme(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const checkVip = useCallback(async () => {
    try {
      const u = await base44.auth.me();
      const vip = u?.is_vip || false;
      const vipUntil = u?.vip_until;
      if (vip && vipUntil) {
        setIsVip(new Date(vipUntil) > new Date());
      } else {
        setIsVip(vip);
      }
    } catch {}
    setVipChecked(true);
  }, []);

  useEffect(() => {
    checkVip();
  }, [checkVip]);

  const updatePrefs = useCallback((partial) => {
    setPrefs((prev) => ({ ...prev, ...partial }));
  }, []);

  return { prefs, updatePrefs, isVip, vipChecked, refreshVip: checkVip };
}

export function initThemeBackgroundLayer() {
  if (document.getElementById("matrix-theme-bg")) return;
  const layer = document.createElement("div");
  layer.id = "matrix-theme-bg";
  layer.style.position = "fixed";
  layer.style.inset = "0";
  layer.style.pointerEvents = "none";
  layer.style.zIndex = "0";
  layer.style.display = "none";
  document.body.prepend(layer);
  const prefs = loadPrefs();
  applyThemeBackground(prefs);
}