"use client";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  saveProject, deleteProject, toggleFeatured,
  saveReview, deleteReview, saveLogo, deleteLogo, exportTable,
  markEnquiryRead, deleteEnquiry, saveSettings, saveHero,
} from "@/app/[locale]/admin/actions";
import type { Project, Review, TrustedBy, Category, Enquiry, SiteSettings, HeroContent, HeroFields } from "@/lib/types";
import { trackDownload } from "@/lib/analytics";

type Analytics = { visitors: number; views: number; line: number; email: number; phone: number; top: { title: string; slug: string; views: number }[] } | null;
const CATS: Category[] = ["graphics", "shot-videos", "long-form-video", "filming-photography"];

/** Upload straight from the browser to Cloudinary (unsigned preset).
 *  Bypasses the server entirely, so large images & videos work
 *  (server actions on Vercel are limited to ~1MB bodies). */
async function uploadDirect(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud) throw new Error("Cloudinary cloud name is not configured");
  if (!preset) throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET — create an unsigned upload preset in Cloudinary and add it to Vercel env");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || "Cloudinary upload failed");
  return json.secure_url as string;
}

export default function AdminDashboard({ configured, projects, reviews, trusted, analytics, enquiries = [], settings }: {
  configured: boolean; projects: Project[]; reviews: Review[]; trusted: TrustedBy[]; analytics: Analytics;
  enquiries?: Enquiry[];
  settings: SiteSettings;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [tab, setTab] = useState<"analytics" | "projects" | "hero" | "stats" | "reviews" | "logos" | "inbox" | "backup">("analytics");
  const [busy, setBusy] = useState(false);

  const logout = async () => { if (configured) await createClient().auth.signOut(); router.replace("/admin/login"); };
  const refresh = () => router.refresh();
  const guard = (fn: () => Promise<void>) => async () => {
    if (!configured) { alert("Connect Supabase first (see README) to enable saving."); return; }
    setBusy(true); try { await fn(); refresh(); } catch (e) { alert(String(e)); } finally { setBusy(false); }
  };

  return (
    <div className="container-x py-12">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-3xl">THAPPASORN WORKS · {t("dashboard")}</h1>
        <button onClick={logout} className="btn-ghost">{t("logout")}</button>
      </div>
      {!configured && <p className="mt-4 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent">Demo mode — Supabase isn&apos;t configured. Add your keys (README) to enable uploads &amp; saving.</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {(["analytics", "projects", "hero", "stats", "reviews", "logos", "inbox", "backup"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`chip ${tab === k ? "chip-on" : ""}`}>{t(k)}</button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "analytics" && analytics && (
          <div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {[["visitors", analytics.visitors], ["views", analytics.views], ["lineClicks", analytics.line], ["emailClicks", analytics.email], ["phoneClicks", analytics.phone]].map(([k, v]) => (
                <div key={k as string} className="card-glass p-5"><div className="h-display text-3xl text-accent">{v as number}</div><div className="mt-1 text-xs uppercase tracking-wider text-muted">{t(k as string)}</div></div>
              ))}
            </div>
            <h3 className="mt-8 mb-3 text-sm uppercase tracking-wider text-muted">{t("topProjects")}</h3>
            <div className="space-y-2">
              {analytics.top.map((p) => <div key={p.slug} className="flex justify-between rounded-lg border border-white/5 px-4 py-2.5 text-sm"><span>{p.title}</span><span className="text-accent">{p.views} views</span></div>)}
            </div>
          </div>
        )}

        {tab === "projects" && <ProjectsTab projects={projects} busy={busy} guard={guard} />}
        {tab === "reviews" && <ReviewsTab reviews={reviews} busy={busy} guard={guard} />}
        {tab === "logos" && <LogosTab trusted={trusted} busy={busy} guard={guard} />}
        {tab === "inbox" && <InboxTab enquiries={enquiries} busy={busy} guard={guard} />}
        {tab === "stats" && <StatsTab settings={settings} busy={busy} guard={guard} />}
        {tab === "hero" && <HeroTab settings={settings} busy={busy} guard={guard} />}
        {tab === "backup" && <BackupTab configured={configured} />}
      </div>
    </div>
  );
}

/* ---------------- Projects ---------------- */
function ProjectsTab({ projects, busy, guard }: { projects: Project[]; busy: boolean; guard: (fn: () => Promise<void>) => () => void }) {
  const empty: Partial<Project> = { title: "", category: "graphics", tags: [], featured: false, gallery: [], orientation: "square" };
  const [f, setF] = useState<Partial<Project>>(empty);
  const upload = async (file: File) => { try { return await uploadDirect(file); } catch (e) { alert(String(e)); throw e; } };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form className="card-glass space-y-3 p-5" onSubmit={(e) => e.preventDefault()}>
        <Field label="Title"><input className="inp" value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Category">
          <select className="inp" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category })}>
            {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Tags (comma separated)"><input className="inp" value={(f.tags ?? []).join(", ")} onChange={(e) => setF({ ...f, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client"><input className="inp" value={f.client ?? ""} onChange={(e) => setF({ ...f, client: e.target.value })} /></Field>
          <Field label="Year"><input className="inp" value={f.year ?? ""} onChange={(e) => setF({ ...f, year: e.target.value })} /></Field>
        </div>
        <Field label="Video URL"><input className="inp" value={f.video_url ?? ""} onChange={(e) => setF({ ...f, video_url: e.target.value })} /></Field>
        <Field label="Card shape / orientation">
          <select className="inp" value={f.orientation ?? "square"} onChange={(e) => setF({ ...f, orientation: e.target.value as Project["orientation"] })}>
            <option value="square">Square 1:1</option>
            <option value="landscape">Landscape 16:9 (yok video)</option>
            <option value="portrait">Portrait 9:16 (tang video / Reels / TikTok)</option>
          </select>
        </Field>
        {(["challenge", "solution", "results"] as const).map((k) => (
          <Field key={k} label={k}><textarea className="inp" rows={2} value={(f[k] as string) ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>
        ))}
        <Field label="Thumbnail">
          <input type="file" accept="image/*,video/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setF({ ...f, thumbnail: await upload(file) }); }} />
          {f.thumbnail && <span className="text-xs text-accent">✓ uploaded</span>}
        </Field>
        <Field label="Gallery (multiple)">
          <input type="file" multiple accept="image/*" onChange={async (e) => { const urls: string[] = []; for (const file of Array.from(e.target.files ?? [])) urls.push(await upload(file)); setF({ ...f, gallery: [...(f.gallery ?? []), ...urls] }); }} />
          {f.gallery?.length ? <span className="text-xs text-accent">✓ {f.gallery.length} files</span> : null}
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={!!f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Featured</label>
        <button disabled={busy} onClick={guard(async () => { await saveProject(f); setF(empty); })} className="btn-fill w-full justify-center">{f.id ? "Save changes" : "+ Add project"}</button>
      </form>

      <div className="space-y-4">
        <BulkAdd guard={guard} busy={busy} />
        <div className="space-y-2">
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-surface" />
            <div className="min-w-0 flex-1"><div className="truncate font-semibold">{p.title}</div><div className="text-xs text-muted">{p.category}</div></div>
            <button onClick={guard(async () => toggleFeatured(p.id, !p.featured))} className={`text-lg ${p.featured ? "text-accent" : "text-white/30"}`}>★</button>
            <button onClick={() => setF(p)} className="text-sm text-muted hover:text-accent">edit</button>
            <button onClick={guard(async () => deleteProject(p.id))} className="text-sm text-muted hover:text-red-400">delete</button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Bulk add ---------------- */
function BulkAdd({ guard, busy }: { busy: boolean; guard: (fn: () => Promise<void>) => () => void }) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState("");
  const [cat, setCat] = useState<Category>("shot-videos");
  const [orient, setOrient] = useState<NonNullable<Project["orientation"]>>("portrait");
  const [progress, setProgress] = useState("");

  async function titleFor(url: string): Promise<string> {
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(4000) });
      const j = await res.json();
      if (j?.title) return String(j.title);
    } catch {}
    return "Untitled video";
  }

  const addLinks = guard(async () => {
    const urls = links.split(/\n+/).map((u) => u.trim()).filter(Boolean);
    if (!urls.length) { alert("Paste at least one link (one per line)"); return; }
    let done = 0;
    for (const url of urls) {
      setProgress(`Adding ${done + 1}/${urls.length}…`);
      const title = await titleFor(url);
      await saveProject({ title, category: cat, orientation: orient, video_url: url, tags: [], gallery: [], featured: false });
      done++;
    }
    setProgress(`✓ Added ${done} projects`);
    setLinks("");
  });

  const addImages = guard(async () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.multiple = true;
    const files: File[] = await new Promise((res) => { input.onchange = () => res(Array.from(input.files ?? [])); input.click(); });
    if (!files.length) return;
    let done = 0;
    for (const file of files) {
      setProgress(`Uploading ${done + 1}/${files.length}…`);
      const url = await uploadDirect(file);
      const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled";
      await saveProject({ title, category: cat, orientation: orient, thumbnail: url, tags: [], gallery: [], featured: false });
      done++;
    }
    setProgress(`✓ Added ${done} projects`);
  });

  return (
    <div className="card-glass p-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left font-semibold">
        <span>⚡ Bulk add <span className="text-xs font-normal text-muted">— add many at once</span></span>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category for all">
              <select className="inp" value={cat} onChange={(e) => setCat(e.target.value as Category)}>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Card shape for all">
              <select className="inp" value={orient} onChange={(e) => setOrient(e.target.value as NonNullable<Project["orientation"]>)}>
                <option value="portrait">Portrait 9:16</option>
                <option value="landscape">Landscape 16:9</option>
                <option value="square">Square 1:1</option>
              </select>
            </Field>
          </div>
          <Field label="Video links — one per line (YouTube / TikTok / Drive)">
            <textarea className="inp" rows={4} placeholder={"https://youtu.be/...\nhttps://youtu.be/..."} value={links} onChange={(e) => setLinks(e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={addLinks} className="btn-fill">Add all links</button>
            <button disabled={busy} onClick={addImages} className="btn-line">Or pick many images…</button>
          </div>
          {progress && <div className="text-sm text-accent">{progress}</div>}
          <p className="text-xs text-muted">Titles come from YouTube automatically (editable later). Images use their filename as the title.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- Hero text (multilingual) ---------------- */
const HERO_LANGS = [["en", "English"], ["th", "ไทย"], ["cn", "中文"], ["jp", "日本語"]] as const;
const HERO_FIELDS: { k: keyof HeroFields; label: string }[] = [
  { k: "roles", label: "Roles line (top, small caps)" },
  { k: "l1", label: "Headline line 1" },
  { k: "l2", label: "Headline line 2" },
  { k: "l3", label: "Headline line 3" },
  { k: "lead", label: "Description paragraph" },
  { k: "cta1", label: "Button 1 (View My Work)" },
  { k: "cta2", label: "Button 2 (Contact Me)" },
];

function HeroTab({ settings, busy, guard }: { settings: SiteSettings; busy: boolean; guard: (fn: () => Promise<void>) => () => void }) {
  const [hero, setHero] = useState<HeroContent>(settings.hero ?? {});
  const [lang, setLang] = useState<(typeof HERO_LANGS)[number][0]>("en");
  const [saved, setSaved] = useState(false);
  const cur = hero[lang] ?? {};
  const set = (k: keyof HeroFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHero({ ...hero, [lang]: { ...cur, [k]: e.target.value } }); setSaved(false);
  };
  const save = guard(async () => { await saveHero(hero); setSaved(true); });

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-muted">Edit the homepage hero text per language. Leave a field blank to keep the built-in default for that language.</p>
      <div className="flex flex-wrap gap-2">
        {HERO_LANGS.map(([code, name]) => (
          <button key={code} onClick={() => setLang(code)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${lang === code ? "bg-accent text-black" : "bg-white/5 text-muted hover:text-ink"}`}>
            {name}
          </button>
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-white/8 p-4">
        {HERO_FIELDS.map(({ k, label }) => (
          <Field key={k} label={label}>
            {k === "lead" ? (
              <textarea className="inp" rows={3} value={cur[k] ?? ""} onChange={set(k)} placeholder="(uses default if empty)" />
            ) : (
              <input className="inp" value={cur[k] ?? ""} onChange={set(k)} placeholder="(uses default if empty)" />
            )}
          </Field>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button disabled={busy} onClick={save} className="btn-fill">Save hero text</button>
        {saved && <span className="text-sm text-accent">✓ Saved — refresh the homepage</span>}
      </div>
    </div>
  );
}

/* ---------------- Stats (editable hero numbers) ---------------- */
function StatsTab({ settings, busy, guard }: { settings: SiteSettings; busy: boolean; guard: (fn: () => Promise<void>) => () => void }) {
  const [v, setV] = useState(settings);
  const [saved, setSaved] = useState(false);
  const num = (k: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement>) => { setV({ ...v, [k]: Number(e.target.value) }); setSaved(false); };
  const save = guard(async () => { await saveSettings(v); setSaved(true); });
  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-muted">These numbers show in the band under the hero. Edit and save — no code upload needed.</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Projects delivered"><input type="number" className="inp" value={v.stat_projects} onChange={num("stat_projects")} /></Field>
        <Field label="Happy clients"><input type="number" className="inp" value={v.stat_clients} onChange={num("stat_clients")} /></Field>
        <Field label="Countries served"><input type="number" className="inp" value={v.stat_countries} onChange={num("stat_countries")} /></Field>
        <Field label="Years of experience"><input type="number" className="inp" value={v.stat_years} onChange={num("stat_years")} /></Field>
      </div>
      <Field label="Showreel video URL (YouTube/Vimeo/MP4) — plays behind the hero">
        <input className="inp" placeholder="https://youtu.be/... or .mp4 link" value={v.showreel_url ?? ""} onChange={(e) => { setV({ ...v, showreel_url: e.target.value }); setSaved(false); }} />
      </Field>
      <div className="flex items-center gap-3">
        <button disabled={busy} onClick={save} className="btn-fill">Save stats</button>
        {saved && <span className="text-sm text-accent">✓ Saved — refresh the homepage to see it</span>}
      </div>
    </div>
  );
}

/* ---------------- Inbox (contact enquiries) ---------------- */
function InboxTab({ enquiries, busy, guard }: { enquiries: Enquiry[]; busy: boolean; guard: (fn: () => Promise<void>) => () => void }) {
  if (!enquiries.length) return <p className="text-muted">No enquiries yet. Messages sent from the contact form will appear here.</p>;
  return (
    <div className="space-y-3">
      {enquiries.map((q) => (
        <div key={q.id} className={`rounded-xl border p-4 ${q.read ? "border-white/5 opacity-60" : "border-accent/40"}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold">{q.name}</span>
            <a href={`mailto:${q.email}`} className="text-sm text-accent hover:underline">{q.email}</a>
            {q.project_type && <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted">{q.project_type}</span>}
            <span className="ml-auto text-xs text-muted">{new Date(q.created_at).toLocaleString()}</span>
          </div>
          {q.message && <p className="mt-2 whitespace-pre-wrap text-sm text-ink/90">{q.message}</p>}
          <div className="mt-3 flex gap-3 text-sm">
            <button disabled={busy} onClick={guard(async () => markEnquiryRead(q.id, !q.read))} className="text-muted hover:text-accent">{q.read ? "Mark unread" : "Mark read"}</button>
            <button disabled={busy} onClick={guard(async () => deleteEnquiry(q.id))} className="text-muted hover:text-red-400">delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Reviews ---------------- */
function ReviewsTab({ reviews, busy, guard }: { reviews: Review[]; busy: boolean; guard: (fn: () => Promise<void>) => () => void }) {
  const empty: Partial<Review> = { client_name: "", rating: 5, featured: false };
  const [f, setF] = useState<Partial<Review>>(empty);
  const upload = async (file: File) => { try { return await uploadDirect(file); } catch (e) { alert(String(e)); throw e; } };
  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form className="card-glass space-y-3 p-5" onSubmit={(e) => e.preventDefault()}>
        <Field label="Client name"><input className="inp" value={f.client_name ?? ""} onChange={(e) => setF({ ...f, client_name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Position"><input className="inp" value={f.position ?? ""} onChange={(e) => setF({ ...f, position: e.target.value })} /></Field>
          <Field label="Company"><input className="inp" value={f.company ?? ""} onChange={(e) => setF({ ...f, company: e.target.value })} /></Field>
        </div>
        <Field label="Rating">
          <div className="text-2xl">{[1, 2, 3, 4, 5].map((n) => <span key={n} onClick={() => setF({ ...f, rating: n })} className={`cursor-pointer ${n <= (f.rating ?? 5) ? "text-accent" : "text-white/20"}`}>★</span>)}</div>
        </Field>
        <Field label="Review text"><textarea className="inp" rows={3} value={f.review_text ?? ""} onChange={(e) => setF({ ...f, review_text: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Project type"><input className="inp" value={f.project_type ?? ""} onChange={(e) => setF({ ...f, project_type: e.target.value })} /></Field>
          <Field label="Date"><input className="inp" value={f.date_completed ?? ""} onChange={(e) => setF({ ...f, date_completed: e.target.value })} /></Field>
        </div>
        <Field label="Profile photo"><input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setF({ ...f, profile_image: await upload(file) }); }} /></Field>
        <Field label="Signature"><input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setF({ ...f, signature_image: await upload(file) }); }} /></Field>
        <Field label="Video review URL"><input className="inp" value={f.video_review ?? ""} onChange={(e) => setF({ ...f, video_review: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={!!f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Featured</label>
        <button disabled={busy} onClick={guard(async () => { await saveReview(f); setF(empty); })} className="btn-fill w-full justify-center">{f.id ? "Save" : "+ Add review"}</button>
      </form>
      <div className="space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-white/5 p-3">
            <div className="min-w-0 flex-1"><div className="font-semibold">{r.client_name} <span className="text-accent">{"★".repeat(r.rating)}</span></div><div className="text-xs text-muted">{r.company}</div></div>
            <button onClick={() => setF(r)} className="text-sm text-muted hover:text-accent">edit</button>
            <button onClick={guard(async () => deleteReview(r.id))} className="text-sm text-muted hover:text-red-400">delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Logos ---------------- */
function LogosTab({ trusted, busy, guard }: { trusted: TrustedBy[]; busy: boolean; guard: (fn: () => Promise<void>) => () => void }) {
  const [name, setName] = useState(""); const [logo, setLogo] = useState<string | undefined>();
  const upload = async (file: File) => { try { return await uploadDirect(file); } catch (e) { alert(String(e)); throw e; } };
  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form className="card-glass space-y-3 p-5" onSubmit={(e) => e.preventDefault()}>
        <Field label="Brand / client name"><input className="inp" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Logo image"><input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setLogo(await upload(file)); }} />{logo && <span className="text-xs text-accent">✓ uploaded</span>}</Field>
        <button disabled={busy} onClick={guard(async () => { await saveLogo({ company_name: name || "Brand", logo }); setName(""); setLogo(undefined); })} className="btn-fill w-full justify-center">+ Add logo</button>
      </form>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {trusted.map((l) => (
          <div key={l.id} className="relative grid aspect-[16/7] place-items-center rounded-xl border border-white/5 text-sm text-muted">
            {l.logo ? <img src={l.logo} alt={l.company_name} className="max-h-[60%] object-contain" /> : l.company_name}
            <button onClick={guard(async () => deleteLogo(l.id))} className="absolute right-1.5 top-1.5 text-xs text-white/40 hover:text-red-400">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Backup & Recovery ---------------- */
function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("|") : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  trackDownload(name);
}
function BackupTab({ configured }: { configured: boolean }) {
  const t = useTranslations("admin");
  const [last, setLast] = useState<string>(typeof window !== "undefined" ? localStorage.getItem("tw_last_backup") || "" : "");
  const [busy, setBusy] = useState("");
  const stamp = () => new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");

  const run = (table: "all" | "projects" | "reviews" | "trusted_by", fmt: "json" | "csv") => async () => {
    if (!configured) { alert("Connect Supabase first to export live data."); return; }
    setBusy(table + fmt);
    try {
      const res = await exportTable(table);
      if (fmt === "json") {
        download(`thappasorn-${table}-${stamp()}.json`, JSON.stringify(res, null, 2), "application/json");
      } else {
        const rows = table === "all" ? (res as { projects: Record<string, unknown>[] }).projects : (res as { rows: Record<string, unknown>[] }).rows;
        download(`thappasorn-${table}-${stamp()}.csv`, toCSV(rows), "text/csv");
      }
      const now = new Date().toLocaleString();
      localStorage.setItem("tw_last_backup", now); setLast(now);
    } catch (e) { alert(String(e)); } finally { setBusy(""); }
  };

  const Row = ({ label, table }: { label: string; table: "all" | "projects" | "reviews" | "trusted_by" }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 p-4">
      <span className="font-semibold">{label}</span>
      <div className="flex gap-2">
        <button disabled={!!busy} onClick={run(table, "json")} className="chip">{busy === table + "json" ? "…" : "JSON"}</button>
        <button disabled={!!busy} onClick={run(table, "csv")} className="chip">{busy === table + "csv" ? "…" : "CSV"}</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-3">
      <div className="card-glass p-5">
        <div className="text-xs uppercase tracking-wider text-muted">{t("lastBackup")}</div>
        <div className="h-display mt-1 text-xl text-accent">{last || t("noBackup")}</div>
        <p className="mt-2 text-xs text-muted">Exports contain content rows only — never API keys, service-role tokens or secrets.</p>
      </div>
      <Row label={t("exportDb")} table="all" />
      <Row label={t("exportProjects")} table="projects" />
      <Row label={t("exportReviews")} table="reviews" />
      <Row label={t("exportTrusted")} table="trusted_by" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>{children}</label>;
}
