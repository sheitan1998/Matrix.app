import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getDofusFallback } from '@/components/tuto-gaming/dofusFallback';
export default function useDofusCatalogue(query) {
  const action=query.category==='monsters'?'getMonsters':query.category==='sets'?'getItemSets':'searchItems';
  return useQuery({queryKey:['dofus-catalogue',query],initialData:()=>getDofusFallback(query),retry:false,staleTime:0,queryFn:async()=>{
    try { const {data}=await base44.functions.invoke('dofusApi',{...query,action,lang:'fr'});if(data.error)throw new Error(data.error);return data; }
    catch {return {...getDofusFallback(query),message:'DofusDB est temporairement indisponible. Catalogue de référence affiché.'};}
  }});
}