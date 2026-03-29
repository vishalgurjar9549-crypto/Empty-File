import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/auth.slice";
import { ThemeToggle } from "./ThemeToggle";
import { PhoneModal } from "./PhoneModal";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const isAuthPage = location.pathname.includes("/auth");
  const isHomePage = location.pathname === "/";

  const userRole = user?.role?.toUpperCase();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original || "auto";
    };
  }, [isOpen]);

  if (isAuthPage) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleListPropertyClick = () => {
    // If not logged in → Open PhoneModal
    if (!user) {
      setShowPhoneModal(true);
      return;
    }

    // If user role = OWNER → Redirect to owner dashboard
    if (user.role?.toUpperCase() === "OWNER") {
      navigate("/owner/dashboard");
      return;
    }

    // If user role = TENANT (or other roles) → Open PhoneModal
    setShowPhoneModal(true);
  };

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

  const isTransparent =
    isHomePage && !scrolled && window.innerWidth >= 768;

  const mobileMenu = ReactDOM.createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden transition ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed right-0 top-0 h-full w-[85vw] max-w-sm bg-white dark:bg-slate-900 shadow-xl z-[100] md:hidden transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-lg">Menu</span>

          <button onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Link to="/rooms" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            Find a Room
          </Link>

          <button onClick={handleListPropertyClick} className="w-full text-left block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            List Property
          </button>

          {userRole && (
            <Link to={getDashboardLink()} className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {getDashboardLabel()}
            </Link>
          )}

          <Link to="/about" className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            About
          </Link>

          <div className="border-t border-slate-200 dark:border-slate-700 my-4" />

          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-3 p-3">
                <User className="w-5 h-5" />
                {user.name}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 text-red-500"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="block p-3 text-center border rounded-lg">
                Login
              </Link>

              <Link to="/rooms" className="block p-3 text-center bg-gold rounded-lg font-bold">
                Book Now
              </Link>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-16 z-50 transition ${
          isTransparent
            ? "bg-transparent"
            : "bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-9 h-9 bg-navy text-gold flex items-center justify-center rounded-lg">
              H
            </div>
            Homilivo
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">

            <Link to="/rooms">Find a Room</Link>

            <button onClick={handleListPropertyClick} className="text-slate-700 dark:text-slate-300 hover:text-gold transition-colors">
              List Property
            </button>

            {userRole && (
              <Link to={getDashboardLink()}>{getDashboardLabel()}</Link>
            )}

            <Link to="/about">About</Link>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user.name.split(" ")[0]}
                </Link>

                <button onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth/login">Login</Link>

                <Link
                  to="/rooms"
                  className="px-4 py-2 bg-gold rounded-lg font-bold"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenu}
      {showPhoneModal && <PhoneModal onClose={() => setShowPhoneModal(false)} />}
    </>
  );
}