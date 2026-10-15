export async function captureDofusStuff(element,html2canvas) {
  if(!element||typeof html2canvas!=='function')throw new TypeError('Fiche de stuff indisponible.');
  if(element.querySelector('img[data-export-error="true"]'))throw new Error('Un visuel distant n’a pas pu être chargé.');
  const canvas=await html2canvas(element,{
    backgroundColor:'#09090b',
    scale:Math.min(3,Math.max(2,window.devicePixelRatio||1)),
    useCORS:true,
    allowTaint:false,
    imageTimeout:10000,
    logging:false,
  });
  const blob=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('L’encodage PNG a expiré.')),5000);
    canvas.toBlob(value=>{clearTimeout(timeout);value?resolve(value):reject(new Error('Image PNG vide.'));},'image/png',1);
  });
  return blob;
}

export function downloadDofusStuff(blob,name='stuff-dofus') {
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=`${name.replace(/[^a-z0-9-_]/gi,'-')||'stuff-dofus'}.png`;
  anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
