import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TrixCounter — floating balance counter visible during casino games.
 * Animates whenever the balance changes.
 */
export default function TrixCounter({ balance }) {
  const prevRef = useRef(balance);
  const [delta, setDelta] = useState(null);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    const diff = balance - prevRef.current;
    if (diff !== 0) {
      setDelta(diff);
      setAnim(true);
      const t = setTimeout(() => { setDelta(null); setAnim(false); }, 1800);
      prevRef.current = balance;
      return () => clearTimeout(t);
    }
  }, [balance]);

  const isUp = delta !== null && delta > 0;

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Delta pop */}
      <AnimatePresence>
        {delta !== null && (
          <motion.span
            key={delta}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -28, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute -top-6 right-0 font-mono font-black text-sm pointer-events-none z-50 whitespace-nowrap"
            style={{ color: isUp ? "#44ff88" : "#ff5555", textShadow: `0 0 8px ${isUp ? "#44ff88" : "#ff4444"}` }}>
            {isUp ? "+" : ""}{delta.toLocaleString()}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Main badge */}
      <motion.div
        animate={anim ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
        style={{
          background: anim
            ? isUp ? "rgba(68,255,136,0.15)" : "rgba(255,68,68,0.15)"
            : "rgba(255,215,0,0.07)",
          border: `1px solid ${anim ? (isUp ? "rgba(68,255,136,0.4)" : "rgba(255,68,68,0.3)") : "rgba(255,215,0,0.3)"}`,
          transition: "background 0.4s, border 0.4s",
        }}>
        <span className="text-base leading-none">🪙</span>
        <span className="text-sm font-mono font-black" style={{ color: "#ffd700" }}>
          {balance.toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}