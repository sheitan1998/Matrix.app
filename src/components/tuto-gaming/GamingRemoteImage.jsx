import React,{useEffect,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Loader2} from 'lucide-react';
import {base44} from '@/api/base44Client';
export default function GamingRemoteImage({src,alt,className='',contain=true}){
  const ref=useRef(null);const [visible,setVisible]=useState(false);const [url,setUrl]=useState('');
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'200px'});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
  const {data,isFetching,isError,refetch}=useQuery({queryKey:['gaming-proxy-image',src],enabled:visible&&!!src,retry:false,staleTime:86400000,gcTime:600000,queryFn:async()=>{const response=await base44.functions.fetch('/proxyImage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:src})});if(!response.ok)throw new Error('Visuel indisponible');return response.blob();}});
  useEffect(()=>{setUrl('');if(!data)return;const objectUrl=URL.createObjectURL(data);setUrl(objectUrl);return()=>URL.revokeObjectURL(objectUrl);},[data,src]);
  return <div ref={ref} className={`relative overflow-hidden flex items-center justify-center bg-muted ${className}`}>{url?<img src={url} alt={alt} loading="lazy" className={`h-full w-full ${contain?'object-contain':'object-cover'}`}/>:isError?<span className="text-xs text-muted-foreground p-3">Visuel temporairement indisponible</span>:<span className="text-xs text-muted-foreground p-3">{isFetching?<Loader2 aria-label="Chargement du visuel" className="w-5 h-5 animate-spin"/>:!src?'Aucun visuel fourni par la source':''}</span>}</div>;
}