import React from 'react';
import CatalogueImage from '@/components/tuto-gaming/CatalogueImage';
import { formatDofusEffect } from '@/components/tuto-gaming/dofusEffects';
export default function DofusItemCard({item,onClick}) {
  return <button onClick={onClick} className="flex flex-col text-left rounded-xl border bg-card text-card-foreground overflow-hidden hover:border-primary">
    <CatalogueImage src={item.img} alt={item.name} kind={item.category} className="aspect-square w-full p-3"/>
    <div className="p-3 space-y-2 w-full"><h2 className="font-semibold text-sm">{item.name}</h2><p className="text-xs text-muted-foreground">{item.type} {item.level>0&&`· Niveau ${item.level}`}</p>
      {item.effects?.slice(0,2).map((effect,i)=><p key={i} className="text-xs text-primary">{formatDofusEffect(effect)}</p>)}
      {item.recipes?.length>0&&<p className="text-xs text-muted-foreground line-clamp-2">Recette : {item.recipes.map(r=>`${r.quantity} × ${r.ingredientName}`).join(', ')}</p>}
      {item.hasRecipe&&!item.recipes?.length&&<p className="text-xs text-muted-foreground">Voir la recette</p>}
    </div>
  </button>;
}