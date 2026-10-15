import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';

const STALE_TIME=10*60*1000;

/** @returns {Promise<any>} */
async function invokeDofus(action,payload,signal){
  if(signal?.aborted)throw new DOMException('Requête annulée','AbortError');
  const {data}=await base44.functions.invoke('dofusApi',{action,lang:'fr',...payload});
  if(signal?.aborted)throw new DOMException('Requête annulée','AbortError');
  if(data?.error)throw new Error(data.error);
  return /** @type {any} */ (data);
}

export function useDofusProgressionFilters(){
  return /** @type {import('@tanstack/react-query').UseQueryResult<any, Error>} */ (useQuery({
    queryKey:['dofus-progression-filters'],
    staleTime:24*60*60*1000,
    retry:false,
    queryFn:({signal})=>invokeDofus('getProgressionFilters',{},signal),
  }));
}

export function useDofusAchievements(filters){
  return /** @type {import('@tanstack/react-query').UseQueryResult<any, Error>} */ (useQuery({
    queryKey:['dofus-achievements',filters],
    staleTime:STALE_TIME,
    retry:false,
    placeholderData:previous=>previous,
    queryFn:({signal})=>invokeDofus('getAchievements',filters,signal),
  }));
}

export function useDofusAchievementDetails(id){
  return /** @type {import('@tanstack/react-query').UseQueryResult<any, Error>} */ (useQuery({
    queryKey:['dofus-achievement',id],
    enabled:Number.isInteger(id)&&id>0,
    staleTime:STALE_TIME,
    retry:false,
    queryFn:({signal})=>invokeDofus('getAchievementDetails',{id},signal),
  }));
}

export function useDofusQuests(filters){
  return /** @type {import('@tanstack/react-query').UseQueryResult<any, Error>} */ (useQuery({
    queryKey:['dofus-quests',filters],
    staleTime:STALE_TIME,
    retry:false,
    placeholderData:previous=>previous,
    queryFn:({signal})=>invokeDofus('getQuests',filters,signal),
  }));
}

export function useDofusQuestDetails(id){
  return /** @type {import('@tanstack/react-query').UseQueryResult<any, Error>} */ (useQuery({
    queryKey:['dofus-quest',id],
    enabled:Number.isInteger(id)&&id>0,
    staleTime:STALE_TIME,
    retry:false,
    queryFn:({signal})=>invokeDofus('getQuestDetails',{id},signal),
  }));
}

export function useDofusQuestPrerequisites(id){
  return /** @type {import('@tanstack/react-query').UseQueryResult<any, Error>} */ (useQuery({
    queryKey:['dofus-quest-prerequisites',id],
    enabled:Number.isInteger(id)&&id>0,
    staleTime:STALE_TIME,
    retry:false,
    queryFn:({signal})=>invokeDofus('getQuestPrerequisites',{id},signal),
  }));
}
