"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, BarChart3, Bell } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const METRICS = [
  { label: "Events / sec", value: "2.4M+" },
  { label: "Avg Latency", value: "< 45ms" },
  { label: "Uptime SLA", value: "99.99%" },
];

const LIVE_EVENTS = [
  { event: "payment_completed", user: "usr_4821", ms: "12ms", color: "#10b981" },
  { event: "page_view",         user: "usr_3302", ms: "8ms",  color: "#06B6D4" },
  { event: "signup",            user: "usr_9921", ms: "21ms", color: "#a78bfa" },
  { event: "error_rate_spike",  user: "sys",      ms: "—",    color: "#f87171" },
  { event: "checkout_started",  user: "usr_1102", ms: "15ms", color: "#fbbf24" },
];

export default function HeroSection() {
  const { scrollY } = useScroll();
  // Move down by 60px when scrolled 400px (subtle parallax)
  const yParallax = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col">



      {/* ── Main content ── */}
      <div
        className="relative flex-1 max-w-[1280px] mx-auto w-full px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        style={{
          zIndex: 10,
          paddingTop: "clamp(60px, 10vw, 100px)",
          paddingBottom: "clamp(40px, 6vw, 80px)",
        }}
      >
        {/* ── Left: copy ── */}
        <div className="flex flex-col" style={{ maxWidth: 580 }}>

          {/* Live badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-2 mb-4 w-fit"
          >
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#7342E2] border animated-border"
              style={{
                background: "rgba(115,66,226,0.12)",
                borderColor: "rgba(115,66,226,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7342E2] pulse-dot" />
              Now Processing 2.4M Events/sec
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-4 text-[#192837]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            <span className="inline-flex items-center gap-2.5">
              <Zap size={28} className="text-[#7342E2] flex-shrink-0" style={{ position: "relative", top: -2 }} />
              Real-Time Analytics
            </span>
            <br />
            for{" "}
            <span className="gradient-text">High-Velocity</span>
            <br />
            <span className="inline-flex items-center gap-2.5">
              Engineering Teams
              <BarChart3 size={28} className="text-cyan-500 flex-shrink-0" style={{ position: "relative", top: -2 }} />
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            custom={0.15}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 text-[#192837]/80"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
              lineHeight: 1.65,
              maxWidth: 520,
            }}
          >
            Receive real-time email alerts the exact second a critical error occurs. Nexora collects your application events asynchronously at scale, and surfaces insights through beautiful, customizable dashboards.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={0.30}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/auth/signup">
              <motion.button
                id="cta-get-started"
                whileHover={{ scale: 1.04, filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-between gap-8 text-white font-semibold"
                style={{
                  background: "#7342E2",
                  borderRadius: 50,
                  padding: "17px 24px",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  boxShadow: "0 4px 28px rgba(115,66,226,0.35)",
                  minWidth: 210,
                }}
              >
                <span>Start For Free</span>
                <ArrowRight size={20} />
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                id="cta-view-demo"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 font-semibold text-[#192837] rounded-full"
                style={{
                  padding: "17px 24px",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(25,40,55,0.1)",
                  minWidth: 180,
                }}
              >
                View Dashboard
              </motion.button>
            </Link>
          </motion.div>

          {/* Metrics row */}
          <motion.div
            custom={0.45}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex items-center gap-6 mt-8 pt-6"
            style={{ borderTop: "1px solid rgba(25,40,55,0.1)" }}
          >
            {METRICS.map((m) => (
              <div key={m.label}>
                <div
                  className="text-xl font-bold text-[#192837]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {m.value}
                </div>
                <div className="text-xs text-[#192837]/60 mt-0.5">{m.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Second Section: Features & Dashboard Preview ── */}
      <div className="relative w-full max-w-[1280px] mx-auto px-5 sm:px-8 py-24 z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#192837] mb-6"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Uncover Insights Instantly
            </h2>
            <p className="text-lg text-[#192837]/70 mb-8 leading-relaxed">
              Experience the power of real-time telemetry. Watch your events stream live, monitor 
              critical P99 latency drops, and let Nexora automatically evaluate error thresholds. 
              Our drag-and-drop interface gives you complete control over your engineering metrics.
            </p>
            <ul className="space-y-4">
              {[
                "Sub-50ms ingestion and async processing",
                "Automated email alerts via Resend when errors spike",
                "Drag-and-drop dashboard widgets via react-grid-layout"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#192837]/80 font-medium">
                  <div className="w-6 h-6 rounded-full bg-[#7342E2]/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#7342E2]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="float"
          >
            <DashboardPreviewCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Dashboard preview card ── */
function DashboardPreviewCard() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 32px 80px rgba(25, 40, 55, 0.15), 0 0 0 1px rgba(255,255,255,0.5) inset",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Card header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(25, 40, 55, 0.08)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
          <span className="text-xs font-semibold text-[#192837]/80">Live Event Stream</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bell size={12} className="text-[#192837]/50" />
          <span className="text-[11px] text-[#192837]/60">2 alerts active</span>
        </div>
      </div>

      {/* Mini chart */}
      <div className="px-5 pt-5 pb-2">
        <div className="text-xs text-[#192837]/60 mb-3 uppercase tracking-widest">Events / 5min</div>
        <MiniBarChart />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2 px-5 py-4">
        {[
          { label: "Total",  value: "48.2K", color: "#a78bfa" },
          { label: "Errors", value: "0.4%",  color: "#f87171" },
          { label: "P99",    value: "89ms",  color: "#34d399" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)" }}
          >
            <div className="text-[11px] text-[#192837]/60 mb-1">{k.label}</div>
            <div className="text-base font-bold" style={{ color: k.color === "#a78bfa" ? "#7342E2" : k.color, fontFamily: "var(--font-heading)" }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Live events list */}
      <div className="px-5 pb-5 space-y-2">
        <div className="text-xs text-[#192837]/60 mb-2 uppercase tracking-widest">Recent Events</div>
        {LIVE_EVENTS.map((ev, i) => (
          <div
            key={ev.event + i}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs stream-item"
            style={{
              background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.6)",
              animationDelay: `${i * 0.12}s`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color === "#a78bfa" ? "#7342E2" : ev.color }} />
              <span className="font-mono text-[#192837]/90">{ev.event}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#192837]/60">{ev.user}</span>
              <span className="text-[#192837]/50 font-mono">{ev.ms}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Shimmer top strip */}
      <div className="absolute top-0 left-0 right-0 h-px shimmer" />
    </div>
  );
}

/* ── Animated mini bar chart ── */
const BAR_HEIGHTS = [35, 55, 40, 70, 85, 60, 90, 50, 75, 45, 80, 65, 95, 55, 70];

function MiniBarChart() {
  return (
    <div className="flex items-end gap-1 h-16">
      {BAR_HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5 + i * 0.03, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="flex-1 rounded-t-sm"
          style={{
            height: `${h}%`,
            transformOrigin: "bottom",
            background:
              i === BAR_HEIGHTS.length - 1
                ? "rgba(124,58,237,0.9)"
                : i % 3 === 0
                ? "rgba(6,182,212,0.55)"
                : "rgba(124,58,237,0.4)",
          }}
        />
      ))}
    </div>
  );
}
