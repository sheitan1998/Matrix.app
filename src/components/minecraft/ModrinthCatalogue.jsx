import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Download, Loader2, Search, Star, UserRound } from "lucide-react";
import { searchModrinth } from "@/lib/modrinthApi";
import ModrinthProjectDialog from "./ModrinthProjectDialog";

const TYPES = [
  { value: "", label: "Tous les types" },
  { value: "mod", label: "Mods" },
  { value: "modpack", label: "Modpacks" },
  { value: "shader", label: "Shaders" },
  { value: "resourcepack", label: "Packs de ressources" },
];
const LOADERS = ["Fabric", "Forge", "NeoForge", "Quilt"];
const VERSIONS = ["1.21.x", "1.20.x", "1.19.x", "1.18.x"];
const PAGE_SIZE = 12;

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
}

export default function ModrinthCatalogue() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [projectType, setProjectType] = useState("");
  const [loader, setLoader] = useState("");
  const [version, setVersion] = useState("1.21.x");
  const [hits, setHits] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [selectedHit, setSelectedHit] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setOffset(0);

    searchModrinth({
      query: debouncedQuery,
      projectType,
      loader,
      versionFamily: version,
      signal: controller.signal,
    })
      .then((result) => {
        if (currentRequest !== requestId.current) return;
        setHits(result.hits);
        setTotalHits(result.totalHits);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setHits([]);
          setTotalHits(0);
          setError(fetchError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && currentRequest === requestId.current) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, loader, projectType, version]);

  async function loadMore() {
    const nextOffset = offset + PAGE_SIZE;
    setLoadingMore(true);
    setError("");
    try {
      const result = await searchModrinth({
        query: debouncedQuery,
        projectType,
        loader,
        versionFamily: version,
        offset: nextOffset,
      });
      setHits((current) => [...current, ...result.hits]);
      setTotalHits(result.totalHits);
      setOffset(nextOffset);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <section aria-labelledby="catalogue-title">
        <div className="mb-5">
          <h2 id="catalogue-title" className="text-xl font-black text-white sm:text-2xl">Catalogue Modrinth en temps réel</h2>
          <p className="mt-1 text-sm text-white/45">Mods, modpacks, shaders et packs de ressources issus directement de Modrinth.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-emerald-300/15 bg-black/25 p-4 backdrop-blur-xl">
          <label className="relative block">
            <span className="sr-only">Rechercher sur Modrinth</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un mod, un modpack, un shader…"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/35 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/20"
            />
          </label>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Filter label="Type" value={projectType} onChange={setProjectType} options={TYPES} />
            <Filter
              label="Loader"
              value={loader}
              onChange={setLoader}
              options={[{ value: "", label: "Tous les loaders" }, ...LOADERS.map((value) => ({ value, label: value }))]}
            />
            <Filter
              label="Version Minecraft"
              value={version}
              onChange={setVersion}
              options={[{ value: "", label: "Toutes les versions" }, ...VERSIONS.map((value) => ({ value, label: value }))]}
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Le catalogue n’a pas pu être chargé.</p>
              <p className="mt-1 text-red-100/70">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-white/45" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-300" />
            Recherche sur Modrinth…
          </div>
        ) : hits.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-white/20" />
            <p className="mt-3 font-bold text-white/65">Aucun projet trouvé</p>
            <p className="mt-1 text-sm text-white/35">Essayez une autre recherche ou élargissez les filtres.</p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-white/35">{totalHits.toLocaleString("fr-FR")} résultats</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {hits.map((hit) => (
                <button
                  type="button"
                  key={hit.project_id}
                  onClick={() => setSelectedHit(hit)}
                  className="group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-emerald-300/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <div className="flex items-start gap-3">
                    <ProjectIcon hit={hit} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-black text-white">{hit.title}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                        <UserRound className="h-3 w-3" /> {hit.author}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-[9px] font-black uppercase text-emerald-200">
                      {TYPES.find((type) => type.value === hit.project_type)?.label || hit.project_type}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-white/55">{hit.description}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{formatNumber(hit.downloads)}</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{formatNumber(hit.follows)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {hit.categories.slice(0, 4).map((category) => (
                      <span key={category} className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[9px] text-white/45">{category}</span>
                    ))}
                    {hit.versions.slice(-2).map((gameVersion) => (
                      <span key={gameVersion} className="rounded-md border border-emerald-300/10 bg-emerald-300/[0.04] px-2 py-1 text-[9px] text-emerald-100/55">{gameVersion}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {hits.length < totalHits && (
              <div className="mt-7 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-300/20 disabled:opacity-50"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  Charger plus de projets
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ModrinthProjectDialog
        hit={selectedHit}
        onOpenChange={(open) => { if (!open) setSelectedHit(null); }}
        preferredLoader={loader}
        preferredVersion={version}
      />
    </>
  );
}

function Filter({ label, value, onChange, options }) {
  return (
    <label className="text-xs font-bold text-white/55">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#0a1510] px-3 text-sm text-white outline-none focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-300/20"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function ProjectIcon({ hit }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/30">
      {hit.icon_url && !failed
        ? <img src={hit.icon_url} alt="" loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} />
        : <span className="text-lg font-black text-emerald-300/60" aria-hidden="true">{hit.title.slice(0, 1)}</span>}
    </div>
  );
}

