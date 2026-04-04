import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Footer from "./components/Footer";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { getCurrentUser } from "./store/slices/auth.slice";
import { hideToast } from "./store/slices/ui.slice";
import { fetchFavorites, clearFavorites } from "./store/slices/favorites.slice";
import { Home } from "./pages/Home";
import { RoomsListing } from "./pages/RoomsListing";
import { RoomDetails } from "./pages/RoomDetails";
import { OwnerInfo } from "./pages/OwnerInfo";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { GoogleCallback } from "./pages/GoogleCallback";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Profile } from "./pages/Profile";
import Pricing from "./pages/Pricing";
import { Navbar } from "./components/Navbar";
import { Toast } from "./components/Toast";
import { PhoneOtpModal } from "./components/PhoneOtpModal";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProperties } from "./pages/admin/AdminProperties";
import { AdminPropertyDetail } from "./pages/admin/AdminPropertyDetail";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminAgentAssignments } from "./pages/admin/AdminAgentAssignments";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminRoute } from "./components/admin/AdminRoute";
import { AgentDashboard } from "./pages/agent/AgentDashboard";
import { AgentRoute } from "./components/agent/AgentRoute";
import { TenantDashboard } from "./pages/tenant/TenantDashboard";
import { TenantRoute } from "./components/tenant/TenantRoute";
import { IdempotencyArchitecture } from "./pages/architecture/IdempotencyArchitecture";
import { OutboxArchitecture } from "./pages/architecture/OutboxArchitecture";
import { useTheme } from "./hooks/useTheme";
import { useInitializeAppData } from "./hooks/useInitializeAppData";
import PrivacyPolicy from "./pages/policy/PrivacyPolicy";
import TermsConditions from "./pages/policy/TermsConditions";
import RefundPolicy from "./pages/policy/RefundPolicy";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authStatus, loading } = useAppSelector((state) => state.auth);

  if (authStatus === "INITIALIZING" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 dark:border-slate-700 border-t-[#1E293B] dark:border-t-white mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verifying your session…
          </p>
        </div>
      </div>
    );
  }

  const isOwner = user?.role?.toUpperCase() === "OWNER";

  if (authStatus === "UNAUTHENTICATED" || !user || !isOwner) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { toast } = useAppSelector((state) => state.ui);
  const { token, authStatus } = useAppSelector((state) => state.auth);
  const { pathname } = useLocation();

  useTheme();

  // ✅ STEP 1: Initialize all global app data once
  useInitializeAppData();

  // Wake backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`).catch(() => {});
  }, []);

  const isStandalonePage = pathname.startsWith("/architecture");

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [token, dispatch]);

  // ✅ Fetch favorites after auth status changes
  useEffect(() => {
    if (authStatus === "AUTHENTICATED") {
      dispatch(fetchFavorites());
    } else if (authStatus === "UNAUTHENTICATED") {
      dispatch(clearFavorites());
    }
  }, [authStatus, dispatch]);

  // Mobile deep link handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener: any;

    CapacitorApp.addListener("appUrlOpen", async (event) => {
      const parsed = new URL(event.url);
      const token = parsed.searchParams.get("token");

      if (token) {
        localStorage.setItem("kangaroo_token", token);
        await Browser.close();
        window.location.replace("/owner/dashboard");
      }
    }).then((l) => {
      listener = l;
    });

    return () => {
      listener?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 transition-colors duration-300">
      {!isStandalonePage && <Navbar />}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(hideToast())}
        />
      )}

      <PhoneOtpModal />

   <main
  className={`min-h-screen flex flex-col ${
    !isStandalonePage ? 'pt-20'  : ''
  }`}
>
  {/* Content wrapper */}
  <div className="flex-1">
    {/* Global container */}
    <div className="">
      <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<RoomsListing />} />
              <Route path="/rooms/:id" element={<RoomDetails />} />
              <Route path="/owners" element={<OwnerInfo />} />
              <Route path="/pricing" element={<Pricing />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/auth/google/callback"
                element={<GoogleCallback />}
              />

              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route
                path="/terms-and-conditions"
                element={<TermsConditions />}
              />
              <Route path="/refund-policy" element={<RefundPolicy />} />

              {/* Architecture */}
              <Route
                path="/architecture/idempotency"
                element={<IdempotencyArchitecture />}
              />
              <Route
                path="/architecture/outbox"
                element={<OutboxArchitecture />}
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/properties"
                element={
                  <AdminRoute>
                    <AdminProperties />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/properties/:id"
                element={
                  <AdminRoute>
                    <AdminPropertyDetail />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/agent-assignments"
                element={
                  <AdminRoute>
                    <AdminAgentAssignments />
                  </AdminRoute>
                }
              />

              {/* Agent */}
              <Route
                path="/agent/dashboard"
                element={
                  <AgentRoute>
                    <AgentDashboard />
                  </AgentRoute>
                }
              />

              {/* Tenant */}
              <Route
                path="/tenant/dashboard"
                element={
                  <TenantRoute>
                    <TenantDashboard />
                  </TenantRoute>
                }
              />
            </Routes>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export function App() {
  // Create a client for React Query with optimized defaults
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  );
}
