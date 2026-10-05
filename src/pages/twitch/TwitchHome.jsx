import { useSearchParams } from "react-router-dom";
import { useTwitchAuth } from "@/context/TwitchAuthContext";
import { useTwitch } from "@/hooks/useTwitch";
import TwitchStreamCard from "@/components/twitch/TwitchStreamCard";
import TwitchCategoryCard from "@/components/twitch/TwitchCategoryCard";
import TwitchChannelPanel from "@/components/twitch/TwitchChannelPanel";
import TwitchChatEmbed from "@/components/twitch/TwitchChatEmbed";
import TwitchActivityFeed from "@/components/twitch/TwitchActivityFeed";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

const SUB_TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "mychannel", label: "Ma Chaîne" },
  { id: "live", label: "Live" },
  { id: "videos", label: "Vidéos" },
  { id: "categories", label: "Catégories" },
  { id: "channels", label: "Chaînes" },
];

function SectionError({ message }) {
  return (
    <div className="flex items-center gap-2 p-4 rounded-xl bg-[#161321] border border-[#2a2a3e] text-[#a0a0b0] text-sm">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-[#2a2a3e] text-center">
      <p className="text-white font-semibold text-sm">{title}</p>
      {subtitle && <p className="text-[#a0a0b0] text-xs">{subtitle}</p>}
    </div>
  );
}

export default function TwitchHome() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "suivis";
  const [subTab, setSubTab] = useState(searchParams.get("view") || "overview");
  const { isAuthenticated, userToken, login } = useTwitchAuth();

  // Followed streams (if authenticated)
  const followedStreams = useTwitch("getFollowedStreams", { userToken }, {
    enabled: !!userToken,
  });

  // Recommended streams (top streams)
  const topStreams = useTwitch("getStreams", { first: 5 });
  const allStreams = useTwitch("getStreams", { first: 20 });

  // Top categories
  const topCategories = useTwitch("getTopGames", { first: 30 });

  const followed = followedStreams.data?.streams || [];
  const recommended = topStreams.data?.streams || [];
  const browseStreams = allStreams.data?.streams || [];
  const categories = topCategories.data?.categories || [];

  const hasError = topStreams.error || allStreams.error;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {tab === "suivis" ? (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Suivis</h1>
            <p className="text-[#a0a0b0] text-sm mt-1">Les signaux de vos chaînes suivies, quelque part dans la galaxie</p>
          </div>

          {/* Sub-tab filters */}
          <div className="flex items-center gap-1 mb-6 border-b border-[#2a2a3e] overflow-x-auto no-scrollbar">
            {SUB_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                className={`px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative tap-sm ${
                  subTab === t.id ? "text-white" : "text-[#a0a0b0] hover:text-white"
                }`}
              >
                {t.label}
                {subTab === t.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#db2777] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Content based on sub-tab */}
          {subTab === "overview" && (
            <div className="flex flex-col gap-8">
              {/* Chaînes live (followed) */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Chaînes live</h2>
                {!isAuthenticated ? (
                  <EmptyState
                    title="Connectez votre compte Twitch"
                    subtitle="Connectez-vous pour voir les chaînes que vous suivez en direct"
                  />
                ) : followedStreams.isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0]" /></div>
                ) : followed.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {followed.map((s) => <TwitchStreamCard key={s.id} stream={s} />)}
                  </div>
                ) : (
                  <EmptyState title="Aucune chaîne suivie en direct" subtitle="Les chaînes que vous suivez ne sont pas en direct pour le moment" />
                )}
              </section>

              {/* Chaînes recommandées */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Chaînes recommandées</h2>
                {topStreams.isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0]" /></div>
                ) : hasError ? (
                  <SectionError message="Impossible de charger les streams. La configuration Twitch est manquante ou invalide." />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {recommended.map((s) => <TwitchStreamCard key={s.id} stream={s} />)}
                  </div>
                )}
              </section>

              {/* Vidéos les plus récentes */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Vidéos les plus récentes</h2>
                <EmptyState title="Aucune vidéo" subtitle="Les rediffusions apparaîtront ici" />
              </section>

              {/* Catégories live */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Catégories live</h2>
                {topCategories.isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0]" /></div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {categories.map((c) => <TwitchCategoryCard key={c.id} category={c} square />)}
                  </div>
                )}
              </section>
            </div>
          )}

          {subTab === "mychannel" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <TwitchChannelPanel />
                <TwitchChatEmbed />
              </div>
              <div className="space-y-4">
                <TwitchActivityFeed />
              </div>
            </div>
          )}

          {subTab === "live" && (
            <div>
              {topStreams.isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0]" /></div>
              ) : hasError ? (
                <SectionError message="Impossible de charger les streams." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {browseStreams.map((s) => <TwitchStreamCard key={s.id} stream={s} />)}
                </div>
              )}
            </div>
          )}

          {subTab === "categories" && (
            <div>
              {topCategories.isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0]" /></div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {categories.map((c) => <TwitchCategoryCard key={c.id} category={c} />)}
                </div>
              )}
            </div>
          )}

          {(subTab === "videos" || subTab === "channels") && (
            <EmptyState title="Bientôt disponible" subtitle="Cette section est en cours de développement" />
          )}
        </>
      ) : (
        /* Parcourir tab */
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Parcourir</h1>
          <p className="text-[#a0a0b0] text-sm mb-6">Découvrez les streams en direct dans la galaxie</p>

          {allStreams.isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0]" /></div>
          ) : hasError ? (
            <SectionError message="Impossible de charger les streams. La configuration Twitch est manquante ou invalide." />
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-3">Streams en direct</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
                {browseStreams.map((s) => <TwitchStreamCard key={s.id} stream={s} />)}
              </div>

              <h2 className="text-lg font-bold text-white mb-3">Catégories populaires</h2>
              {topCategories.isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#a0a0b0]" /></div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {categories.map((c) => <TwitchCategoryCard key={c.id} category={c} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}