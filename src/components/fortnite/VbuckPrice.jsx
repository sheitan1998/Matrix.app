import React from 'react';

export default function VbuckPrice({ item, compact = false }) {
  if (item.price === undefined || item.price === null) return null;
  return <span className={`inline-flex items-center gap-1.5 font-black text-foreground ${compact ? 'text-xs' : 'text-lg'}`}>
    <img src={item.vbuck_icon || 'https://fortnite-api.com/images/vbuck.png'} alt="V-Bucks" className={compact ? 'h-4 w-4' : 'h-6 w-6'} />
    <span>{Number(item.price).toLocaleString('fr-FR')}</span>
    {item.regular_price > item.price && <del className="text-xs font-normal text-muted-foreground">{Number(item.regular_price).toLocaleString('fr-FR')}</del>}
  </span>;
}