import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Marquee } from "./components/layout/Marquee";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { supabase, trackUserProfile } from "./lib/supabase";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useVisitTracking } from "./hooks/useVisitTracking";
import { setBaseUrl } from "@workspace/api-client-react";

// We'll define these pages next
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StudyMaterialDetail } from "./pages/StudyMaterialDetail";
import { MockTestList } from "./pages/MockTestList";
import { MockTestExam } from "./pages/MockTestExam";
import { MockTestHistory } from "./pages/MockTestHistory";
import { PurchaseHistory } from "./pages/PurchaseHistory";
import { AmazonStore } from "./pages/AmazonStore";
import { SearchResults } from "./pages/SearchResults";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { About } from "./pages/About";
import { RefundCancellation } from "./pages/RefundCancellation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col flex-1">
      <Marquee />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin">
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      </Route>
      
      <Route path="/login">
        <PublicLayout><Login /></PublicLayout>
      </Route>
      <Route path="/study-material/:id">
        <ProtectedRoute><StudyMaterialDetail /></ProtectedRoute>
      </Route>
      <Route path="/mock-test/:id">
        <ProtectedRoute><MockTestExam /></ProtectedRoute>
      </Route>
      <Route path="/mock-tests">
        <ProtectedRoute><MockTestList /></ProtectedRoute>
      </Route>
      <Route path="/mock-test-history">
        <ProtectedRoute><MockTestHistory /></ProtectedRoute>
      </Route>
      <Route path="/purchase-history">
        <ProtectedRoute><PurchaseHistory /></ProtectedRoute>
      </Route>
      <Route path="/amazon-store">
        <ProtectedRoute><AmazonStore /></ProtectedRoute>
      </Route>
      <Route path="/search">
        <ProtectedRoute><SearchResults /></ProtectedRoute>
      </Route>
      <Route path="/privacy-policy">
        <PublicLayout><PrivacyPolicy /></PublicLayout>
      </Route>
      <Route path="/terms-of-service">
        <PublicLayout><TermsOfService /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/refund-cancellation">
        <PublicLayout><RefundCancellation /></PublicLayout>
      </Route>
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route>
        <PublicLayout><NotFound /></PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (apiUrl) {
      setBaseUrl(apiUrl);
    }
  }, [apiUrl]);

  useVisitTracking();

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const adminPath = `${basePath}/admin`;
  const homePath = basePath || "/";

  const [sessionReady, setSessionReady] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!mounted) return;
      setCurrentSession(session ?? null);
      setSessionReady(true);
      
      const currentPath = window.location.pathname;
      const isAdmin = session?.user?.email === 'kartik1911k@gmail.com';
      
      if (session && isAdmin && !currentPath.startsWith(adminPath)) {
        window.location.href = adminPath;
      } else if (session && !isAdmin && currentPath === adminPath) {
        window.location.href = homePath;
      }
    };

    handleAuth();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setCurrentSession(session ?? null);

      const currentPath = window.location.pathname;
      const isAdmin = session?.user?.email === 'kartik1911k@gmail.com';
      
      if (event === 'SIGNED_IN' && session?.user) {
        trackUserProfile({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email || 'User',
          avatar_url: session.user.user_metadata?.avatar_url,
        });
        
        if (isAdmin && !currentPath.startsWith(adminPath)) {
          window.location.href = adminPath;
        } else if (!isAdmin && currentPath === adminPath) {
          window.location.href = homePath;
        }
      } else if (event === 'SIGNED_OUT') {
        if (currentPath === adminPath) {
          window.location.href = homePath;
        }
      }
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, [adminPath, homePath]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
