import { createApiCache } from './apiCache.ts';
import { parseModDetails } from './farmingModDetails.ts';


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

export async function fetchGiants(url,{range,ifRange,timeout=20000}={}){
  let target=allowedGiantsUrl(url);
  for(let i=0;i<3;i++){
    const response=await fetch(target,{
      headers:{'User-Agent':'Mozilla/5.0',Referer:'https://www.farming-simulator.com/',Accept:'*/*',...(range?{Range:range}:{}),...(ifRange?{'If-Range':ifRange}:{})},
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
  if(mod.title==='Mod FS25')throw new Error('Ce mod est introuvable sur le ModHub.');
  setCached(id,mod);
  return mod;
}

// Resolve metadata only. Do not fetch or probe the ZIP before a native download.
export async function resolveGiantsDownload(modId, knownUrl){
  const id=String(modId);
  if(!/^\d{1,10}$/.test(id))throw new Error('Identifiant du mod invalide.');
  const downloadUrl=knownUrl||(await getGiantsMod(id)).downloadUrl;
  if(!downloadUrl)throw new Error('GIANTS ne propose pas de ZIP PC pour ce mod.');
  const url=allowedGiantsUrl(downloadUrl);
  if(!/\/FS25_[^/]+\.zip$/i.test(url.pathname)||!url.pathname.includes(`/storage/${id.padStart(8,'0')}/`))throw new Error('Archive FS25 non correspondante.');
  return{filename:decodeURIComponent(url.pathname.split('/').pop()).replace(/[^a-zA-Z0-9_.-]/g,'_'),url:url.href,size:null};
}

export async function probeGiantsDownload(modId){
  const file=await resolveGiantsDownload(modId);
  const response=await fetchGiants(file.url,{range:'bytes=0-3'});
  if(!response.ok||!response.body){await response.body?.cancel();throw new Error(`Archive indisponible (${response.status}).`);}
  const size=Number(response.headers.get('content-range')?.split('/').pop()||response.headers.get('content-length'))||null;
  const reader=response.body.getReader();
  const bytes=[];
  while(bytes.length<4){const {done,value}=await reader.read();if(done)break;bytes.push(...value.subarray(0,4-bytes.length));}
  await reader.cancel();
  if(bytes[0]!==80||bytes[1]!==75||!((bytes[2]===3&&bytes[3]===4)||(bytes[2]===5&&bytes[3]===6)))throw new Error('La source ne renvoie pas une archive ZIP valide.');
  if(size&&size>MAX_GIANTS_ZIP_BYTES)throw new Error('Ce ZIP dépasse la limite de téléchargement de 2 Gio.');
  return{...file,size};
}