const GRADS: [string, string][] = [
  ["#1e1b4b", "#4338ca"], ["#0f172a", "#334155"], ["#7c2d12", "#ea580c"],
  ["#064e3b", "#10b981"], ["#831843", "#ec4899"], ["#1e3a8a", "#3b82f6"],
  ["#451a03", "#d97706"], ["#3b0764", "#a855f7"], ["#0c4a6e", "#06b6d4"],
  ["#18181b", "#52525b"],
];
/** Deterministic gradient fallback used when a project has no thumbnail. */
export function grad(ci = 0): string {
  const [a, b] = GRADS[ci % GRADS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export const LINE_URL = "https://line.me/ti/p/epuhxEGbfG";
export const EMAIL = "thappasorn.boonphu@gmail.com";
export const PHONE = "098 989 9058";
export const PHONE_RAW = "0989899058";

export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "thappasorn.boonphu@gmail.com").toLowerCase();
