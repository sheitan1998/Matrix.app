import { createApiCache } from './apiCache.ts';
import { parseModDetails } from './farmingModDetails.ts';
import { FARMING_FALLBACK_SHARED } from './farmingFallback.ts';

const {getCached,setCached}=createApiCache(100);
export const MAX_GIANTS_IMAGE_BYTES=5*1024*1024;
export const MAX_GIANTS_ZIP_BYTES=2*1024*1024*1024;
export const GIANTS_CDN_HOSTS=['cdn25','cdn26','cdn27','cdn40','cdn45'];

export function allowedGiantsUrl(value){
  const url=new URL(value);
  const path=decodeURIComponent(url.pathname);
  if(url.protocol!=='https:'||url.username||url.password||url.port||!/^cdn\d{1,3}\.giants-software\.com$/i.test(url.hostname)||!/^\/modHub\/storage\/\d{8}\/[a-zA-Z0-9_.()-]+$/.test(url.pathname)||path.includes('..')||path.includes('\\'))
    throw new Error('Adresse GIANTS non autorisée.');
  return url;
}

export async function fetchGiants(url,{range,timeout=20000}={}){
  let target=allowedGiantsUrl(url);
  for(let i=0;i<3;i++){
    const response=await fetch(target,{
      headers:{'User-Agent':'Mozilla/5.0',Referer:'https://www.farming-simulator.com/',Accept:'*/*',...(range?{Range:range}:{})},
      redirect:'manual',
      signal:AbortSignal.timeout(timeout)
    });
    if(![301,302,303,307,308].includes(response.status))return response;
    const next=response.headers.get('location');
    await response.body?.cancel();
    if(!next)throw new Error('Redirection GIANTS invalide.');
    target=allowedGiantsUrl(new URL(next,target).href);
  }
  throw new Error('Trop de redirections GIANTS.');
}

export async function getGiantsMod(modId){
  const id=String(modId);
  if(!/^\d{1,10}$/.test(id))throw new Error('Identifiant du mod invalide.');
  const cached=getCached(id,3600000);
  if(cached)return cached;
  const response=await fetch(`https://www.farming-simulator.com/mod.php?mod_id=${id}&title=fs2025&lang=en`,{
    headers:{'User-Agent':'Mozilla/5.0',Accept:'text/html',Referer:'https://www.farming-simulator.com/'},
    signal:AbortSignal.timeout(15000)
  });
  if(!response.ok)throw new Error('Le ModHub ne répond pas.');
  const mod=parseModDetails(await response.text(),id);
  setCached(id,mod);
  return mod;
}

function getFallbackDownloadUrl(modId){
  const mod=FARMING_FALLBACK_SHARED.find(m=>String(m.id)===String(modId));
  return mod?.downloadUrl||null;
}

export async function probeGiantsDownload(modId){
  const id=String(modId);
  let mod=null;
  let downloadUrl=null;

  // 1. Try live ModHub page
  try{
    mod=await getGiantsMod(id);
    downloadUrl=mod.downloadUrl;
  }catch{
    // ModHub page failed (502 etc.) — continue to fallback
  }

  // 2. Fallback: use direct CDN URL from reference data
  if(!downloadUrl){
    downloadUrl=getFallbackDownloadUrl(id);
  }

  if(!downloadUrl)throw new Error('Fichier ZIP non disponible. Le ModHub est injoignable.');

  const url=allowedGiantsUrl(downloadUrl);
  if(!/\.zip$/i.test(url.pathname))throw new Error('Format de téléchargement non autorisé.');

  // 3. Probe the ZIP
  try{
    const response=await fetchGiants(url.href,{range:'bytes=0-3'});
    if(!response.ok){
      await response.body?.cancel();
      throw new Error(`Téléchargement indisponible (${response.status}).`);
    }
    const size=Number(response.headers.get('content-range')?.split('/').pop()||response.headers.get('content-length'))||null;
    if(size&&size>MAX_GIANTS_ZIP_BYTES){
      await response.body?.cancel();
      throw new Error('Ce ZIP dépasse la limite de téléchargement de 2 Gio.');
    }
    const reader=response.body.getReader();
    const first=await reader.read();
    await reader.cancel();
    const bytes=first.value;
    if(!bytes||bytes[0]!==80||bytes[1]!==75)throw new Error('Le serveur ne renvoie pas un fichier ZIP.');
    return{
      filename:decodeURIComponent(url.pathname.split('/').pop()).replace(/[^a-zA-Z0-9_.-]/g,'_'),
      url:url.href,
      size
    };
  }catch(probeError){
    // Probe failed but we still have the URL — return it so the client can try directly
    return{
      filename:decodeURIComponent(url.pathname.split('/').pop()).replace(/[^a-zA-Z0-9_.-]/g,'_'),
      url:url.href,
      size:null,
      probeError:probeError instanceof Error?probeError.message:'Vérification impossible.'
    };
  }
}