export function normalizeRocketRanks(segments) {
  const modes=[{id:10,label:'1v1',pattern:/duel|1v1/i},{id:11,label:'2v2',pattern:/double|2v2/i},{id:13,label:'3v3',pattern:/standard|3v3/i}];
  const ranked=segments.filter(s=>['playlist','RankedSeason','ranked'].includes(s.type));
  return modes.map(mode=>{const matches=ranked.filter(s=>Number(s.attributes?.playlistId)===mode.id||mode.pattern.test(s.metadata?.name||''));const s=matches.sort((a,b)=>Number(b.attributes?.season||0)-Number(a.attributes?.season||0))[0];return {playlist:mode.label,rank:s?.stats?.tier?.metadata?.name||s?.stats?.rating?.metadata?.rankName||s?.metadata?.rankName||(s?'Non classé':'Indisponible'),division:s?.stats?.division?.metadata?.name||s?.metadata?.divisionName||'',rating:s?.stats?.rating?.value||0};});
}