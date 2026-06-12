"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { trackLineClick, trackEmailClick, trackPhoneClick, trackContactSubmit } from "@/lib/analytics";
import { LINE_URL, EMAIL, PHONE, PHONE_RAW } from "@/lib/utils";
import { submitEnquiry } from "@/app/actions/contact";

export default function Contact() {
  const t = useTranslations("contact");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [f, setF] = useState({ name: "", email: "", type: "", msg: "" });
  const submit = async () => {
    if (!f.name || !f.email || sending) return;
    setSending(true);
    try {
      await submitEnquiry(f);          // stored in the site's database — no mail app
      trackContactSubmit(f.type);
      setSent(true);
      setF({ name: "", email: "", type: "", msg: "" });
    } catch (e) {
      alert(String(e));
    } finally {
      setSending(false);
    }
  };
  return (
    <section id="contact" className="container-x border-t border-white/5 py-24 md:py-32">
      <div className="mb-12">
        <span className="eyebrow"><span className="inline-block h-px w-9 bg-accent" />{t("eyebrow")}</span>
        <h2 className="h-display mt-4 text-[clamp(32px,5.5vw,64px)]">{t("h")}</h2>
        <p className="mt-4 max-w-[54ch] text-muted">{t("lead")}</p>
      </div>
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {(["name", "email", "type"] as const).map((k) => (
            <div key={k} className="mb-4">
              <label className="mb-2 block text-[13px] font-semibold text-muted">{t(k)}</label>
              <input value={f[k === "type" ? "type" : k]} onChange={(e) => setF({ ...f, [k === "type" ? "type" : k]: e.target.value })} className="w-full rounded-[14px] border border-white/10 bg-surface px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20" />
            </div>
          ))}
          <div className="mb-4">
            <label className="mb-2 block text-[13px] font-semibold text-muted">{t("message")}</label>
            <textarea rows={5} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} className="w-full resize-y rounded-[14px] border border-white/10 bg-surface px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20" />
          </div>
          <button onClick={submit} disabled={sending} className="btn-fill">{sending ? "…" : sent ? "✓ Sent" : t("send")}</button>
          {sent && <p className="mt-3 text-sm text-accent">✓ Got it — I&apos;ll reply within 48 hours.</p>}
        </div>

        <div className="flex flex-col gap-6">
          <InfoRow label={t("email")} value={EMAIL} href={`mailto:${EMAIL}`} onClick={trackEmailClick} />
          <InfoRow label={t("phone")} value={PHONE} href={`tel:${PHONE_RAW}`} onClick={trackPhoneClick} />
          <InfoRow label={t("studio")} value={t("studioVal")} />
          <a href={LINE_URL} target="_blank" rel="noopener" onClick={trackLineClick} className="flex items-center gap-3.5 transition-transform hover:translate-x-1">
            <span className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-[#06C755]/50 text-[#06C755]"><LineIcon /></span>
            <span><div className="text-xs uppercase tracking-wider text-muted">LINE</div><div className="font-semibold">Thappasorn</div></span>
          </a>

          <div className="card-glass mt-1 flex flex-col items-center gap-3 p-6 text-center">
            <a href={LINE_URL} target="_blank" rel="noopener" onClick={trackLineClick} className="rounded-2xl bg-white p-3 transition-transform hover:scale-105">
              <img src="/line-qr.png" alt="LINE QR" width={184} height={184} />
            </a>
            <div className="text-sm text-muted">{t("scan")}</div>
            <div className="text-sm">{t("lineId")}: <b className="text-accent">Thappasorn</b></div>
            <a href={LINE_URL} target="_blank" rel="noopener" onClick={trackLineClick} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06C755] py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#05b14b]"><LineIcon />{t("addLine")}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value, href, onClick }: { label: string; value: string; href?: string; onClick?: () => void }) {
  const inner = (<><div className="text-xs uppercase tracking-wider text-muted">{label}</div><div className="font-semibold">{value}</div></>);
  return href ? <a href={href} onClick={onClick} className="block transition-transform hover:translate-x-1">{inner}</a> : <div>{inner}</div>;
}
function LineIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 3C6.48 3 2 6.62 2 11.08c0 3.99 3.55 7.33 8.35 7.97.32.07.77.21.88.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.99.86.54 1.07-.45 5.74-3.38 7.83-5.79C21.13 14.39 22 12.84 22 11.08 22 6.62 17.52 3 12 3z" /></svg>;
}
