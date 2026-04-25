
import { useEffect, useState } from "react";

interface FullscreenLoaderProps {
  message?: string;
}

export default function FullscreenLoader({
  message = "Submitting your property listing...",
}: FullscreenLoaderProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        /* ─── Font ─────────────────────────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Nunito:wght@300;400;500&display=swap');

        /* ─── Keyframes ─────────────────────────────────────────────── */
        @keyframes rl-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rl-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rl-roof-draw {
          from { stroke-dashoffset: 200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes rl-house-draw {
          from { stroke-dashoffset: 400; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes rl-door-rise {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes rl-smoke {
          0%   { transform: translateY(0)     scale(1);   opacity: 0.5; }
          100% { transform: translateY(-14px) scale(1.4); opacity: 0;   }
        }
        @keyframes rl-window-blink {
          0%, 90%, 100% { opacity: 0.65; }
          95%           { opacity: 1; }
        }
        @keyframes rl-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes rl-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes rl-bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-4px); }
        }
        @keyframes rl-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes rl-leaf-sway {
          0%, 100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }

        /* ─── Respect reduced-motion ────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .rl-house-float,
          .rl-roof-path,
          .rl-wall-path,
          .rl-door-group,
          .rl-window,
          .rl-window-2,
          .rl-smoke-1,
          .rl-smoke-2,
          .rl-leaf,
          .rl-leaf-2,
          .rl-dot-1,
          .rl-dot-2,
          .rl-dot-3,
          .rl-card,
          .rl-title-shimmer {
            animation: none !important;
            opacity: 1 !important;
            stroke-dashoffset: 0 !important;
            transform: none !important;
          }
        }

        /* ─── Base classes ──────────────────────────────────────────── */
        .rl-display { font-family: 'Playfair Display', Georgia, serif; }
        .rl-body    { font-family: 'Nunito', system-ui, -apple-system, sans-serif; }

        /* ─── Card entrance ─────────────────────────────────────────── */
        .rl-card {
          animation: rl-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
          /* Prevent card from ever being taller than the viewport */
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          /* Smooth scrolling on iOS */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* ─── Title shimmer ─────────────────────────────────────────── */
        .rl-title-shimmer {
          background: linear-gradient(
            100deg,
            #7c4a2d 0%,
            #c47a4a 35%,
            #e8945e 50%,
            #c47a4a 65%,
            #7c4a2d 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rl-shimmer 4s linear infinite;
        }

        /* ─── House animations ──────────────────────────────────────── */
        .rl-house-float { animation: rl-float 4s ease-in-out infinite; }

        .rl-roof-path {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: rl-roof-draw 0.7s 0.1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .rl-wall-path {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: rl-house-draw 0.8s 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .rl-door-group {
          transform-origin: 55px 76px;
          animation: rl-door-rise 0.5s 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .rl-window   { animation: rl-window-blink 4s 1.2s ease-in-out infinite; }
        .rl-window-2 { animation: rl-window-blink 4s 2.2s ease-in-out infinite; }
        .rl-smoke-1  { animation: rl-smoke 2.5s 1.5s ease-out infinite; }
        .rl-smoke-2  { animation: rl-smoke 2.5s 2.1s ease-out infinite; }
        .rl-leaf     { animation: rl-leaf-sway 3s ease-in-out infinite; }
        .rl-leaf-2   { animation: rl-leaf-sway 3s 1.2s ease-in-out alternate-reverse infinite; }

        /* ─── Dots ──────────────────────────────────────────────────── */
        .rl-dot-1 { animation: rl-bounce-dot 1.4s 0.0s ease-in-out infinite; }
        .rl-dot-2 { animation: rl-bounce-dot 1.4s 0.2s ease-in-out infinite; }
        .rl-dot-3 { animation: rl-bounce-dot 1.4s 0.4s ease-in-out infinite; }

        /* ─── Step rows ─────────────────────────────────────────────── */
        .rl-step-row {
          display: flex;
          align-items: center;
          gap: 10px;
          /* min 44px touch target height on mobile */
          min-height: 44px;
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid transparent;
          transition: background 0.4s ease, border-color 0.4s ease;
          /* Prevent text wrapping weirdly on very small screens */
          word-break: break-word;
        }
        .rl-step-row.is-active {
          background: rgba(196,122,74,0.05);
          border-color: rgba(196,122,74,0.2);
        }
        .rl-step-row.is-done {
          background: rgba(196,122,74,0.09);
        }

        /* ─── Scrollbar hide on card (if overflow needed) ───────────── */
        .rl-card::-webkit-scrollbar { display: none; }
        .rl-card { scrollbar-width: none; }
      `}</style>

      {/*
        ── Outer overlay ──────────────────────────────────────────────
        Uses 100dvh (dynamic viewport height) so it covers the full
        screen on mobile browsers even when the address bar is visible.
        Padding accounts for safe-area insets on notched iPhones/iPads.
      */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          /* Safe-area-aware padding on all sides */
          paddingTop:    "max(16px, env(safe-area-inset-top))",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          paddingLeft:   "max(16px, env(safe-area-inset-left))",
          paddingRight:  "max(16px, env(safe-area-inset-right))",
          /* Use dvh so mobile URL bar doesn't crop the overlay */
          height: "100dvh",
        }}
        role="alertdialog"
        aria-modal="true"
        aria-live="assertive"
        aria-busy="true"
        aria-label={message}
      >
        {/* Warm dark backdrop */}
        <div
          className="absolute inset-0 backdrop-blur-md"
          style={{ background: "rgba(18, 10, 6, 0.78)" }}
        />

        {/* Ambient warm radial */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(196,122,74,0.09), transparent)",
          }}
        />

        {/*
          ── Card ────────────────────────────────────────────────────
          Width:    fluid from 288px (tiny phone) → 420px (tablet+)
          Padding:  fluid via clamp() — tighter on small screens
          Font:     clamp() scaling throughout
        */}
        <div
          className="rl-card relative w-full"
          style={{
            maxWidth: "min(420px, 100%)",
            borderRadius: "clamp(12px, 3vw, 20px)",
            background: "linear-gradient(170deg, #fdf8f3 0%, #f7ede0 100%)",
            border: "1px solid rgba(196,122,74,0.2)",
            boxShadow:
              "0 2px 0 rgba(255,255,255,0.95) inset, 0 24px 64px rgba(0,0,0,0.38), 0 6px 24px rgba(196,122,74,0.1)",
          }}
        >
          {/* Top accent stripe */}
          <div
            style={{
              height: 4,
              background:
                "linear-gradient(90deg, #9e5835 0%, #c47a4a 40%, #e8945e 60%, #c47a4a 80%, #9e5835 100%)",
              borderRadius: "inherit inherit 0 0",
              borderTopLeftRadius:  "clamp(12px, 3vw, 20px)",
              borderTopRightRadius: "clamp(12px, 3vw, 20px)",
            }}
          />

          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: "inherit",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "180px",
              opacity: 0.03,
            }}
          />

          {/* ── Content ─────────────────────────────────────────────── */}
          <div
            className="relative flex flex-col items-center text-center"
            style={{
              /* Fluid padding: tight on phones, comfortable on tablets */
              padding: "clamp(18px, 4vw, 32px) clamp(16px, 6vw, 36px) clamp(22px, 4vw, 32px)",
            }}
          >

            {/* House illustration — scales via SVG viewBox */}
            <div
              className="rl-house-float"
              style={{ marginBottom: "clamp(12px, 2.5vw, 20px)" }}
            >
              <svg
                /*
                  width/height are fluid: clamp between 88px (small phone)
                  and 120px (tablet+). viewBox stays fixed so all internal
                  coordinates are unchanged.
                */
                width="clamp(88px, 22vw, 120px)"
                height="clamp(73px, 18vw, 100px)"
                viewBox="0 0 120 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Left tree */}
                <g className="rl-leaf" style={{ transformOrigin: "15px 80px" }}>
                  <rect x="13" y="65" width="4" height="15" rx="1" fill="#4a7c59" opacity="0.65" />
                  <ellipse cx="15" cy="58" rx="8" ry="10" fill="#5a9468" opacity="0.7" />
                  <ellipse cx="15" cy="52" rx="6" ry="7" fill="#72b882" opacity="0.55" />
                </g>

                {/* Right tree */}
                <g className="rl-leaf-2" style={{ transformOrigin: "105px 80px" }}>
                  <rect x="103" y="65" width="4" height="15" rx="1" fill="#4a7c59" opacity="0.65" />
                  <ellipse cx="105" cy="59" rx="7" ry="9" fill="#5a9468" opacity="0.7" />
                  <ellipse cx="105" cy="54" rx="5" ry="6" fill="#72b882" opacity="0.55" />
                </g>

                {/* Ground */}
                <ellipse cx="60" cy="80" rx="38" ry="3" fill="rgba(160,100,60,0.1)" />
                <line x1="6" y1="80" x2="114" y2="80" stroke="rgba(196,122,74,0.18)" strokeWidth="1" strokeLinecap="round" />

                {/* Chimney */}
                <rect x="72" y="24" width="9" height="14" rx="1.5" fill="#c47a4a" opacity="0.85" />
                <rect x="70" y="22" width="13" height="4"  rx="1"   fill="#b56440" opacity="0.9"  />

                {/* Smoke */}
                <circle className="rl-smoke-1" cx="76" cy="20" r="3.5" fill="rgba(190,165,145,0.55)" />
                <circle className="rl-smoke-2" cx="78" cy="15" r="2.5" fill="rgba(190,165,145,0.4)"  />

                {/* Roof */}
                <path
                  className="rl-roof-path"
                  d="M20 40 L60 14 L100 40"
                  stroke="#9e5835"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path d="M20 40 L60 14 L100 40 Z" fill="#c47a4a" opacity="0.12" />
                <line x1="16" y1="40" x2="104" y2="40" stroke="#b56440" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

                {/* Walls */}
                <path
                  className="rl-wall-path"
                  d="M24 40 L24 80 L96 80 L96 40"
                  stroke="#c47a4a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <rect x="24" y="40" width="72" height="40" fill="#e8c4a4" opacity="0.2" rx="1" />

                {/* Left window */}
                <g className="rl-window">
                  <rect x="30" y="48" width="16" height="13" rx="2.5" fill="#b8d8f0" opacity="0.7"  />
                  <rect x="30" y="48" width="16" height="13" rx="2.5" stroke="#c47a4a" strokeWidth="0.8" opacity="0.4" fill="none" />
                  <line x1="38"   y1="48"   x2="38"   y2="61"   stroke="rgba(160,100,60,0.35)" strokeWidth="0.8" />
                  <line x1="30"   y1="54.5" x2="46"   y2="54.5" stroke="rgba(160,100,60,0.35)" strokeWidth="0.8" />
                </g>

                {/* Right window */}
                <g className="rl-window-2">
                  <rect x="74" y="48" width="16" height="13" rx="2.5" fill="#b8d8f0" opacity="0.7"  />
                  <rect x="74" y="48" width="16" height="13" rx="2.5" stroke="#c47a4a" strokeWidth="0.8" opacity="0.4" fill="none" />
                  <line x1="82"   y1="48"   x2="82"   y2="61"   stroke="rgba(160,100,60,0.35)" strokeWidth="0.8" />
                  <line x1="74"   y1="54.5" x2="90"   y2="54.5" stroke="rgba(160,100,60,0.35)" strokeWidth="0.8" />
                </g>

                {/* Door */}
                <g className="rl-door-group">
                  <rect x="51" y="58" width="18" height="22" rx="3"   fill="#9e5835" opacity="0.88" />
                  <path d="M51 61 Q60 53 69 61"                        fill="#9e5835" opacity="0.9"  />
                  <circle cx="66" cy="69.5" r="1.8"                    fill="#f7ede0" opacity="0.85" />
                  <rect x="53" y="60" width="14" height="8"  rx="1.5" fill="none" stroke="rgba(255,240,220,0.2)" strokeWidth="0.6" />
                  <rect x="53" y="70" width="14" height="8"  rx="1.5" fill="none" stroke="rgba(255,240,220,0.2)" strokeWidth="0.6" />
                </g>

                {/* Walkway */}
                <path
                  d="M54 80 Q53 87 50 94 M66 80 Q67 87 70 94"
                  stroke="rgba(196,122,74,0.2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* Eyebrow */}
            <p
              className="rl-body"
              style={{
                fontSize: "clamp(9px, 2.2vw, 11px)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c47a4a",
                opacity: 0.65,
                marginBottom: 4,
                animation: "rl-fade-up 0.5s 0.15s both",
              }}
            >
              Homilivo
            </p>

            {/* Title */}
            <h2
              className="rl-display rl-title-shimmer"
              style={{
                fontSize: "clamp(20px, 5vw, 26px)",
                fontWeight: 500,
                lineHeight: 1.2,
                marginBottom: "clamp(8px, 2vw, 12px)",
                animation: "rl-fade-up 0.5s 0.2s both, rl-shimmer 4s linear infinite",
              }}
            >
              Just a moment
            </h2>

            {/* Ornamental divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: "clamp(8px, 2vw, 12px)",
                width: "100%",
                animation: "rl-fade-up 0.5s 0.25s both",
              }}
            >
              <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(90deg, transparent, rgba(196,122,74,0.35))" }} />
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6 L6 2 L10 6 L6 10 Z" stroke="#c47a4a" strokeWidth="1" opacity="0.5" />
                <circle cx="6" cy="6" r="1.5" fill="#c47a4a" opacity="0.5" />
              </svg>
              <div style={{ flex: 1, height: "0.5px", background: "linear-gradient(90deg, rgba(196,122,74,0.35), transparent)" }} />
            </div>

            {/* Message */}
            <p
              className="rl-body"
              style={{
                fontSize: "clamp(12px, 3.2vw, 14px)",
                fontWeight: 400,
                lineHeight: 1.6,
                color: "#6b4c38",
                maxWidth: "100%",
                marginBottom: "clamp(14px, 3vw, 20px)",
                animation: "rl-fade-up 0.5s 0.3s both",
              }}
            >
              {message}
            </p>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: 3,
                borderRadius: 99,
                background: "rgba(196,122,74,0.12)",
                overflow: "hidden",
                marginBottom: "clamp(12px, 2.5vw, 18px)",
                animation: "rl-fade-in 0.4s 0.35s both",
              }}
            >
              <div
                key={tick}
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: "linear-gradient(90deg, #9e5835, #c47a4a, #e8945e)",
                  animation: "rl-progress 1.5s ease-out forwards",
                }}
              />
            </div>

            {/* Steps list */}
          
            {/* Bouncing dots */}
            <div
              style={{
                display: "flex",
                gap: 5,
                marginTop: "clamp(12px, 3vw, 18px)",
                animation: "rl-fade-in 0.4s 0.5s both",
              }}
            >
              {[
                { cls: "rl-dot-1", op: 0.8  },
                { cls: "rl-dot-2", op: 0.55 },
                { cls: "rl-dot-3", op: 0.3  },
              ].map((d, i) => (
                <div
                  key={i}
                  className={d.cls}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#c47a4a",
                    opacity: d.op,
                  }}
                />
              ))}
            </div>

            {/* Footer note */}
            <p
              className="rl-body"
              style={{
                marginTop: "clamp(10px, 2vw, 14px)",
                fontSize: "clamp(9px, 2.2vw, 11px)",
                color: "#b8927a",
                opacity: 0.55,
                letterSpacing: "0.04em",
              }}
            >
              Please keep this window open
            </p>
          </div>{/* /content */}
        </div>{/* /card */}
      </div>{/* /overlay */}
    </>
  );
}