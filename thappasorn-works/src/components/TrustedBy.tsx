import { getTranslations } from "next-intl/server";
import Reveal from "./Reveal";
import { grad } from "@/lib/utils";
import type { TrustedBy as TB } from "@/lib/types";

export default async function TrustedBy({ logos }: { logos: TB[] }) {
  const t = await getTranslations("sections");
  return (
    <section id="trusted" className="container-x border-t border-white/5 py-24 md:py-32">
      <Reveal className="mx-auto mb-12 max-w-[40ch] text-center">
        <span className="eyebrow">{t("trusted")}</span>
        <h2 className="h-display mt-4 text-[clamp(28px,4.5vw,52px)]">{t("trustedH")}</h2>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-3 gap-3.5 md:grid-cols-6">
          {logos.map((l) => (
            <div key={l.id} className="grid aspect-[16/7] place-items-center overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-2 text-center font-[var(--font-display)] text-[15px] font-extrabold text-muted transition-all duration-300 ease-apple hover:-translate-y-1 hover:border-accent hover:bg-accent/5 hover:text-ink" style={l.logo ? {} : { background: undefined }}>
              {l.logo ? <img src={l.logo} alt={l.company_name} className="max-h-[60%] max-w-[80%] object-contain opacity-85 [filter:grayscale(1)_brightness(2)]" /> : l.company_name}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
