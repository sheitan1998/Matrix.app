import React from 'react';

export default function RocketLeagueVariantSelector({
  variants = [],
  value,
  onChange,
  label = 'Peinture',
}) {
  if (variants.length < 2) return null;
  return (
    <fieldset className="space-y-2" onClick={event => event.stopPropagation()}>
      <legend className="text-xs font-semibold text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map(variant => {
          const selected = variant.paint_id === value;
          return (
            <button
              key={variant.paint_id}
              type="button"
              aria-label={`${label} ${variant.color_name}`}
              aria-pressed={selected}
              title={variant.color_name}
              onClick={() => onChange(variant.paint_id)}
              className={`h-7 w-7 rounded-full border-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                selected ? 'border-white ring-2 ring-primary' : 'border-slate-500'
              }`}
              style={{ backgroundColor: variant.color_hex }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
