"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    desc: "For indie developers and small projects.",
    cta: "Start Free",
    href: "/auth/signup",
    highlight: false,
    features: [
      "Up to 100K events/month",
      "3 dashboards",
      "5 alert rules",
      "7-day data retention",
      "REST API access",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    desc: "For growing teams that need more power.",
    cta: "Get Pro",
    href: "/auth/signup?plan=pro",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Up to 50M events/month",
      "Unlimited dashboards",
      "Unlimited alert rules",
      "90-day data retention",
      "WebSocket live stream",
      "CSV & webhook ingestion",
      "Email & Slack alerts",
      "API key management",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For high-scale orgs with compliance needs.",
    cta: "Talk to Sales",
    href: "mailto:sales@nexora.dev",
    highlight: false,
    features: [
      "Unlimited events",
      "Custom retention policy",
      "SOC 2 / GDPR compliance",
      "Dedicated Celery workers",
      "SLA: 99.99% uptime",
      "Custom integrations",
      "SSO / SAML",
      "24/7 dedicated support",
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      <div
        className="absolute right-0 bottom-0 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 100% 100%, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-[#7342E2] border"
            style={{ background: "rgba(115,66,226,0.1)", borderColor: "rgba(115,66,226,0.25)" }}
          >
            Pricing
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="font-heading text-center text-[#192837] mb-4"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Simple, <span className="gradient-text">transparent pricing</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-[#192837]/80 mb-16 max-w-lg mx-auto"
          style={{ lineHeight: 1.65, fontSize: "clamp(0.95rem, 2vw, 1.05rem)" }}
        >
          No hidden fees. Scale from prototype to production with the same platform.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
              className="relative rounded-2xl p-7 flex flex-col"
              style={{
                background: plan.highlight
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.55)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: plan.highlight ? "1px solid #7342E2" : "1px solid rgba(255,255,255,0.8)",
                boxShadow: plan.highlight ? "0 12px 48px rgba(115,66,226,0.15)" : "0 8px 32px rgba(25, 40, 55, 0.05)",
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-[#192837] font-semibold text-lg mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span
                    className="text-[#192837]"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", lineHeight: 1 }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-[#192837]/70 text-sm mb-1">{plan.period}</span>}
                </div>
                <p className="text-[#192837]/70 text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-[#192837]/80">
                    <Check size={15} className="text-[#7342E2] flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={
                    plan.highlight
                      ? {
                          background: "#7342E2",
                          color: "white",
                          boxShadow: "0 4px 20px rgba(115,66,226,0.35)",
                        }
                      : {
                          background: "rgba(255,255,255,0.8)",
                          color: "#192837",
                          border: "1px solid rgba(25,40,55,0.1)",
                        }
                  }
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
