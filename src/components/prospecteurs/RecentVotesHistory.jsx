import React, { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RecentVotesTable from "./RecentVotesTable";
import VotesPagination from "./VotesPagination";

const PAGE_SIZE = 20;

export default function RecentVotesHistory({ serverId }) {
  const [votes, setVotes] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reqId = useRef(0);
  const pageRef = useRef(0);

  // Only the latest request may update the table; a failed or stale response never clears it
  const load = useCallback(async (targetPage, silent = false) => {
    const id = ++reqId.current;
    if (!silent) setLoading(true);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "getRecentVotes", serverAdId: serverId, page: targetPage, pageSize: PAGE_SIZE });
      const data = res.data || {};
      if (id !== reqId.current || !Array.isArray(data.votes)) return;
      setVotes(data.votes);
      setHasMore(!!data.has_more);
      setPage(targetPage);
      pageRef.current = targetPage;
      setError(false);
    } catch {
      if (id === reqId.current) setError(true);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    load(0);
    let debounce;
    const unsub = base44.entities.ServerVote.subscribe((event) => {
      if (event.data?.server_ad_id !== serverId) return;
      clearTimeout(debounce);
      debounce = setTimeout(() => load(pageRef.current, true), 1500);
    });
    const interval = setInterval(() => load(pageRef.current, true), 30000);
    return () => { unsub(); clearTimeout(debounce); clearInterval(interval); };
  }, [load, serverId]);

  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <Activity className="w-3 h-3" /> Votes récents
        {loading && votes.length > 0 && <Loader2 className="w-3 h-3 animate-spin text-purple-400 ml-auto" />}
      </label>
      {votes.length > 0 ? (
        <>
          <RecentVotesTable votes={votes} dimmed={loading} />
          <VotesPagination page={page} hasMore={hasMore} disabled={loading} onChange={(p) => load(p)} />
        </>
      ) : loading ? (
        <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-purple-400" /></div>
      ) : error ? (
        <button onClick={() => load(pageRef.current)} className="w-full py-4 text-[10px] text-red-400 flex items-center justify-center gap-1 tap-sm">
          <RefreshCw className="w-3 h-3" /> Chargement impossible — Réessayer
        </button>
      ) : (
        <div className="text-center py-4 text-[10px] text-white/30">Aucun vote enregistré</div>
      )}
    </div>
  );
}