import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from "react";
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

const ORIGINAL_BG_IMAGE = "/media/tuto-gaming/891f5968b_Gemini_Generated_Image_vsevw4vsevw4vsev.png";

export function applyTheme(prefs) {
  const mode = prefs.mode;
  const color = prefs.customColor || DEFAULT_PREFS.customColor;
  const { h, s, l } = hexToHsl(color);
  const channels = color.slice(1).match(/.{2}/g).map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const lightCustom = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2] > 0.179;
  const vars = mode === "light" ? LIGHT_VARS : mode === "dark" ? SOLID_DARK_VARS : mode === "custom" && lightCustom ? LIGHT_VARS : DARK_VARS;
  applyVars(vars);

  if (mode === "custom") {
    const customHsl = `${h} ${s}% ${l}%`;
    applyVars({
      "--background": customHsl,
      "--primary": customHsl,
      "--accent": customHsl,
      "--ring": customHsl,
      "--primary-foreground": lightCustom ? DARK_VARS["--primary-foreground"] : DARK_VARS["--foreground"],
      "--accent-foreground": lightCustom ? DARK_VARS["--accent-foreground"] : DARK_VARS["--foreground"],
    });
  }

  const pageColor = mode === "dark" ? "#000000" : mode === "light" ? "#F4F4F5" : mode === "custom" ? color : "#0a050f";
  let image = "none";
  if (mode === "original") {
    image = `linear-gradient(rgba(10,5,15,0.55), rgba(10,5,15,0.55)), url(${JSON.stringify(ORIGINAL_BG_IMAGE)})`;
  } else if (mode === "custom" && prefs.bgImageUrl) {
    const shade = 1 - (prefs.bgOpacity ?? 0.5);
    image = `linear-gradient(rgba(0,0,0,${shade}), rgba(0,0,0,${shade})), url(${JSON.stringify(prefs.bgImageUrl)})`;
  }

  document.getElementById("matrix-theme-bg")?.remove();
  const root = document.documentElement;
  const body = document.body;
  const app = document.getElementById("root");
  root.style.setProperty("--matrix-page-background", pageColor);
  root.style.setProperty("background-color", pageColor, "important");
  root.style.setProperty("background-image", "none", "important");
  root.style.colorScheme = mode === "light" || (mode === "custom" && lightCustom) ? "light" : "dark";
  body.style.setProperty("background-color", pageColor, "important");
  body.style.setProperty("background-image", image, "important");
  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
  body.style.backgroundRepeat = "no-repeat";
  body.style.backgroundAttachment = "fixed";
  [root, body, app].filter(Boolean).forEach((element) => {
    element.setAttribute("data-matrix-theme", mode);
  });
  if (app) app.style.setProperty("background", "transparent", "important");
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
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

  const value = useMemo(
    () => ({ prefs, updatePrefs, hasCustomBg, customBgChecked, refreshCustomBg: checkCustomBg }),
    [prefs, updatePrefs, hasCustomBg, customBgChecked, checkCustomBg]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback so components rendered outside the provider still work.
    return {
      prefs: loadPrefs(),
      updatePrefs: () => {},
      hasCustomBg: false,
      customBgChecked: true,
      refreshCustomBg: async () => {},
    };
  }
  return ctx;
}

export function initTheme() {
  applyTheme(loadPrefs());
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    applyTheme(loadPrefs());
  });
}