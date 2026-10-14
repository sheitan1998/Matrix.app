import React, { useState } from 'react';
import { Download,Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
const isZip=url=>/^https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^\s]+\.zip(?:\?[^\s]*)?$/i.test(url||'');
export default function DownloadModButton({mod}) {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  async function download(e){e.stopPropagation();if(loading)return;setLoading(true);setError('');
    try{let url=mod.downloadUrl;if(!isZip(url)){const {data}=await base44.functions.invoke('farmingModApi',{action:'getModDetails',modId:mod.id});url=data.downloadUrl;}
      if(!isZip(url)){setError('Téléchargement direct indisponible sur le ModHub.');return;}window.location.assign(url);
    }catch{setError('Impossible de récupérer le téléchargement. Réessayez.');}finally{setLoading(false);}
  }
  return <div className="w-full"><button type="button" onClick={download} disabled={loading} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-50">{loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Download className="w-4 h-4"/>}Télécharger le Mod (.zip)</button>{error&&<p role="alert" className="text-xs text-destructive mt-2">{error}</p>}</div>;
}