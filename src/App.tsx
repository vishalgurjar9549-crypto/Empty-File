import React, { useEffect, Suspense, lazy } from "react";
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


// ✅ CRITICAL ROUTES - Loaded eagerly
import { Home } from "./pages/Home";
import { RoomsListing } from "./pages/RoomsListing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Navbar } from "./components/Navbar";
import { Toast } from "./components/Toast";
import { PhoneOtpModal } from "./components/PhoneOtpModal";

// ✅ LAZY ROUTES - Loaded on demand
const RoomDetails = lazy(() => import("./pages/RoomDetails").then(m => ({ default: m.RoomDetails })));
const ReviewAutoLoginPage = lazy(() => import("./pages/ReviewAutoLoginPage").then(m => ({ default: m.ReviewAutoLoginPage })));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const OwnerInfo = lazy(() => import("./pages/OwnerInfo").then(m => ({ default: m.OwnerInfo })));
const About_Page = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const Pricing = lazy(() => import("./pages/Pricing"));
const GoogleCallback = lazy(() => import("./pages/GoogleCallback").then(m => ({ default: m.GoogleCallback })));

// ✅ AUTH ROUTES - Lazy loaded
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword").then(m => ({ default: m.ResetPassword })));

// ✅ ADMIN ROUTES - Lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties").then(m => ({ default: m.AdminProperties })));
const AdminPropertyDetail = lazy(() => import("./pages/admin/AdminPropertyDetail").then(m => ({ default: m.AdminPropertyDetail })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminAgentAssignments = lazy(() => import("./pages/admin/AdminAgentAssignments").then(m => ({ default: m.AdminAgentAssignments })));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin").then(m => ({ default: m.AdminLogin })));

// ✅ ROLE-BASED DASHBOARD ROUTES - Lazy loaded
const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard").then(m => ({ default: m.AgentDashboard })));
const TenantDashboard = lazy(() => import("./pages/tenant/TenantDashboard").then(m => ({ default: m.TenantDashboard })));

// ✅ POLICY & ARCHITECTURE ROUTES - Very lazy loaded
const IdempotencyArchitecture = lazy(() => import("./pages/architecture/IdempotencyArchitecture").then(m => ({ default: m.IdempotencyArchitecture })));
const OutboxArchitecture = lazy(() => import("./pages/architecture/OutboxArchitecture").then(m => ({ default: m.OutboxArchitecture })));
const PrivacyPolicy = lazy(() => import("./pages/policy/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/policy/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/policy/RefundPolicy"));

// ✅ Admin/Agent/Tenant route guards
import { AdminRoute } from "./components/admin/AdminRoute";
import { AgentRoute } from "./components/agent/AgentRoute";
import { TenantRoute } from "./components/tenant/TenantRoute";

// ✅ AGENT ROUTES - Lazy loaded
const AgentLogin = lazy(() => import("./pages/agent/AgentLogin").then(m => ({ default: m.AgentLogin })));
const AgentRegister = lazy(() => import("./pages/agent/AgentRegister").then(m => ({ default: m.AgentRegister })));

import { useTheme } from "./hooks/useTheme";
import { useInitializeAppData } from "./hooks/useInitializeAppData";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

// ✅ Pages where Navbar/Footer should NOT be shown
const HIDE_LAYOUT_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/admin/login",
  "/agent/login",
  "/agent/register",
];

/**
 * ✅ Lazy Loading Fallback Component
 */
function LazyLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 dark:border-slate-700 border-t-[#1E293B] dark:border-t-white mx-auto mb-4"></div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Loading page...
        </p>
      </div>
    </div>
  );
}

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

  const isStandalonePage = pathname.startsWith("/architecture");

  const shouldHideLayout = HIDE_LAYOUT_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  const showNavbar = !isStandalonePage && !shouldHideLayout;
  const showFooter = !shouldHideLayout;

  useTheme();
  useInitializeAppData();

  // Wake backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`).catch(() => {});
  }, []);

  useEffect(() => {
    if (token) dispatch(getCurrentUser());
  }, [token, dispatch]);

  useEffect(() => {
    if (authStatus === "AUTHENTICATED") {
      dispatch(fetchFavorites());
    } else if (authStatus === "UNAUTHENTICATED") {
      dispatch(clearFavorites());
    }
  }, [authStatus, dispatch]);

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
    <div className="flex flex-col min-h-screen bg-cream dark:bg-slate-950 transition-colors duration-300">

      {/* ✅ Sticky Navbar - in document flow, no pt-16 needed */}
      {/* {showNavbar && (
        <header className="sticky top-0 z-50 border-b bg-cream/80 dark:bg-slate-950/80 backdrop-blur">
          <Navbar />
        </header>
      )} */}
      {showNavbar && (
  <header className="sticky top-0 z-50 h-16 border-b bg-cream/80 dark:bg-slate-950/80 backdrop-blur">
    <div className="h-full">
      <Navbar />
    </div>
  </header>
)}

      {/* ✅ Global UI Overlays */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(hideToast())}
        />
      )}
      <PhoneOtpModal />

      {/* ✅ Main Content - starts right after header, no padding needed */}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* ✅ CRITICAL ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomsListing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

              {/* ✅ LAZY ROUTES - Loaded on demand with Suspense */}
              <Route path="/rooms/:id" element={<Suspense fallback={<LazyLoadingFallback />}><RoomDetails /></Suspense>} />
              <Route path="/property/:id" element={<Suspense fallback={<LazyLoadingFallback />}><RoomDetails /></Suspense>} />
              <Route path="/review/:propertyId" element={<Suspense fallback={<LazyLoadingFallback />}><ReviewAutoLoginPage /></Suspense>} />
              <Route path="/owners" element={<Suspense fallback={<LazyLoadingFallback />}><OwnerInfo /></Suspense>} />
              <Route path="/pricing" element={<Suspense fallback={<LazyLoadingFallback />}><Pricing /></Suspense>} />

          <Route path="/owners" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <OwnerInfo />
            </Suspense>
          } />

          <Route path="/pricing" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <Pricing />
            </Suspense>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="/owner/dashboard" element={
            <ProtectedRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <Profile />
            </Suspense>
          } />

          <Route path="/auth/forgot-password" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <ForgotPassword />
            </Suspense>
          } />

          <Route path="/auth/reset-password" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <ResetPassword />
            </Suspense>
          } />

          <Route path="/admin/login" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <AdminLogin />
            </Suspense>
          } />

          {/* ✅ Agent Authentication Routes */}
          <Route path="/agent/login" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <AgentLogin />
            </Suspense>
          } />

          <Route path="/agent/register" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <AgentRegister />
            </Suspense>
          } />

          <Route path="/auth/google/callback" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <GoogleCallback />
            </Suspense>
          } />

          <Route path="/about" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <About_Page />
            </Suspense>
          } />

          <Route path="/contact" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <Contact />
            </Suspense>
          } />

          <Route path="/privacy-policy" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <PrivacyPolicy />
            </Suspense>
          } />

          <Route path="/terms-and-conditions" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <TermsConditions />
            </Suspense>
          } />

          <Route path="/refund-policy" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <RefundPolicy />
            </Suspense>
          } />

          {/* ✅ Architecture */}
          <Route path="/architecture/idempotency" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <IdempotencyArchitecture />
            </Suspense>
          } />

          <Route path="/architecture/outbox" element={
            <Suspense fallback={<LazyLoadingFallback />}>
              <OutboxArchitecture />
            </Suspense>
          } />

          {/* ✅ Admin */}
          <Route path="/admin" element={
            <AdminRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          } />

          <Route path="/admin/properties" element={
            <AdminRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <AdminProperties />
              </Suspense>
            </AdminRoute>
          } />

          <Route path="/admin/properties/:id" element={
            <AdminRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <AdminPropertyDetail />
              </Suspense>
            </AdminRoute>
          } />

          <Route path="/admin/users" element={
            <AdminRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <AdminUsers />
              </Suspense>
            </AdminRoute>
          } />

          <Route path="/admin/agent-assignments" element={
            <AdminRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <AdminAgentAssignments />
              </Suspense>
            </AdminRoute>
          } />

          {/* ✅ Agent */}
          <Route path="/agent/dashboard" element={
            <AgentRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <AgentDashboard />
              </Suspense>
            </AgentRoute>
          } />

          {/* ✅ Tenant */}
          <Route path="/tenant/dashboard" element={
            <TenantRoute>
              <Suspense fallback={<LazyLoadingFallback />}>
                <TenantDashboard />
              </Suspense>
            </TenantRoute>
          } />
        </Routes>
      </main>

      {/* ✅ Footer - outside <main>, always at bottom of flex column */}
      {showFooter && <Footer />}

    </div>
  );
}

export function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
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
