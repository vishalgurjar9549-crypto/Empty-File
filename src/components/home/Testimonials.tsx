const testimonials = [
  {
    text: "I found my flat within 48 hours and saved a huge brokerage fee. Everything was smooth and transparent.",
    author: "Priya Sharma",
    role: "Senior Product Designer",
    loc: "Bangalore",
  },
  {
    text: "The room looked exactly like the photos. Verified listings and a very clean booking flow.",
    author: "Rahul Verma",
    role: "Tech Lead",
    loc: "Gurgaon",
  },
  {
    text: "The experience felt premium and trustworthy. Easily the best platform I’ve used for rentals.",
    author: "Ananya Desai",
    role: "Marketing Manager",
    loc: "Mumbai",
  },
  {
    text: "I found my flat within 48 hours and saved a huge brokerage fee. Everything was smooth and transparent.",
    author: "Priya Sharma",
    role: "Senior Product Designer",
    loc: "Bangalore",
  },
  {
    text: "The room looked exactly like the photos. Verified listings and a very clean booking flow.",
    author: "Rahul Verma",
    role: "Tech Lead",
    loc: "Gurgaon",
  },
  {
    text: "The experience felt premium and trustworthy. Easily the best platform I’ve used for rentals.",
    author: "Ananya Desai",
    role: "Marketing Manager",
    loc: "Mumbai",
  },
];

function Testimonials() {
  const gold = "rgba(212,175,55,0.9)";
  const goldSoft = "rgba(212,175,55,0.12)";
  const goldBorder = "rgba(212,175,55,0.2)";
  const dark = "#0d0b06";

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-end justify-between gap-4">
          <div>
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: goldBorder, color: gold }}
            >
              Guest Reviews
            </span>

            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Loved by Residents
            </h2>

            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Real experiences from people who found their perfect place.
            </p>
          </div>
        </div>

        {/* Rail */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar scroll-smooth">
            {testimonials.map((t, i) => (
              <article
                key={i}
                className="snap-start shrink-0 w-[85%] sm:w-[360px] lg:w-[380px] rounded-2xl border p-5 transition-all duration-300 "
                style={{
                  borderColor: goldBorder,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(248,250,252,0.92) 100%)",
                }}
              >
                {/* Dark mode overlay fix */}
                <div className="dark:hidden absolute inset-0 pointer-events-none rounded-2xl" />
                <div
                  className="hidden dark:block absolute inset-0 pointer-events-none rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(20,20,20,0.92) 0%, rgba(13,11,6,0.98) 100%)",
                  }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Top Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-sm">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} style={{ color: gold }}>
                          ★
                        </span>
                      ))}
                    </div>

                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold"
                      style={{
                        background: goldSoft,
                        color: gold,
                        border: `1px solid ${goldBorder}`,
                      }}
                    >
                      “
                    </div>
                  </div>

                  {/* Text */}
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300 line-clamp-4 min-h-[96px]">
                    {t.text}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{
                        background: goldSoft,
                        color: gold,
                        border: `1px solid ${goldBorder}`,
                      }}
                    >
                      {t.author[0]}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {t.author}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {t.role}, {t.loc}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;