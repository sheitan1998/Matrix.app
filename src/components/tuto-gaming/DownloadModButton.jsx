import React, { useState } from 'react';
import { Download,Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {startNativeModDownload} from '@/components/tuto-gaming/nativeModDownload';
export default function DownloadModButton({mod}) {
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  async function download(e){e.stopPropagation();if(loading)return;setLoading(true);setError('');
    try{const {data}=await base44.functions.invoke('farmingModApi',{action:'prepareDownload',modId:mod.id});if(data.error){setError(data.error);return;}startNativeModDownload(data.endpoint,mod.id);
    }catch{setError('Impossible de démarrer le téléchargement interne. Réessayez.');}finally{setLoading(false);}
  }
  return <div className="w-full"><button type="button" onClick={download} disabled={loading} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-50">{loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Download className="w-4 h-4"/>}Télécharger le Mod (.zip)</button>{error&&<p role="alert" className="text-xs text-destructive mt-2">{error}</p>}</div>;
}