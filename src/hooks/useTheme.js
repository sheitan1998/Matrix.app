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

const SOLID_DARK_VARS = {
  ...DARK_VARS,
  "--background": "0 0% 0%",
  "--card": "0 0% 5%",
  "--popover": "0 0% 4%",
};

const DEFAULT_PREFS = {
  mode: "original",
  customColor: "#1a0a2e",
  bgImageUrl: "",
  bgOpacity: 0.5,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    // Migration: map old customAccent to customColor
    if (parsed.customAccent && !parsed.customColor) {
      parsed.customColor = parsed.customAccent;
    }
    return { ...DEFAULT_PREFS, ...parsed };
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

function clearVars(vars) {
  const root = document.documentElement;
  Object.keys(vars).forEach((key) => {
    root.style.removeProperty(key);
  });
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

export function applyTheme(prefs) {
  const body = document.body;
  const bgLayer = document.getElementById("matrix-theme-bg");

  // Reset body background and bg layer
  body.style.backgroundColor = "";
  body.style.backgroundImage = "";

  if (prefs.mode === "original") {
    // Original: default dark neon space theme, no body bg override
    // (Landing page shows its own space background)
    applyVars(DARK_VARS);
    if (bgLayer) bgLayer.style.display = "none";
    body.setAttribute("data-matrix-theme", "original");
  } else if (prefs.mode === "dark") {
    // Solid black background covering entire screen
    applyVars(SOLID_DARK_VARS);
    body.style.backgroundColor = "#000000";
    if (bgLayer) bgLayer.style.display = "none";
    body.setAttribute("data-matrix-theme", "dark");
  } else if (prefs.mode === "light") {
    // Solid white background covering entire screen
    applyVars(LIGHT_VARS);
    body.style.backgroundColor = "#F4F4F5";
    if (bgLayer) bgLayer.style.display = "none";
    body.setAttribute("data-matrix-theme", "light");
  } else if (prefs.mode === "custom") {
    // Custom color as global background
    applyVars(DARK_VARS);
    const color = prefs.customColor || "#1a0a2e";
    const { h, s, l } = hexToHsl(color);
    // Override accent/border with the custom color
    document.documentElement.style.setProperty("--primary", `${h} ${s}% ${l}%`);
    document.documentElement.style.setProperty("--accent", `${h} ${s}% ${l}%`);
    document.documentElement.style.setProperty("--ring", `${h} ${s}% ${l}%`);

    if (prefs.bgImageUrl) {
      // Custom background image uploaded by subscriber
      body.style.backgroundColor = "#0a050f";
      if (bgLayer) {
        bgLayer.style.display = "block";
        bgLayer.style.backgroundImage = `url(${prefs.bgImageUrl})`;
        bgLayer.style.backgroundSize = "cover";
        bgLayer.style.backgroundPosition = "center";
        bgLayer.style.backgroundAttachment = "fixed";
        bgLayer.style.opacity = String(prefs.bgOpacity || 0.5);
      }
    } else {
      // Solid custom color as background
      body.style.backgroundColor = color;
      if (bgLayer) bgLayer.style.display = "none";
    }
    body.setAttribute("data-matrix-theme", "custom");
  }
}

export function useTheme() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [hasCustomBg, setHasCustomBg] = useState(false);
  const [customBgChecked, setCustomBgChecked] = useState(false);

  useEffect(() => {
    applyTheme(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const checkCustomBg = useCallback(async () => {
    try {
      const u = await base44.auth.me();
      const sub = u?.has_custom_bg || false;
      const until = u?.custom_bg_until;
      if (sub && until) {
        setHasCustomBg(new Date(until) > new Date());
      } else {
        setHasCustomBg(sub);
      }
    } catch {}
    setCustomBgChecked(true);
  }, []);

  useEffect(() => {
    checkCustomBg();
  }, [checkCustomBg]);

  const updatePrefs = useCallback((partial) => {
    setPrefs((prev) => ({ ...prev, ...partial }));
  }, []);

  return { prefs, updatePrefs, hasCustomBg, customBgChecked, refreshCustomBg: checkCustomBg };
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
  applyTheme(prefs);
}