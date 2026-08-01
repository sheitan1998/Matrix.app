import React from "react";

export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Deep space base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0D0518 0%, #1A0B2E 30%, #2D1B4E 60%, #1A0B2E 100%)",
        }}
      />

      {/* Nebula radial glows */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 600px 400px at 15% 25%, rgba(74,20,140,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 500px 300px at 85% 60%, rgba(191,90,242,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 400px 300px at 50% 85%, rgba(255,215,0,0.04) 0%, transparent 70%)
          `,
        }}
      />

      {/* Energy filament grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(191,90,242,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(191,90,242,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Stars */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.3), transparent),
            radial-gradient(2px 2px at 70% 40%, rgba(191,90,242,0.3), transparent),
            radial-gradient(1px 1px at 90% 90%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 10% 60%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 45% 15%, rgba(255,255,255,0.2), transparent)
          `,
        }}
      />
    </div>
  );
}