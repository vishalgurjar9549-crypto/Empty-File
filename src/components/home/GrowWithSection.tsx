import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  BadgePercent,
  Users,
  ArrowRight,
} from "lucide-react";
import { PhoneModal } from "../PhoneModal";
import { useListPropertyAction } from "../../hooks/useListPropertyAction";

type PartnerCard = {
  title: string;
  description: string;
  icon: React.ElementType;
  cta: string;
  to?: string;
  badge?: string;
  action?: "list-property";
};

const partnerCards: PartnerCard[] = [
  {
    title: "List Your Property",
    description:
      "Own apartments, rooms, hostels, or vacation stays? Partner with Homilivo and start getting quality bookings.",
    icon: Building2,
    cta: "List Now",
    badge: "For Owners",
    action: "list-property",
  },
  {
    title: "Affiliate Partner",
    description:
      "Earn by referring users, properties, or bookings through your network, audience, or community.",
    icon: BadgePercent,
    cta: "Join Affiliate",
    to: "/partner/affiliate",
    badge: "Earn With Us",
  },
  {
    title: "Become an Agent",
    description:
      "Work with us as a trusted field or booking partner and help property owners grow occupancy.",
    icon: Users,
    cta: "Apply as Agent",
    to: "/partner/agent",
    badge: "Growth Partner",
  },
];

export default function GrowWithSection() {
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const { handleListPropertyClick } = useListPropertyAction({
    onRequirePhone: () => setShowPhoneModal(true),
  });

  return (
    <>
      <section className="relative overflow-hidden bg-background py-6 sm:py-8 lg:py-12">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-80px] top-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl dark:bg-yellow-500/10" />
          <div className="absolute right-[-100px] bottom-0 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl dark:bg-yellow-400/10" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
              Partnerships
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Grow With <span className="text-amber-300">Homilivo</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Whether you own property, bring bookings, or build communities —
              there’s a place for you in the Homilivo ecosystem.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partnerCards.map((item, index) => {
              const Icon = item.icon;

              const cardContent = (
                <>
                  {/* Glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-amber-400/10 to-transparent" />
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <div className="mb-3">
                      <span className="inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/15 to-amber-500/5 text-amber-500 shadow-inner">
                    <Icon className="h-6 w-6" strokeWidth={1.9} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold leading-snug text-foreground">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-700 transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black dark:text-amber-300 dark:group-hover:text-black">
                      {item.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </>
              );

              if (item.action === "list-property") {
                return (
                  <button
                    key={index}
                    onClick={handleListPropertyClick}
                    className="group relative flex w-full flex-col sm:min-h-[220px] lg:min-h-[240px] overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-4 sm:p-5 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10 dark:bg-white/[0.03]"
                  >
                    {cardContent}
                  </button>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.to || "#"}
                  className="group relative flex flex-col sm:min-h-[220px] lg:min-h-[240px] overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-4 sm:p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10 dark:bg-white/[0.03]"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {showPhoneModal && (
        <PhoneModal onClose={() => setShowPhoneModal(false)} />
      )}
    </>
  );
}