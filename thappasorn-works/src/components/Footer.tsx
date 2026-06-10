export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-5 py-14 sm:px-8 lg:px-12">
      <div className="container-x flex flex-wrap items-end justify-between gap-8">
        <div className="h-display bg-gradient-to-r from-accent to-white bg-clip-text text-[clamp(40px,8vw,96px)] leading-[0.9] text-transparent">Let&apos;s<br />create.</div>
        <div className="text-right text-[13px] text-muted">
          © {new Date().getFullYear()} THAPPASORN WORKS.<br />
          Design · Film · Photography · Videography<br />Crafted with intent.
        </div>
      </div>
    </footer>
  );
}
