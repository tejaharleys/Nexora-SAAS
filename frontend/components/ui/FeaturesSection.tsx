"use client";

import { motion } from "framer-motion";
import { Zap, BarChart3, Bell, Shield, Globe, Code2 } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    color: "#a78bfa",
    title: "Real-Time Ingestion",
    desc: "Stream millions of events via REST API or webhooks. Single and batch ingest supported with Pydantic validation.",
    tag: "< 10ms p50",
  },
  {
    icon: BarChart3,
    color: "#06B6D4",
    title: "Custom Dashboards",
    desc: "Drag-and-drop widgets — line charts, bar charts, KPI cards, tables. Auto-refresh at 30s/1m/5m intervals.",
    tag: "Real-time updates",
  },
  {
    icon: Bell,
    color: "#f472b6",
    title: "Smart Alerts",
    desc: "Define threshold rules. Celery Beat evaluates every minute. Deliver via email, Slack webhook, or in-app.",
    tag: "Celery Beat",
  },
  {
    icon: Shield,
    color: "#34d399",
    title: "Multi-Tenant Auth",
    desc: "JWT + refresh tokens, bcrypt passwords, role hierarchy (Owner → Admin → Analyst → Viewer), org isolation.",
    tag: "RBAC",
  },
  {
    icon: Globe,
    color: "#fbbf24",
    title: "WebSocket Streaming",
    desc: "Live dashboard updates the moment an event lands. Event stream viewer lets you tail in real-time.",
    tag: "WS native",
  },
  {
    icon: Code2,
    color: "#818cf8",
    title: "API Keys & Rate Limiting",
    desc: "Generate, revoke, rotate API keys per org. Per-org rate limiting via Redis. SQL injection prevention via ORM.",
    tag: "SlowAPI + Redis",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function FeaturesSection() {
  return (
    <section id="platform" className="relative py-28 overflow-hidden">
      {/* bg accent */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 relative z-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-[#7342E2] border"
            style={{ background: "rgba(115,66,226,0.1)", borderColor: "rgba(115,66,226,0.25)" }}
          >
            Platform Capabilities
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-center font-heading text-[#192837] mb-5"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Everything you need to{" "}
          <span className="gradient-text">monitor at scale</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-[#192837]/80 mb-16 max-w-xl mx-auto"
          style={{ lineHeight: 1.65, fontSize: "clamp(0.95rem, 2vw, 1.05rem)" }}
        >
          Built on FastAPI, SQLAlchemy 2.0 async, Celery, Redis, and PostgreSQL. Production patterns from day one.
        </motion.p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl p-6 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 8px 32px rgba(25, 40, 55, 0.05)",
                }}
              >
                {/* hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${feat.color}10 0%, transparent 70%)`,
                  }}
                />
                {/* icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feat.color}18`, border: `1px solid ${feat.color}30` }}
                >
                  <Icon size={20} style={{ color: feat.color }} />
                </div>
                {/* content */}
                <h3
                  className="text-[#192837] font-semibold mb-2"
                  style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}
                >
                  {feat.title}
                </h3>
                <p className="text-[#192837]/70 text-sm leading-relaxed mb-4">{feat.desc}</p>
                {/* tag */}
                <span
                  className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: `${feat.color}14`, color: feat.color }}
                >
                  {feat.tag}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
