import { getTranslations } from "next-intl/server";
import Reveal from "./Reveal";
import type { TrustedBy as TB } from "@/lib/types";

function LogoCard({ l }: { l: TB }) {
  return (
    <div className="mx-2 grid h-[88px] w-[200px] flex-none place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-4 text-center font-[var(--font-display)] text-[15px] font-extrabold text-[#0A0A0A] shadow-lg transition-all duration-300 ease-apple hover:border-accent hover:shadow-accent/20">
      {l.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={l.logo} alt={l.company_name} className="max-h-[70%] max-w-[85%] object-contain transition-transform duration-300 hover:scale-105" />
      ) : (
        l.company_name
      )}
    </div>
  );
}

export default async function TrustedBy({ logos }: { logos: TB[] }) {
  const t = await getTranslations("sections");
  if (!logos.length) return null;
  // Duplicate the row; the animation moves exactly half the track width,
  // so when it loops back the duplicate is pixel-identical = seamless.
  const row = [...logos, ...logos];
  return (
    <section id="trusted" className="border-t border-white/5 py-24 md:py-32">
      <Reveal className="container-x mx-auto mb-12 max-w-[40ch] text-center">
        <span className="eyebrow">{t("trusted")}</span>
        <h2 className="h-display mt-4 text-[clamp(28px,4.5vw,52px)]">{t("trustedH")}</h2>
      </Reveal>
      <Reveal delay={0.1}>
        {/* full-bleed marquee with soft fade edges */}
        <div className="marquee-mask relative w-full overflow-hidden">
          <div className="marquee-track flex w-max">
            {row.map((l, i) => (
              <LogoCard key={`${l.id}-${i}`} l={l} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
