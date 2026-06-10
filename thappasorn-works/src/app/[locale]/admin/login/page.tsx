"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/utils";

export default function Login() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(typeof window !== "undefined" && new URLSearchParams(window.location.search).get("denied") ? "Access denied — this account is not the site owner." : "");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setErr("");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { setErr("Supabase is not configured yet (see README)."); setBusy(false); return; }
    // Hard client-side guard before even attempting auth
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setErr("Access denied — only the site owner may sign in."); setBusy(false); return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) { setBusy(false); setErr(error.message); return; }
    // Verify the signed-in identity is the owner; otherwise sign back out.
    if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setBusy(false); setErr("Access denied — this account is not authorized."); return;
    }
    setBusy(false);
    router.replace("/admin");
  };

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="card-glass w-full max-w-[420px] p-10 text-center">
        <div className="mx-auto mb-5 grid h-15 w-15 place-items-center rounded-full bg-accent text-bg" style={{ height: 60, width: 60 }}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>
        <h1 className="h-display text-2xl">{t("login")}</h1>
        <p className="mt-2 text-sm text-muted">{t("loginSub")}</p>
        <div className="mt-6 space-y-3 text-left">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("username")} className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={t("password")} className="w-full rounded-xl border border-white/10 bg-bg px-4 py-3 text-sm outline-none focus:border-accent" />
        </div>
        <button onClick={submit} disabled={busy} className="btn-fill mt-5 w-full justify-center disabled:opacity-60">{busy ? "…" : t("signin")}</button>
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      </div>
    </div>
  );
}
