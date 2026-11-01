import React from 'react';

export default function FarmingModPlaceholder({ modTitle, brand }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-card p-3 text-center text-primary" aria-hidden="true">
      <span className="rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 shadow-glow">
        <span className="block text-sm font-black tracking-widest">MATRIX</span>
        <span className="block text-2xl font-black">FS25</span>
      </span>
      {modTitle && <span className="mt-2 line-clamp-2 text-[10px] font-bold">{modTitle}</span>}
      {brand && brand !== 'none' && <span className="text-[9px] text-muted-foreground">{brand}</span>}
    </div>
  );
}