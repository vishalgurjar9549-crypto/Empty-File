


// import { useEffect, useMemo, useState } from "react";
// import ReactDOM from "react-dom";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Menu, X, LogOut, User } from "lucide-react";
// import { useAppSelector, useAppDispatch } from "../store/hooks";
// import { logout } from "../store/slices/auth.slice";
// import { ThemeToggle } from "./ThemeToggle";
// import { PhoneModal } from "./PhoneModal";

// export function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [showPhoneModal, setShowPhoneModal] = useState(false);

//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const { user } = useAppSelector((state) => state.auth);

//   const isAuthPage = location.pathname.includes("/auth");
//   const isHomePage = location.pathname === "/";
//   const userRole = user?.role?.toUpperCase();

//   const shouldShowListProperty = userRole !== "OWNER";

//   const isTransparent = useMemo(() => {
//     return isHomePage && !scrolled && !isOpen;
//   }, [isHomePage, scrolled, isOpen]);

//   // 🔥 Generic active checker
//   const isActive = (path: string) => {
//     if (path === "/") return location.pathname === "/";
//     return location.pathname.startsWith(path);
//   };

//   // 🔥 FIX: Separate matcher for List Property (NO /owner conflict)
//   const isListPropertyActive = () => {
//     return (
//       location.pathname === "/list-property" ||
//       location.pathname === "/become-owner" ||
//       location.pathname === "/auth/register-owner"
//     );
//   };

//   // Desktop nav styles
//   const navLinkClass = (path: string) =>
//     `group relative inline-flex items-center h-10 transition-colors ${
//       isActive(path)
//         ? "text-gold"
//         : "text-slate-700 dark:text-slate-300 hover:text-gold"
//     }`;

//   const navUnderlineClass = (path: string) =>
//     `after:absolute after:left-0 after:-bottom-[2px] after:h-[2px] after:w-full after:rounded-full after:transition-all ${
//       isActive(path)
//         ? "after:bg-gold after:opacity-100"
//         : "after:bg-gold after:opacity-0 group-hover:after:opacity-100"
//     }`;

//   // 🔥 Dedicated List Property styles
//   const listPropertyNavClass = `group relative inline-flex items-center h-10 transition-colors ${
//     isListPropertyActive()
//       ? "text-gold"
//       : "text-slate-700 dark:text-slate-300 hover:text-gold"
//   }`;

//   const listPropertyUnderlineClass = `after:absolute after:left-0 after:-bottom-[2px] after:h-[2px] after:w-full after:rounded-full after:transition-all ${
//     isListPropertyActive()
//       ? "after:bg-gold after:opacity-100"
//       : "after:bg-gold after:opacity-0 group-hover:after:opacity-100"
//   }`;

//   // Mobile styles
//   const mobileNavClass = (path: string) =>
//     `block w-full rounded-xl px-4 py-3 text-sm font-medium ${
//       isActive(path)
//         ? "bg-gold/10 text-gold"
//         : "text-[#1E293B] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
//     }`;

//   const mobileListPropertyClass = `block w-full rounded-xl px-4 py-3 text-sm font-medium ${
//     isListPropertyActive()
//       ? "bg-gold/10 text-gold"
//       : "text-[#1E293B] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
//   }`;

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 10);
//     };

//     handleScroll();
//     window.addEventListener("scroll", handleScroll);

//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   useEffect(() => {
//     setIsOpen(false);
//   }, [location.pathname]);

//   if (isAuthPage) return null;

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");
//   };

//   const handleListPropertyClick = () => {
//     if (!user) {
//       setShowPhoneModal(true);
//       return;
//     }

//     if (user.role?.toUpperCase() === "OWNER") {
//       navigate("/owner/dashboard");
//       return;
//     }

//     setShowPhoneModal(true);
//   };

//   const getDashboardLink = () => {
//     switch (userRole) {
//       case "ADMIN":
//         return "/admin";
//       case "OWNER":
//         return "/owner/dashboard";
//       case "TENANT":
//         return "/tenant/dashboard";
//       case "AGENT":
//         return "/agent/dashboard";
//       default:
//         return "/owner/dashboard";
//     }
//   };

//   const getDashboardLabel = () => {
//     switch (userRole) {
//       case "ADMIN":
//         return "Admin Dashboard";
//       case "OWNER":
//         return "Owner Dashboard";
//       case "TENANT":
//         return "My Dashboard";
//       case "AGENT":
//         return "Agent Dashboard";
//       default:
//         return "Dashboard";
//     }
//   };

//   const dashboardLink = userRole ? getDashboardLink() : "";
//   const dashboardLabel = userRole ? getDashboardLabel() : "";

//   const mobileMenu = ReactDOM.createPortal(
//     <>
//       <div
//         className={`fixed inset-0 bg-black/40 z-40 ${
//           isOpen ? "block" : "hidden"
//         }`}
//         onClick={() => setIsOpen(false)}
//       />

//       <div
//         className={`fixed right-0 top-0 h-full w-[85vw] max-w-sm bg-white dark:bg-slate-900 z-50 transform transition ${
//           isOpen ? "translate-x-0" : "translate-x-full"
//         }`}
//       >
//         <div className="p-4 space-y-2">
//           <Link to="/rooms" className={mobileNavClass("/rooms")}>
//             Find a Room
//           </Link>

//           {shouldShowListProperty && (
//             <button
//               onClick={handleListPropertyClick}
//               className={mobileListPropertyClass}
//             >
//               List Property
//             </button>
//           )}

//           {userRole && (
//             <Link to={dashboardLink} className={mobileNavClass(dashboardLink)}>
//               {dashboardLabel}
//             </Link>
//           )}

//           <Link to="/about" className={mobileNavClass("/about")}>
//             About
//           </Link>
//         </div>
//       </div>
//     </>,
//     document.body
//   );

//   return (
//     <>
//       <nav
//         className={`fixed top-0 w-full z-30 ${
//           isTransparent ? "bg-transparent" : "bg-white dark:bg-slate-900 shadow"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
//           <Link to="/" className="font-bold text-lg">
//             Homilivo
//           </Link>

//           {/* Desktop */}
//           <div className="hidden md:flex gap-6 items-center">
//             <Link
//               to="/rooms"
//               className={`${navLinkClass("/rooms")} ${navUnderlineClass("/rooms")}`}
//             >
//               Find a Room
//             </Link>

//             {shouldShowListProperty && (
//               <button
//                 onClick={handleListPropertyClick}
//                 className={`${listPropertyNavClass} ${listPropertyUnderlineClass}`}
//               >
//                 List Property
//               </button>
//             )}

//             {userRole && (
//               <Link
//                 to={dashboardLink}
//                 className={`${navLinkClass(dashboardLink)} ${navUnderlineClass(
//                   dashboardLink
//                 )}`}
//               >
//                 {dashboardLabel}
//               </Link>
//             )}

//             <Link
//               to="/about"
//               className={`${navLinkClass("/about")} ${navUnderlineClass("/about")}`}
//             >
//               About
//             </Link>

//             <ThemeToggle />

//             {user ? (
//               <>
//                 <Link to="/profile" className="flex gap-2 items-center">
//                   <User className="w-4 h-4" />
//                   {user.name}
//                 </Link>

//                 <button onClick={handleLogout}>
//                   <LogOut />
//                 </button>
//               </>
//             ) : (
//               <Link to="/auth/login">Login</Link>
//             )}
//           </div>

//           {/* Mobile */}
//           <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
//             {isOpen ? <X /> : <Menu />}
//           </button>
//         </div>
//       </nav>

//       {mobileMenu}
//       {showPhoneModal && (
//         <PhoneModal onClose={() => setShowPhoneModal(false)} />
//       )}
//     </>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import {  useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/auth.slice";
import { ThemeToggle } from "./ThemeToggle";
import { PhoneModal } from "./PhoneModal";
import { useListPropertyAction } from "../hooks/useListPropertyAction";
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const { user, shouldShowListProperty, handleListPropertyClick } =
  useListPropertyAction({
    onRequirePhone: () => setShowPhoneModal(true),
  });

const userRole = user?.role?.toUpperCase();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const { user } = useAppSelector((state) => state.auth);

  const isAuthPage = location.pathname.includes("/auth");
  const isHomePage = location.pathname === "/";
  // const userRole = user?.role?.toUpperCase();

  // const shouldShowListProperty = userRole !== "OWNER";

  const isTransparent = useMemo(() => {
    return isHomePage && !scrolled && !isOpen;
  }, [isHomePage, scrolled, isOpen]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isListPropertyActive = () => {
    return (
      location.pathname === "/list-property" ||
      location.pathname === "/become-owner" ||
      location.pathname === "/auth/register-owner"
    );
  };

  // ===== Desktop nav item styles =====
// ===== Desktop nav item styles =====
const navLinkClass = (active: boolean) =>
  [
    "group relative inline-flex items-center justify-center h-10 rounded-full px-4 text-sm font-medium transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
    active
      ? "text-gold bg-gold/10 shadow-[0_0_0_1px_rgba(212,175,55,0.15)]"
      : "text-slate-700 dark:text-slate-200 hover:text-gold dark:hover:text-gold hover:bg-slate-100/80 dark:hover:bg-gold/10",
  ].join(" ");

const navUnderlineClass = (active: boolean) =>
  [
    "after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-[4px]",
    "after:h-[2px] after:rounded-full after:bg-gold after:transition-all after:duration-300",
    active
      ? "after:w-6 after:opacity-100"
      : "after:w-0 after:opacity-0 group-hover:after:w-6 group-hover:after:opacity-100",
  ].join(" ");

  // ===== Mobile nav item styles =====
const mobileNavClass = (active: boolean) =>
  [
    "group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
    active
      ? "bg-gold/10 text-gold shadow-[0_0_0_1px_rgba(212,175,55,0.18)]"
      : "text-slate-800 dark:text-slate-100 hover:text-gold dark:hover:text-gold hover:bg-slate-100 dark:hover:bg-gold/10",
  ].join(" ");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (isAuthPage) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // const handleListPropertyClick = () => {
  //   if (!user) {
  //     setShowPhoneModal(true);
  //     return;
  //   }

  //   if (user.role?.toUpperCase() === "OWNER") {
  //     navigate("/owner/dashboard");
  //     return;
  //   }

  //   setShowPhoneModal(true);
  // };

  const getDashboardLink = () => {
    switch (userRole) {
      case "ADMIN":
        return "/admin";
      case "OWNER":
        return "/owner/dashboard";
      case "TENANT":
        return "/tenant/dashboard";
      case "AGENT":
        return "/agent/dashboard";
      default:
        return "/owner/dashboard";
    }
  };

  const getDashboardLabel = () => {
    switch (userRole) {
      case "ADMIN":
        return "Admin Dashboard";
      case "OWNER":
        return "Owner Dashboard";
      case "TENANT":
        return "My Dashboard";
      case "AGENT":
        return "Agent Dashboard";
      default:
        return "Dashboard";
    }
  };

  const dashboardLink = userRole ? getDashboardLink() : "";
  const dashboardLabel = userRole ? getDashboardLabel() : "";

  const mobileMenu = ReactDOM.createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[86vw] max-w-sm z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col border-l border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
            <Link
              to="/"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Homilivo
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:scale-[1.03] hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-2 px-4 py-5">
            <Link to="/rooms" className={mobileNavClass(isActive("/rooms"))}>
              <span>Find a Room</span>
              <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5" />
            </Link>

            {shouldShowListProperty && (
              <button
                onClick={handleListPropertyClick}
                className={mobileNavClass(isListPropertyActive())}
              >
                <span>List Property</span>
                <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5" />
              </button>
            )}

            {userRole && (
              <Link
                to={dashboardLink}
                className={mobileNavClass(isActive(dashboardLink))}
              >
                <span>{dashboardLabel}</span>
                <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5" />
              </Link>
            )}

            {/* <Link to="/about" className={mobileNavClass(isActive("/about"))}>
              <span>About</span>
              <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5" />
            </Link> */}
          </div>

          {/* Footer */}
          <div className="space-y-3 border-t border-slate-200/70 px-4 py-4 dark:border-white/10">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3 dark:border-white/10">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Appearance
              </span>
              <ThemeToggle />
            </div>

            {user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        View profile
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/70 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="flex w-full items-center justify-center rounded-2xl bg-gold px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:shadow-lg hover:shadow-gold/20"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-30 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent"
            : "border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link
            to="/"
            className="group inline-flex items-center gap-2"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Homilivo
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/rooms"
              className={`${navLinkClass(isActive("/rooms"))} ${navUnderlineClass(
                isActive("/rooms")
              )}`}
            >
              Find a Room
            </Link>

            {shouldShowListProperty && (
              <button
                onClick={handleListPropertyClick}
                className={`${navLinkClass(isListPropertyActive())} ${navUnderlineClass(
                  isListPropertyActive()
                )}`}
              >
                List Property
              </button>
            )}

            {userRole && (
              <Link
                to={dashboardLink}
                className={`${navLinkClass(isActive(dashboardLink))} ${navUnderlineClass(
                  isActive(dashboardLink)
                )}`}
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {dashboardLabel}
                </span>
              </Link>
            )}

            {/* <Link
              to="/about"
              className={`${navLinkClass(isActive("/about"))} ${navUnderlineClass(
                isActive("/about")
              )}`}
            >
              About
            </Link> */}

            <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-white/10" />

            <ThemeToggle />

            {user ? (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  to="/profile"
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-[1px] hover:border-gold/30 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:-translate-y-[1px] hover:border-red-300 hover:text-red-500 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="ml-2 inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition hover:scale-[1.03] hover:bg-slate-50 md:hidden dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileMenu}
      {showPhoneModal && (
        <PhoneModal onClose={() => setShowPhoneModal(false)} />
      )}
    </>
  );
}