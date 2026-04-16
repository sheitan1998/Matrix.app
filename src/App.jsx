import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import MainLayout from '@/components/layout/MainLayout';
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
import Profile from '@/pages/Profile';
import StudioSetup from '@/pages/StudioSetup';
import Dashboard from '@/pages/Dashboard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-9 h-9 border-4 border-secondary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/live" element={<LiveHub />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/live/:id" element={<Live />} />
        <Route path="/channel/:id" element={<Channel />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/trix-store" element={<TrixStore />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/studio" element={<StudioSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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