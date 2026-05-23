"use client";

import Link from "next/link";
import { GitBranch, ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const FOOTER_LINKS = {
  Product: [
    { label: "Platform", href: "/#platform" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Status", href: "/status" },
  ],
  Developers: [
    { label: "API Reference", href: "/docs" },
    { label: "SDK", href: "/sdk" },
    { label: "Webhooks", href: "/webhooks" },
    { label: "GitHub", href: "https://github.com" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Security", href: "/security" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-[#192837]/10">
      {/* CTA banner */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-24 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-[#192837] mb-5"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Ready to monitor at{" "}
            <span className="gradient-text">production scale?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#192837]/80 mb-8 max-w-lg mx-auto"
            style={{ lineHeight: 1.65 }}
          >
            Join engineering teams shipping faster with Nexora. Free to start, no credit card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.04, filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-semibold text-white"
                style={{
                  background: "#7342E2",
                  boxShadow: "0 4px 24px rgba(115,66,226,0.35)",
                }}
              >
                Get Started Free
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-[#192837]/10">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="url(#footer-logo-grad)" />
                    <path d="M8 16L13 11L18 16L13 21L8 16Z" fill="white" opacity="0.9"/>
                    <path d="M14 10L19 5L24 10L19 15L14 10Z" fill="white" opacity="0.6"/>
                    <path d="M14 22L19 17L24 22L19 27L14 22Z" fill="white" opacity="0.6"/>
                    <defs>
                      <linearGradient id="footer-logo-grad" x1="0" y1="0" x2="32" y2="32">
                        <stop stopColor="#7C3AED"/>
                        <stop offset="1" stopColor="#06B6D4"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="text-[#192837] font-bold text-base">Nexora<span className="gradient-text">.</span></span>
              </Link>
              <p className="text-[#192837]/60 text-sm leading-relaxed mb-5">
                Real-time analytics for engineering teams who ship fast.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
              <div key={cat}>
                <h4 className="text-xs font-semibold text-[#192837]/60 uppercase tracking-widest mb-4">{cat}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#192837]/70 hover:text-[#192837] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#192837]/10 mt-14 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#192837]/50 font-medium">
              DEVELOPED BY THEJESHWAAR PAASILA ©
            </p>
            <p className="text-xs text-[#192837]/50">
              Built with FastAPI · Next.js · PostgreSQL · Redis
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
