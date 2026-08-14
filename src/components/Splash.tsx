import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

export function Splash() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-ivory">
      {/* Soft organic blobs */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.32, 0.72, 0, 1] }}
        className="pointer-events-none absolute -top-24 -left-24 h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, #E5EEDB, transparent)" }}
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.8, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        className="pointer-events-none absolute -bottom-32 -right-16 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, #F4E5D8, transparent)" }}
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-8 pb-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs uppercase tracking-[0.28em] text-clay-soft"
        >
          A quiet planner
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif mt-4 text-[3.75rem] leading-[0.95] tracking-tight"
          style={{ color: "var(--clay)" }}
        >
          Calendry
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-6 max-w-[22rem] text-base leading-relaxed text-clay-soft"
        >
          A tactile calendar that feels like your favorite paper planner —
          warm ivory pages, soft hairlines, and days you actually want to open.
        </motion.p>

        {/* Illustrated card stack */}
        <div className="relative mt-14 h-64">
          {[
            { r: -6, t: 0, tag: "#E5EEDB", label: "Morning walk", time: "7:30" },
            { r: 3, t: 24, tag: "#F8F1D7", label: "Deep work", time: "10:00" },
            { r: -2, t: 56, tag: "#F4E5D8", label: "Lunch with Mira", time: "12:30" },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotate: c.r * 2 }}
              animate={{ opacity: 1, y: c.t, rotate: c.r }}
              transition={{ duration: 0.8, delay: 0.7 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-0 w-72 -translate-x-1/2 rounded-3xl bg-surface p-5 shadow-[0_20px_50px_-20px_rgba(74,63,53,0.25)]"
              style={{ border: "1px solid var(--hairline)" }}
            >
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.tag }} />
                <span className="text-xs uppercase tracking-widest text-clay-soft">{c.time}</span>
              </div>
              <div className="font-serif mt-2 text-2xl text-clay">{c.label}</div>
              <div className="mt-3 hairline-t pt-3 text-sm text-clay-soft">
                A gentle moment on the page.
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-stretch gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <Link
              to="/app"
              className="block w-full rounded-full bg-clay px-6 py-4 text-center font-medium text-ivory shadow-sm transition-transform active:scale-[0.98]"
            >
              Open your calendar
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="text-center text-xs tracking-wide text-clay-muted"
          >
            No account needed. Everything stays on this device.
          </motion.div>
        </div>
      </div>
    </div>
  );
}
