import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthGate from '@/components/AuthGate';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import MainLayout from '@/components/layout/MainLayout';
import BottomTabs from '@/components/layout/BottomTabs';
import AnimatedRoutes from '@/components/layout/AnimatedRoutes';
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Trending from '@/pages/Trending';
import LiveHub from '@/pages/LiveHub';
import Subscriptions from '@/pages/Subscriptions';
import Category from '@/pages/Category';
import Search from '@/pages/Search';
import Watch from '@/pages/Watch';
import Live from '@/pages/Live';
import Channel from '@/pages/Channel';
import Premium from '@/pages/Premium';
import TrixStore from '@/pages/TrixStore';
import Upload from '@/pages/Upload';
import StudioSetup from '@/pages/StudioSetup';
import Dashboard from '@/pages/Dashboard';
import Community from '@/pages/community/Community';
import Shorts from '@/pages/Shorts';
import Marketplace from '@/pages/marketplace/Marketplace';
import MarketHome from '@/pages/marketplace/MarketHome';
import MarketSubscription from '@/pages/marketplace/MarketSubscription';
import ListingDetail from '@/pages/marketplace/ListingDetail';

import Casino from '@/pages/Casino';
import Prospecteurs from '@/pages/prospecteurs/Prospecteurs';
import CommunitySubscription from '@/pages/community/CommunitySubscription';
import Wallet from '@/pages/Wallet';
import VideoStudio from '@/pages/VideoStudio';
import Progression from '@/pages/Progression';
import Notifications from '@/pages/Notifications';
import Outils from '@/pages/Outils';
import Sondages from '@/pages/Sondages';
import MonProfil from '@/pages/MonProfil';
import BoutiqueMatrix from '@/pages/BoutiqueMatrix';
import BoutiqueNexus from '@/pages/BoutiqueNexus';
import NexusInvite from '@/pages/NexusInvite';
import CreatorProfile from '@/pages/CreatorProfile';
import AdminPanel from '@/pages/AdminPanel';
import RechercheJoueur from '@/pages/prospecteurs/RechercheJoueur';
import Privacy from '@/pages/Privacy';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import GlobalProfileButton from '@/components/profile/GlobalProfileButton';
import GlobalMessageButton from '@/components/messaging/GlobalMessageButton';
import { ProgressionProvider } from '@/context/ProgressionContext';
import { MiniPlayerProvider } from '@/context/MiniPlayerContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { usePresence } from '@/hooks/usePresence';
import TwitchLayout from '@/components/twitch/TwitchLayout';
import TutoGamingLayout from '@/components/tuto-gaming/TutoGamingLayout';
import TutoGamingHub from '@/pages/tuto-gaming/TutoGamingHub';
import GameDetailPage from '@/pages/tuto-gaming/GameDetailPage';
import QuestDetailPage from '@/pages/tuto-gaming/QuestDetailPage';
import WikiEntryDetailPage from '@/pages/tuto-gaming/WikiEntryDetailPage';
import FarmingSimulator25 from '@/pages/tuto-gaming/FarmingSimulator25';
import FarmingSimCategory from '@/pages/tuto-gaming/FarmingSimCategory';
import DynamicPage from '@/pages/DynamicPage';
import TwitchHome from '@/pages/twitch/TwitchHome';
import TwitchWatch from '@/pages/twitch/TwitchWatch';
import TwitchSearch from '@/pages/twitch/TwitchSearch';
import TwitchCategoryPage from '@/pages/twitch/TwitchCategoryPage';

// Import updater
import UpdateModal from '@/components/UpdateModal';
import { setupAutoUpdateCheck } from '@/lib/updater';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const [updateInfo, setUpdateInfo] = useState(null);
  usePresence();

  // Setup automatic update checking
  useEffect(() => {
    // Vérifier les mises à jour au démarrage et toutes les heures
    const stopAutoCheck = setupAutoUpdateCheck((update) => {
      console.log("Mise à jour disponible:", update);
      setUpdateInfo(update);
    }, 60 * 60 * 1000); // 1 heure

    return () => stopAutoCheck();
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
      <ProgressionProvider>
      <NotificationProvider>
      <MiniPlayerProvider>
      <AnimatedRoutes>
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/nexus/invite/:code" element={<NexusInvite />} />
        <Route path="/creator/:username" element={<CreatorProfile />} />
        <Route path="/page/:slug" element={<DynamicPage />} />
        <Route path="/" element={<Landing />} />
        <Route element={<TutoGamingLayout />}>
          <Route path="/tuto-gaming" element={<TutoGamingHub />} />
          <Route path="/tuto-gaming/:gameSlug" element={<GameDetailPage />} />
          <Route path="/tuto-gaming/:gameSlug/quest/:questId" element={<QuestDetailPage />} />
          <Route path="/tuto-gaming/:gameSlug/wiki/:entryId" element={<WikiEntryDetailPage />} />
          <Route path="/tuto-gaming/farming-simulator-25" element={<FarmingSimulator25 />} />
          <Route path="/tuto-gaming/farming-simulator-25/:categoryId" element={<FarmingSimCategory />} />
        </Route>
        <Route element={<ProtectedRoute unauthenticatedElement={<AuthGate />} />}>
          <Route path="/community" element={<Community />} />
        <Route path="/shorts" element={<Shorts />} />
        <Route path="/market" element={<MarketHome />} />
        <Route path="/market/browse" element={<Marketplace />} />
        <Route path="/market/subscription" element={<MarketSubscription />} />
        <Route path="/market/:id" element={<ListingDetail />} />

        <Route path="/casino" element={<Casino />} />
        <Route path="/prospecteurs" element={<Prospecteurs />} />
        <Route path="/community/subscription" element={<CommunitySubscription />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/trix-store" element={<TrixStore />} />
          <Route path="/video-studio" element={<VideoStudio />} />
          <Route path="/progression" element={<Progression />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/outils" element={<Outils />} />
          <Route path="/sondages" element={<Sondages />} />
          <Route path="/mon-profil" element={<MonProfil />} />
          <Route path="/boutique-matrix" element={<BoutiqueMatrix />} />
          <Route path="/boutique-nexus" element={<BoutiqueNexus />} />
          <Route path="/recherche-joueur" element={<RechercheJoueur />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route element={<TwitchLayout />}>
            <Route path="/twitch" element={<TwitchHome />} />
            <Route path="/twitch/search" element={<TwitchSearch />} />
            <Route path="/twitch/category/:gameId" element={<TwitchCategoryPage />} />
            <Route path="/twitch/watch/:channelLogin" element={<TwitchWatch />} />
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
      </AnimatedRoutes>
      <GlobalProfileButton />
      <GlobalMessageButton />
      <BottomTabs />
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
