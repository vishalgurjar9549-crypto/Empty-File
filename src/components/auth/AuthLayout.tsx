import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPoints: {
    title: string;
    description: string;
  }[];
}

export function AuthLayout({
  children,
  badge,
  title,
  description,
  heroBadge,
  heroTitle,
  heroDescription,
  heroPoints,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-cream dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* ----------------------------------------
            Left / Brand Panel
        ----------------------------------------- */}
        <section
          aria-hidden="true"
          className="hidden lg:flex relative overflow-hidden bg-navy dark:bg-slate-900 text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_35%)]" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14 gap-4">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/10">
                  <span className="text-gold font-playfair font-bold text-2xl">
                    H
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-wide">Homilivo</p>
                  <p className="text-sm text-white/70">Smart rental experience</p>
                </div>
              </Link>
            </div>

            <div className="max-w-xl">
              <p className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
                {heroBadge}
              </p>

              <h1 className="mt-6 text-4xl xl:text-5xl font-bold leading-tight font-playfair">
                {heroTitle}
              </h1>

              <p className="mt-5 text-base xl:text-lg text-white/75 leading-8">
                {heroDescription}
              </p>

              <div className="mt-10 grid gap-4">
                {heroPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-gold shrink-0" />
                    <div>
                      <p className="font-semibold">{point.title}</p>
                      <p className="text-sm text-white/70 mt-1">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-white/50">
              © {new Date().getFullYear()} Homilivo
            </div>
          </div>
        </section>

        {/* ----------------------------------------
            Right / Form Panel
        ----------------------------------------- */}
        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 text-center lg:hidden">
              <Link
                to="/"
                className="inline-flex flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xl"
              >
                <div className="w-14 h-14 bg-navy dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-navy/20">
                  <span className="text-gold font-playfair font-bold text-2xl">
                    H
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-navy dark:text-white">
                    Homilivo
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Smart rental experience
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xl shadow-slate-200/40 dark:shadow-black/20 backdrop-blur-sm p-6 sm:p-8">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {badge}
                </div>

                <h2 className="mt-4 text-3xl sm:text-4xl font-bold font-playfair text-navy dark:text-white">
                  {title}
                </h2>

                <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>

              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}