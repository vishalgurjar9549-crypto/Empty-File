import { Link, useLocation } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  const { pathname } = useLocation();

  const compactFooterRoutes = [
    "/dashboard",
    "/owner/dashboard",
    "/tenant/dashboard",
    "/agent/dashboard",
    "/admin",
  ];

  const isCompactFooter = compactFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const gold = "text-[#D4AF37]";
  const goldHover =
    "hover:text-[#D4AF37] dark:hover:text-[#D4AF37] transition-colors duration-300";

  return (
    <footer
      className={`border-t border-slate-200/80 dark:border-slate-800/80 bg-[#FAFAF9] dark:bg-slate-950 transition-colors duration-300 ${
        isCompactFooter ? "pb-4" : "pb-10 lg:pb-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 py-10 sm:py-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"
            >
              <span className={gold}>Hom</span>ilivo
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Discover stays, rentals, and unique living spaces with a seamless
              experience built for modern explorers and property seekers.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                <a
                  href="mailto:support@homilivo.com"
                  className={goldHover}
                >
                  support@homilivo.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#D4AF37]" />
                <a href="tel:+919999999999" className={goldHover}>
                  +91 99999 99999
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                <span>India</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              {[
                {
                  href: "https://instagram.com",
                  icon: Instagram,
                  label: "Instagram",
                },
                {
                  href: "https://facebook.com",
                  icon: Facebook,
                  label: "Facebook",
                },
                {
                  href: "https://twitter.com",
                  icon: Twitter,
                  label: "Twitter",
                },
                {
                  href: "https://linkedin.com",
                  icon: Linkedin,
                  label: "LinkedIn",
                },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all duration-300"
                >
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/about" className={goldHover}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className={goldHover}>
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blogs" className={goldHover}>
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/contact" className={goldHover}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/properties" className={goldHover}>
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/cities" className={goldHover}>
                  Popular Cities
                </Link>
              </li>
              <li>
                <Link to="/list-property" className={goldHover}>
                  List Your Property
                </Link>
              </li>
               <li>
                <Link to="/list-property" className={goldHover}>
                  Affiliate Partner
                </Link>
              </li>
               <li>
                <Link to="/list-property" className={goldHover}>
                  Become an agent
                </Link>
              </li>
              <li>
                <Link to="/offers" className={goldHover}>
                  Offers & Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/help-center" className={goldHover}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className={goldHover}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className={goldHover}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className={goldHover}>
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Homilivo. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/sitemap" className={goldHover}>
              Sitemap
            </Link>
            <Link to="/cookies" className={goldHover}>
              Cookies
            </Link>
            <Link to="/accessibility" className={goldHover}>
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}