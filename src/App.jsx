import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import PageLoader from '@/components/PageLoader';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LanguageBridge from '@/components/profile/LanguageBridge';
import AuthGate from '@/components/AuthGate';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthCallback from '@/pages/OAuthCallback';
import OAuthConsent from '@/pages/OAuthConsent';
// Layout & app shell — eager (rendered immediately after auth)
import MainLayout from '@/components/layout/MainLayout';
import BottomTabs from '@/components/layout/BottomTabs';
import AnimatedRoutes from '@/components/layout/AnimatedRoutes';
import GlobalProfileButton from '@/components/profile/GlobalProfileButton';
import GlobalMessageButton from '@/components/messaging/GlobalMessageButton';
import TwitchLayout from '@/components/twitch/TwitchLayout';
import TutoGamingLayout from '@/components/tuto-gaming/TutoGamingLayout';
import { ProgressionProvider } from '@/context/ProgressionContext';
import { MiniPlayerProvider } from '@/context/MiniPlayerContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { VoiceProvider } from '@/context/VoiceContext';
import PersistentVoicePanel from '@/components/community/PersistentVoicePanel';
import { usePresence } from '@/hooks/usePresence';

// Pages — lazy-loaded (code-split per route for instant initial bundle)
const AIStudio = lazy(() => import('@/pages/AIStudio'));
const AISubscription = lazy(() => import('@/pages/AISubscription'));
const Playlists = lazy(() => import('@/pages/Playlists'));
const Landing = lazy(() => import('@/pages/Landing'));
const Home = lazy(() => import('@/pages/Home'));
const Trending = lazy(() => import('@/pages/Trending'));
const LiveHub = lazy(() => import('@/pages/LiveHub'));
const Subscriptions = lazy(() => import('@/pages/Subscriptions'));
const Category = lazy(() => import('@/pages/Category'));
const Search = lazy(() => import('@/pages/Search'));
const Watch = lazy(() => import('@/pages/Watch'));
const Live = lazy(() => import('@/pages/Live'));
const Channel = lazy(() => import('@/pages/Channel'));
const Premium = lazy(() => import('@/pages/Premium'));
const TrixStore = lazy(() => import('@/pages/TrixStore'));
const Upload = lazy(() => import('@/pages/Upload'));
const StudioSetup = lazy(() => import('@/pages/StudioSetup'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Community = lazy(() => import('@/pages/community/Community'));
const Shorts = lazy(() => import('@/pages/Shorts'));
const Marketplace = lazy(() => import('@/pages/marketplace/Marketplace'));
const MarketHome = lazy(() => import('@/pages/marketplace/MarketHome'));
const MarketSubscription = lazy(() => import('@/pages/marketplace/MarketSubscription'));
const ListingDetail = lazy(() => import('@/pages/marketplace/ListingDetail'));
const Casino = lazy(() => import('@/pages/Casino'));
const NexusGames = lazy(() => import('@/pages/NexusGames'));
const Prospecteurs = lazy(() => import('@/pages/prospecteurs/Prospecteurs'));
const ServerProfile = lazy(() => import('@/pages/prospecteurs/ServerProfile'));
const CommunitySubscription = lazy(() => import('@/pages/community/CommunitySubscription'));
const Wallet = lazy(() => import('@/pages/Wallet'));
const VideoStudio = lazy(() => import('@/pages/VideoStudio'));
const Progression = lazy(() => import('@/pages/Progression'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Outils = lazy(() => import('@/pages/Outils'));
const Sondages = lazy(() => import('@/pages/Sondages'));
const MonProfil = lazy(() => import('@/pages/MonProfil'));
const BoutiqueMatrix = lazy(() => import('@/pages/BoutiqueMatrix'));
const AffiliateDashboard = lazy(() => import('@/pages/AffiliateDashboard'));
const BoutiqueNexus = lazy(() => import('@/pages/BoutiqueNexus'));
const NexusInvite = lazy(() => import('@/pages/NexusInvite'));
const CreatorProfile = lazy(() => import('@/pages/CreatorProfile'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));
const RechercheJoueur = lazy(() => import('@/pages/prospecteurs/RechercheJoueur'));
const CreatorSearch = lazy(() => import('@/pages/prospecteurs/CreatorSearch'));
const CreatorDetail = lazy(() => import('@/pages/prospecteurs/CreatorDetail'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const TutoGamingHub = lazy(() => import('@/pages/tuto-gaming/TutoGamingHub'));
const GameDetailPage = lazy(() => import('@/pages/tuto-gaming/GameDetailPage'));
const QuestDetailPage = lazy(() => import('@/pages/tuto-gaming/QuestDetailPage'));
const WikiEntryDetailPage = lazy(() => import('@/pages/tuto-gaming/WikiEntryDetailPage'));
const FarmingSimulator25 = lazy(() => import('@/pages/tuto-gaming/FarmingSimulator25'));
const FarmingSimCategory = lazy(() => import('@/pages/tuto-gaming/FarmingSimCategory'));
const FarmingMods = lazy(() => import('@/pages/tuto-gaming/FarmingMods'));
const FortniteMaps = lazy(() => import('@/pages/tuto-gaming/FortniteMaps'));
const DynamicPage = lazy(() => import('@/pages/DynamicPage'));
const TwitchHome = lazy(() => import('@/pages/twitch/TwitchHome'));
const TwitchWatch = lazy(() => import('@/pages/twitch/TwitchWatch'));
const TwitchSearch = lazy(() => import('@/pages/twitch/TwitchSearch'));
const TwitchCategoryPage = lazy(() => import('@/pages/twitch/TwitchCategoryPage'));
const TwitchCallback = lazy(() => import('@/pages/twitch/TwitchCallback'));
const TwitchChannelPage = lazy(() => import('@/pages/twitch/TwitchChannelPage'));

// Updater — eager (runs on startup)
import UpdateModal from '@/components/UpdateModal';
import { checkForUpdates } from '@/lib/updater';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const [updateInfo, setUpdateInfo] = useState(null);
  usePresence();

  // Setup automatic update checking
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const update = await checkForUpdates();
        if (update?.available) {
          console.log("Mise à jour disponible:", update);
          setUpdateInfo(update);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des mises à jour:", error);
      }
    };

    // Vérifier les mises à jour au démarrage
    checkUpdates();

    // Puis vérifier toutes les heures
    const intervalId = setInterval(checkUpdates, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-9 h-9 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <LanguageBridge />
      <ProgressionProvider>
      <NotificationProvider>
      <MiniPlayerProvider>
      <VoiceProvider>
      <AnimatedRoutes>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/oauth" element={<Navigate to="/oauth/callback" replace />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />
        <Route path="/nexus/invite/:code" element={<NexusInvite />} />
        <Route path="/servers/:slug" element={<ServerProfile />} />
        <Route path="/creator/:username" element={<CreatorProfile />} />
        <Route path="/page/:slug" element={<DynamicPage />} />
        <Route path="/" element={<Landing />} />
        <Route element={<TutoGamingLayout />}>
          <Route path="/tuto-gaming" element={<TutoGamingHub />} />
          <Route path="/tuto-gaming/:gameSlug" element={<GameDetailPage />} />
          <Route path="/tuto-gaming/:gameSlug/quest/:questId" element={<QuestDetailPage />} />
          <Route path="/tuto-gaming/:gameSlug/wiki/:entryId" element={<WikiEntryDetailPage />} />
          <Route path="/tuto-gaming/farming-simulator-25" element={<FarmingSimulator25 />} />
          <Route path="/tuto-gaming/farming-simulator-25/mods" element={<FarmingMods />} />
          <Route path="/tuto-gaming/farming-simulator-25/:categoryId" element={<FarmingSimCategory />} />
          <Route path="/tuto-gaming/fortnite" element={<FortniteMaps />} />
        </Route>
        <Route element={<ProtectedRoute unauthenticatedElement={<AuthGate />} />}>
          <Route path="/community" element={<Community />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/market" element={<MarketHome />} />
        <Route path="/market/browse" element={<Marketplace />} />
        <Route path="/market/subscription" element={<MarketSubscription />} />
        <Route path="/market/:id" element={<ListingDetail />} />

        <Route path="/casino" element={<Casino />} />
        <Route path="/nexus-games" element={<NexusGames />} />
        <Route path="/prospecteurs" element={<Prospecteurs />} />
        <Route path="/community/subscription" element={<CommunitySubscription />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/trix-store" element={<TrixStore />} />
          <Route path="/ai" element={<AIStudio />} />
          <Route path="/ai/subscription" element={<AISubscription />} />
          <Route path="/video-studio" element={<VideoStudio />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/progression" element={<Progression />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/outils" element={<Outils />} />
          <Route path="/sondages" element={<Sondages />} />
          <Route path="/profile" element={<Navigate to="/mon-profil" replace />} />
          <Route path="/mon-profil" element={<MonProfil />} />
          <Route path="/boutique-matrix" element={<BoutiqueMatrix />} />
          <Route path="/boutique-nexus" element={<BoutiqueNexus />} />
          <Route path="/affiliate" element={<AffiliateDashboard />} />
          <Route path="/recherche-joueur" element={<RechercheJoueur />} />
          <Route path="/recherche-createur" element={<CreatorSearch />} />
          <Route path="/profil-createur/:id" element={<CreatorDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/auth/twitch/callback" element={<TwitchCallback />} />
          <Route element={<TwitchLayout />}>
            <Route path="/twitch" element={<TwitchHome />} />
            <Route path="/twitch/search" element={<TwitchSearch />} />
            <Route path="/twitch/category/:gameId" element={<TwitchCategoryPage />} />
            <Route path="/twitch/watch/:channelLogin" element={<TwitchWatch />} />
            <Route path="/twitch/channel/:login" element={<TwitchChannelPage />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/stream" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/live" element={<LiveHub />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/live/:id" element={<Live />} />
          <Route path="/channel/:id" element={<Channel />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/studio" element={<StudioSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </Suspense>
      </AnimatedRoutes>
      <GlobalProfileButton />
      <GlobalMessageButton />
      <BottomTabs />
      <PersistentVoicePanel />
      </VoiceProvider>
      </MiniPlayerProvider>
      </NotificationProvider>
      </ProgressionProvider>

      {/* Update Modal - affiche une modale quand une mise à jour est disponible */}
      {updateInfo && (
        <UpdateModal
          update={updateInfo}
          onClose={() => setUpdateInfo(null)}
          onInstalled={() => {
            // Fermer la modale après installation (redémarrage automatique)
            setUpdateInfo(null);
          }}
        />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster theme="dark" position="bottom-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App