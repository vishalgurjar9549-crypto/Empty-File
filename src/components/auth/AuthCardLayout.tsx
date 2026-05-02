import React from 'react';
import { Link } from 'react-router-dom';

interface AuthCardLayoutProps {
  children: React.ReactNode;
  badge: {
    icon?: string;
    text: string;
  };
  title: string;
  subtitle: string;
  footerLink?: {
    text: string;
    linkText: string;
    href: string;
  };
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * REUSABLE AUTH CARD LAYOUT
 * ═════════════════════════════════════════════════════════════════════
 *
 * Premium dark theme with centered card, gold accents.
 * Used for Admin Login, Agent Login, Agent Register.
 *
 * Example:
 * ```tsx
 * <AuthCardLayout
 *   badge={{ icon: '🤖', text: 'Agent Portal' }}
 *   title="Agent Login"
 *   subtitle="Access your agent dashboard"
 *   footerLink={{
 *     text: "Don't have an account?",
 *     linkText: "Sign up here",
 *     href: "/agent/register"
 *   }}
 * >
 *   {* Form content here *}
 * </AuthCardLayout>
 * ```
 */
export function AuthCardLayout({
  children,
  badge,
  title,
  subtitle,
  footerLink,
}: AuthCardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-semibold tracking-wider uppercase">
            {badge.icon && <span>{badge.icon}</span>}
            {badge.text}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/50 p-6 sm:p-8 border border-slate-800/50">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4 group">
              <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-tr-xl rounded-bl-xl flex items-center justify-center mx-auto shadow-lg transition-transform group-hover:scale-110 duration-300">
                <span className="text-gold font-playfair font-bold text-2xl">K</span>
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-playfair mb-2">
              {title}
            </h1>
            <p className="text-slate-400 text-sm">{subtitle}</p>
          </div>

          {/* Content */}
          {children}

          {/* Footer Link */}
          {footerLink && (
            <p className="text-center text-xs text-slate-600 mt-8">
              {footerLink.text}{' '}
              <Link
                to={footerLink.href}
                className="text-slate-500 hover:text-slate-300 underline transition-colors"
              >
                {footerLink.linkText}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
