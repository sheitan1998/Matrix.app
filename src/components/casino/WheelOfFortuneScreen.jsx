import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Sparkles, Clock, Gift, Coins } from "lucide-react";
import { toast } from "sonner";
import { formatBet } from "@/components/casino/slotThemes";
import CasinoToken, { TOKEN_URL } from "@/components/casino/CasinoToken";
import { bustImageCache } from "@/lib/casinoImageCache";
import { getFontCss } from "@/components/admin/WheelConfigPanel";

const SEGMENTS = [
{ color: "#3a3a3a", glow: "#666", icon: "💀", label: "Perdu" },
{ color: "#00bfff", glow: "#00ffff", icon: "🪙", label: "1K" },
{ color: "#ff00ff", glow: "#ff44ff", icon: "💰", label: "20K" },
{ color: "#8b5cf6", glow: "#a855f7", icon: "💎", label: "50K" },
{ color: "#ffd700", glow: "#ffed4e", icon: "⭐", label: "100K" },
{ color: "#ff1493", glow: "#ff69b4", icon: "🎰", label: "1M" },
{ color: "#00ff7f", glow: "#00ffaa", icon: "🌟", label: "100T" }];


const SPIN_DURATION = 4500; // ms
const SPIN_COST = 20000;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
  "M", cx, cy,
  "L", start.x, start.y,
  "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
  "Z"].
  join(" ");
}

function formatTimeUntil(isoString) {
  if (!isoString) return "";
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "Disponible";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
  if (hours > 0) return `${hours}h${mins.toString().padStart(2, "0")}`;
  return `${mins} min`;
}

/**
 * Écran du mini-jeu "Roue de la Fortune" intégré au Casino.
 * - 1 lancer gratuit par jour (reset à 12h00 UTC, non cumulable)
 * - Lancers supplémentaires : 20 000 jetons par tour
 */
export default function WheelOfFortuneScreen({ balance, setBalance, onBack }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [freeSpinAvailable, setFreeSpinAvailable] = useState(false);
  const [nextResetAt, setNextResetAt] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const wheelRef = useRef(null);
  const segments = gameConfig?.rewards?.length ? gameConfig.rewards.map((reward, i) => ({ ...SEGMENTS[i % SEGMENTS.length], icon: reward.icon || SEGMENTS[i % SEGMENTS.length].icon, label: reward.label || SEGMENTS[i % SEGMENTS.length].label, icon_size: reward.icon_size ?? 36, icon_rotation: reward.icon_rotation ?? 0, bg_color: reward.bg_color || "", bg_image: reward.bg_image || "" })) : SEGMENTS.map((s) => ({ ...s, icon_size: 36, icon_rotation: 0, bg_color: "", bg_image: "" }));
  const segmentAngle = 360 / segments.length;
  const spinCost = Number(gameConfig?.spin_cost ?? SPIN_COST);
  const ts = gameConfig?.title_style;

  // Charger le statut (lancer gratuit disponible + prochain reset)
  const loadStatus = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("wheelOfFortune", { action: "getStatus" });
      const data = res?.data || res;
      if (!data.error) {
        setFreeSpinAvailable(data.freeSpinAvailable || false);
        setNextResetAt(data.nextResetAt || null);
        if (data.balance !== undefined) setBalance(data.balance);
      }
    } catch {

      /* silent */}
    setStatusLoading(false);
  }, [setBalance]);

  useEffect(() => {
    loadStatus();
    const loadConfig = async () => {
      try {
        const records = await base44.entities.CasinoGameConfig.filter({ game_key: 'wheel' });
        setGameConfig(records[0] || null);
      } catch {/* silent */}
      setConfigLoading(false);
    };
    loadConfig();
    // Realtime: refresh config instantly when admin saves changes
    const unsubscribe = base44.entities.CasinoGameConfig.subscribe((event) => {
      if (event.type === 'delete') {setGameConfig(null);return;}
      const rec = event.data;
      if (rec?.game_key === 'wheel') setGameConfig(rec);
    });
    return () => {unsubscribe();};
  }, [loadStatus]);

  const handleSpin = useCallback(async () => {
    if (spinning) return;
    setSpinning(true);
    setShowResult(false);
    setResult(null);
    try {
      const res = await base44.functions.invoke("wheelOfFortune", { action: "spin" });
      const data = res?.data || res;
      if (data.error) {
        toast.error(data.error);
        setSpinning(false);
        return;
      }
      const winResult = data.result;
      setResult(winResult);
      if (data.balance !== undefined) setBalance(data.balance);
      // Le lancer gratuit vient d'être utilisé
      if (data.freeSpinUsed) {
        setFreeSpinAvailable(false);
      }

      // Calculer l'angle cible pour aligner le segment gagnant sous le pointeur
      const targetAngle = 360 - (winResult.index * segmentAngle + segmentAngle / 2);
      const currentMod = rotation % 360;
      let delta = 360 * 5 + (targetAngle - currentMod);
      if (delta < 360 * 4) delta += 360;
      setRotation((prev) => prev + delta);

      // Afficher le résultat après la fin de l'animation
      setTimeout(() => {
        setSpinning(false);
        setShowResult(true);
        if (winResult.type === "lose") {
          toast.error("Perdu ! Réessayez.");
        } else if (winResult.type === "trix") {
          toast.success("🌟 INCROYABLE ! 100 Trix gagnés !");
        } else {
          toast.success(`Gagné : ${winResult.label} !`);
        }
      }, SPIN_DURATION + 200);
    } catch {
      toast.error("Erreur lors du lancer");
      setSpinning(false);
    }
  }, [spinning, rotation, setBalance, segmentAngle]);

  const canSpinFree = freeSpinAvailable && !spinning;
  const canSpinPaid = !freeSpinAvailable && !spinning && balance >= spinCost;
  const canSpin = canSpinFree || canSpinPaid;

  const bgImage = gameConfig?.background_image ? bustImageCache(gameConfig.background_image, gameConfig?.updated_date) : "";
  const bgColor = gameConfig?.background_color || "#0a050f";
  const bgScale = Number(gameConfig?.background_scale ?? 100);
  const bgPosX = Number(gameConfig?.background_pos_x ?? 50);
  const bgPosY = Number(gameConfig?.background_pos_y ?? 50);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8"
      style={{
        backgroundImage: bgImage ? `url("${bgImage}")` : "none",
        backgroundSize: bgScale === 0 ? "cover" : `${bgScale}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
        backgroundAttachment: bgImage ? "fixed" : "scroll",
        backgroundColor: bgColor,
      }}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h2 style={{
          fontFamily: getFontCss(ts?.font),
          fontSize: `${ts?.size || 18}px`,
          fontWeight: ts?.font === "Titan One" ? 400 : 900,
          letterSpacing: "0.05em",
          ...(!ts || ts?.color_style === "gradient" ? {
            background: `linear-gradient(135deg, ${ts?.color || "#00ffff"}, ${ts?.color2 || "#ff00ff"})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none"
          } : ts?.color_style === "neon" ? {
            color: ts?.color || "#00ffff",
            textShadow: `0 0 6px ${ts?.color || "#00ffff"}, 0 0 14px ${ts?.color || "#00ffff"}, 0 0 28px ${ts?.color2 || "#ff00ff"}`
          } : {
            color: ts?.color || "#00ffff",
            textShadow: "none"
          })
        }}>{gameConfig?.title || 'ROUE DE LA FORTUNE'}</h2>
      </div>

      {/* Wheel container */}
      <div className="relative w-full max-w-sm mb-6">
        {/* Radial glow backdrop — integrates wheel with background */}
        <div className="absolute inset-0 -z-10 rounded-full" style={{
          background: "radial-gradient(circle at center, rgba(168,85,247,0.18) 0%, rgba(0,242,255,0.08) 45%, transparent 70%)",
          transform: "scale(1.3)",
        }} />
        {/* Pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-20 flex flex-col items-center">
          <div className="w-0 h-0" style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "20px solid #ffd700",
            filter: "drop-shadow(0 0 6px rgba(255,215,0,0.6))"
          }} />
        </div>

        {/* SVG Wheel — fixed size, no scale animation */}
        <div ref={wheelRef} className="relative" style={{
          transition: `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
          transform: `rotate(${rotation}deg)`,
          willChange: "transform",
        }}>
          <svg viewBox="0 0 300 300" className="w-full h-full" style={{ filter: "drop-shadow(0 0 20px rgba(168,85,247,0.3))" }}>
            {/* Outer ring — configurable wheel border */}
            {(() => {
              const wb = gameConfig?.wheel_border;
              const w = wb?.width ?? 4;
              const style = wb?.style || "solid";
              const c1 = wb?.color || "#a855f7";
              const c2 = wb?.color2 || "#00ffff";
              if (wb?.image) {
                return (
                  <>
                    <defs>
                      <pattern id="wb-img" patternUnits="userSpaceOnUse" width="296" height="296" x="2" y="2">
                        <image href={bustImageCache(wb.image, gameConfig?.updated_date)} x="0" y="0" width="296" height="296" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                    </defs>
                    <circle cx="150" cy="150" r="148" fill="none" stroke="url(#wb-img)" strokeWidth={w} />
                  </>
                );
              }
              if (style === "gradient") {
                return (
                  <>
                    <defs>
                      <linearGradient id="wb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={c1} />
                        <stop offset="100%" stopColor={c2} />
                      </linearGradient>
                    </defs>
                    <circle cx="150" cy="150" r="148" fill="none" stroke="url(#wb-grad)" strokeWidth={w} />
                  </>
                );
              }
              if (style === "neon") {
                return <circle cx="150" cy="150" r="148" fill="none" stroke={c1} strokeWidth={w} style={{ filter: `drop-shadow(0 0 6px ${c1}) drop-shadow(0 0 12px ${c2})` }} />;
              }
              return <circle cx="150" cy="150" r="148" fill="none" stroke={c1} strokeWidth={w} />;
            })()}
            <circle cx="150" cy="150" r="144" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="2" />

            {/* Segments */}
            {segments.map((seg, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = (i + 1) * segmentAngle;
              const path = describeArc(150, 150, 140, startAngle, endAngle);
              const textPos = polarToCartesian(150, 150, 90, startAngle + segmentAngle / 2);
              const segImgId = `seg-bg-${i}`;
              const segFill = seg.bg_image ? `url(#${segImgId})` : (seg.bg_color || seg.color);
              return (
                <g key={i}>
                  {seg.bg_image && (
                    <defs>
                      <pattern id={segImgId} patternUnits="userSpaceOnUse" width="280" height="280" x="10" y="10">
                        <image href={bustImageCache(seg.bg_image, gameConfig?.updated_date)} x="0" y="0" width="280" height="280" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                    </defs>
                  )}
                  <path d={path} fill={segFill} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                  {/* Glow border */}
                  <path d={path} fill="none" stroke={seg.glow} strokeWidth="0.5" opacity="0.6" />
                  {/* Icon */}
                  {/^https?:\/\//i.test(seg.icon) ?
                  <image href={bustImageCache(seg.icon, gameConfig?.updated_date)} x={textPos.x - seg.icon_size / 2} y={textPos.y - seg.icon_size / 2} width={seg.icon_size} height={seg.icon_size} preserveAspectRatio="xMidYMid meet"
                  transform={`rotate(${seg.icon_rotation} ${textPos.x} ${textPos.y})`} /> :

                  <text x={textPos.x} y={textPos.y} textAnchor="middle" dominantBaseline="middle" fontSize={seg.icon_size}
                  style={{ filter: `drop-shadow(0 0 4px ${seg.glow})` }}
                  transform={`rotate(${seg.icon_rotation} ${textPos.x} ${textPos.y})`}>{seg.icon}</text>
                  }
                  {/* Label */}
                  









                  
                </g>);

            })}

            {/* Center hub */}
            <circle cx="150" cy="150" r="30" fill="#1a0a2e" stroke="#a855f7" strokeWidth="2" />
            <circle cx="150" cy="150" r="27" fill="none" stroke="rgba(0,242,255,0.4)" strokeWidth="1" />
            {(() => {
              const ci = gameConfig?.center_icon;
              const isImg = ci && /^https?:\/\//i.test(ci);
              const src = isImg ? bustImageCache(ci, gameConfig?.updated_date) : TOKEN_URL;
              return (
                <image
                  href={src}
                  x="122"
                  y="122"
                  width="56"
                  height="56"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.6))" }} />);


            })()}
          </svg>
        </div>
      </div>

      {/* Result display */}
      {showResult && result &&
      <div className="mb-4 text-center animate-in fade-in duration-500">
          <div className="text-4xl mb-1">
            {result.type === "lose" ? "😢" : result.type === "trix" ? "🌟" : result.amount >= 1000000 ? "💎" : "💰"}
          </div>
          <p className="text-lg font-black" style={{ color: result.type === "lose" ? "#ef4444" : result.type === "trix" ? "#00ff7f" : "#22c55e" }}>
            {result.label}
          </p>
          {result.desc && <p className="text-xs text-white/50">{result.desc}</p>}
        </div>
      }

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={!canSpin || statusLoading || configLoading}
        className="px-8 py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-40 tap-sm flex items-center gap-2"
        style={{
          background: spinning ? "rgba(255,255,255,0.1)" : canSpinFree ?
          "linear-gradient(135deg, #22c55e, #16a34a)" :
          "linear-gradient(135deg, #00ffff, #ff00ff)",
          boxShadow: spinning ? "none" : canSpinFree ? "0 0 20px rgba(34,197,94,0.4)" : "0 0 20px rgba(168,85,247,0.4)"
        }}>
        
        {spinning ?
        <><RefreshCw className="w-4 h-4 animate-spin" /> Rotation...</> :
        canSpinFree ?
        <><Gift className="w-4 h-4" /> LANCER GRATUIT</> :

        <><Sparkles className="w-4 h-4" /> LANCER ({formatBet(spinCost)})</>
        }
      </button>

      {/* Free spin status / countdown */}
      {!freeSpinAvailable && !spinning && nextResetAt &&
      <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(15,10,25,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Clock className="w-3 h-3 text-white/40" />
          <span className="text-[10px] text-white/50">Prochain lancer gratuit dans</span>
          <span className="text-[10px] font-bold" style={{ color: "#22c55e" }}>{formatTimeUntil(nextResetAt)}</span>
        </div>
      }

      {/* Balance + rewards table */}
      <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(197,160,89,0.15)" }}>
        <CasinoToken size={18} />
        <span className="text-sm font-mono font-black" style={{ color: "#C5A059" }}>{formatBet(balance)}</span>
        <span className="text-[9px] text-white/40 uppercase">Solde</span>
      </div>

      <div className="mt-3 px-4 py-2 rounded-xl w-full max-w-sm" style={{ background: "rgba(15,10,25,0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[10px] font-bold text-white/50 mb-1.5 text-center">Récompenses possibles :</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {segments.map((s, i) =>
          <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${s.color}30`, border: `1px solid ${s.glow}40`, color: s.glow }}>
              {/^https?:\/\//i.test(s.icon) ? <img src={bustImageCache(s.icon, gameConfig?.updated_date)} alt="" className="inline-block h-4 w-4 object-contain align-middle" /> : s.icon} {s.label}
            </span>
          )}
        </div>
      </div>

      {/* Rules summary */}
      <div className="mt-3 px-4 py-2 rounded-xl w-full max-w-sm text-center" style={{ background: "rgba(15,10,25,0.3)", border: "1px solid rgba(255,255,255,0.03)" }}>
        <p className="text-[9px] text-white/40 leading-relaxed">
          🎁 1 lancer gratuit par jour (reset à 12h00 UTC, non cumulable).
          <br />
          <Coins className="w-2.5 h-2.5 inline" /> Lancers supplémentaires : {formatBet(spinCost)} jetons par tour.
        </p>
      </div>
    </div>);

}