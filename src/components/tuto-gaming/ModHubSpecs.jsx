import React from 'react';
export default function ModHubSpecs({mod}) {
  const values=[['Marque',mod.brand&&!/^none$/i.test(mod.brand)?mod.brand:'Sans marque renseignée'],['Puissance',mod.power||'Non renseignée / non applicable'],['Prix en jeu',mod.price||'Non renseigné / non applicable'],['Vitesse',mod.speed],['Taille',mod.size],['Version',mod.version]];
  return <section><h3 className="font-semibold mb-3">Caractéristiques</h3><dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">{values.filter(([,v])=>v).map(([label,value])=><div key={label} className="bg-muted rounded-lg p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-sm font-semibold mt-1">{value}</dd></div>)}</dl></section>;
}