export function modText(value=''){return value.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#0*39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).trim();}
export function parseModDetails(html,id) {
  const val=label=>modText(html.match(new RegExp(`<b>\\s*(?:${label})\\s*</b>\\s*</div>\\s*<div class="table-cell">([\\s\\S]*?)</div>`,'i'))?.[1]||'');
  const description=modText(html.match(/medium-12 large-8 columns">[\s\S]*?<div class="top-line">([\s\S]*?)<\/div>/)?.[1]||'');
  const power=val('Power|Puissance')||description.match(/(?:power|puissance|puissance requise)\s*[:\-]\s*([\d.,]+(?:\s*[-–]\s*[\d.,]+)?)\s*(hp|cv|ps)?/i)?.[1]||description.match(/([\d.,]+(?:\s*[-–]\s*[\d.,]+)?)\s*(?:hp|cv|ps)\b/i)?.[1]||'';
  const numericPower=power.match(/[\d.,]+(?:\s*[-–]\s*[\d.,]+)?/)?.[0];
  const rating=html.match(/([\d.]+)&nbsp;\((\d+)\)/);
  const images=[...html.matchAll(/(?:src|href)="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"\s]*screenshot\d+\.(?:jpg|jpeg|png|webp)(?:\?[^"\s]*)?)"/gi)]
    .map(match=>match[1])
    .filter((value,index,items)=>items.indexOf(value)===index)
    .slice(0,12);
  const img=images[0]||html.match(/src="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"\s]*iconBig\.(?:jpg|png))"/i)?.[1]||null;
  const downloadUrl=html.match(/href="(https:\/\/cdn\d+\.giants-software\.com\/modHub\/storage\/[^"\s]*\.zip(?:\?[^"\s]*)?)"[^>]*>\s*DOWNLOAD/i)?.[1]||null;
  return {id,title:modText(html.match(/<h2[^>]*class="[^"]*title-label[^"]*"[^>]*>([\s\S]*?)<\/h2>/)?.[1]||'Mod FS25'),author:val('Author')||'Inconnu',brand:val('Manufacturer'),category:val('Category'),description,img,hdImg:images[0]||img,images:images.length?images:(img?[img]:[]),rating:Number(rating?.[1])||0,votes:Number(rating?.[2])||0,size:val('Size'),version:val('Version'),price:val('Price|Prix')||description.match(/(?:price|prix)\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim()||'',power:numericPower?`${numericPower} CV`:'',speed:val('Speed|Vitesse')||description.match(/(?:speed|vitesse)\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim()||'',downloadUrl,detailUrl:`https://www.farming-simulator.com/mod.php?mod_id=${id}&title=fs2025`,source:'live'};
}