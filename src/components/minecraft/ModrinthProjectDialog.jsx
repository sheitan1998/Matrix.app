import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, ExternalLink, FileArchive, Gamepad2, ImageIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getModrinthProject, getModrinthVersions } from "@/lib/modrinthApi";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "Taille inconnue";
  const units = ["o", "Ko", "Mo", "Go"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
}

export default function ModrinthProjectDialog({ hit, onOpenChange, preferredLoader, preferredVersion }) {
  const [project, setProject] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hit) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setProject(null);
    setVersions([]);

    Promise.all([
      getModrinthProject(hit.project_id, controller.signal),
      getModrinthVersions(hit.project_id, controller.signal),
    ])
      .then(([projectData, versionsData]) => {
        setProject(projectData);
        setVersions(versionsData);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [hit]);

  const compatibleVersions = useMemo(() => {
    const matching = versions.filter((version) => {
      const loaderMatches = !preferredLoader
        || version.loaders.some((loader) => loader.toLowerCase() === preferredLoader.toLowerCase());
      const versionMatches = !preferredVersion
        || version.game_versions.some((gameVersion) => gameVersion.startsWith(preferredVersion.replace(".x", "")));
      return loaderMatches && versionMatches && version.files.length > 0;
    });
    return (matching.length > 0 ? matching : versions.filter((version) => version.files.length > 0)).slice(0, 8);
  }, [preferredLoader, preferredVersion, versions]);

  if (!hit) return null;

  return (
    <Dialog open={Boolean(hit)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-emerald-300/20 bg-[#07100c]/95 p-0 text-white shadow-2xl shadow-emerald-950/60 backdrop-blur-2xl">
        <DialogHeader className="border-b border-white/10 p-5 pr-14">
          <div className="flex items-start gap-4 text-left">
            <ProjectImage src={project?.icon_url || hit.icon_url} title={hit.title} className="h-16 w-16 rounded-2xl" />
            <div className="min-w-0">
              <DialogTitle className="text-xl font-black sm:text-2xl">{hit.title}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-white/45">
                Par {hit.author} · {hit.project_type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex min-h-72 items-center justify-center gap-3 text-white/50" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-300" />
            Chargement de la fiche Modrinth…
          </div>
        )}

        {error && (
          <div className="m-5 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Impossible de charger cette fiche.</p>
              <p className="mt-1 text-red-100/70">{error}</p>
            </div>
          </div>
        )}

        {!loading && project && (
          <div className="space-y-6 p-5">
            {project.gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.gallery.slice(0, 6).map((image) => (
                  <a
                    key={image.url}
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-xl border border-white/10 bg-black/20"
                    aria-label={`Ouvrir l’image ${image.title || "de la galerie"}`}
                  >
                    <ProjectImage
                      src={image.url}
                      title={image.title || hit.title}
                      className="aspect-video h-full w-full rounded-none object-cover transition group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            )}

            <section>
              <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-white">Description complète</h3>
              <div className="rich-text-content overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/70">
                <ReactMarkdown
                  skipHtml
                  components={{
                    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
                    img: ({ alt, ...props }) => <img {...props} alt={alt || ""} loading="lazy" />,
                  }}
                >
                  {project.body || project.description}
                </ReactMarkdown>
              </div>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
                <Download className="h-4 w-4 text-emerald-300" />
                Téléchargements compatibles
              </h3>
              {compatibleVersions.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/40">
                  Aucun fichier téléchargeable n’est actuellement publié.
                </p>
              ) : (
                <div className="space-y-2">
                  {compatibleVersions.map((version) => {
                    const file = version.files.find((candidate) => candidate.primary) || version.files[0];
                    return (
                      <div key={version.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center">
                        <FileArchive className="h-5 w-5 shrink-0 text-emerald-300" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{version.name || version.version_number}</p>
                          <p className="mt-1 text-xs text-white/40">
                            Minecraft {version.game_versions.slice(0, 4).join(", ")}
                            {version.loaders.length > 0 && ` · ${version.loaders.join(", ")}`}
                            {` · ${formatBytes(file.size)}`}
                          </p>
                        </div>
                        <a
                          href={file.url}
                          download={file.filename}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-black text-black transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Download className="h-4 w-4" />
                          Télécharger
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="rounded-2xl border border-purple-300/20 bg-purple-500/10 p-4">
              <div className="flex items-start gap-3">
                <Gamepad2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-300" />
                <div>
                  <h3 className="font-black">Tutoriel & Installation associé</h3>
                  <p className="mt-1 text-sm text-white/55">
                    Retrouvez les guides d’installation MATRIX pour {hit.project_type === "shader" ? "les shaders" : preferredLoader || "les contenus Minecraft"}.
                  </p>
                  <Link
                    to="/tuto-gaming"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-purple-200 hover:text-white"
                  >
                    Guides & Tutos Gaming
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectImage({ src, title, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`grid place-items-center border border-white/10 bg-white/[0.04] ${className}`}>
        <ImageIcon className="h-6 w-6 text-white/25" aria-hidden="true" />
      </div>
    );
  }
  return <img src={src} alt={title} loading="lazy" className={className} onError={() => setFailed(true)} />;
}

