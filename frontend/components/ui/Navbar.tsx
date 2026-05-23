"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Platform", href: "/#platform" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Status", href: "/status" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid rgba(25, 40, 55, 0.1)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
                <path d="M8 16L13 11L18 16L13 21L8 16Z" fill="white" opacity="0.9"/>
                <path d="M14 10L19 5L24 10L19 15L14 10Z" fill="white" opacity="0.6"/>
                <path d="M14 22L19 17L24 22L19 27L14 22Z" fill="white" opacity="0.6"/>
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#7C3AED"/>
                    <stop offset="1" stopColor="#06B6D4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-[#192837] font-bold text-lg tracking-tight">
              Nexora
              <span className="gradient-text">.</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[#192837]/80 hover:text-[#192837] rounded-lg hover:bg-[#192837]/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/signin">
              <button className="px-5 py-2.5 text-sm font-semibold text-[#192837] hover:text-[#192837] rounded-full hover:bg-[#192837]/5 border border-[#192837]/10 hover:border-[#192837]/20 transition-all duration-200">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "#7342E2",
                  boxShadow: "0 4px 20px rgba(115,66,226,0.35)",
                }}
              >
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#192837]/80 hover:text-[#192837] rounded-lg hover:bg-[#192837]/5 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(25, 40, 55, 0.4)", backdropFilter: "blur(4px)" }}
            />
            {/* Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="fixed right-0 top-0 z-50 h-screen"
              style={{
                width: "min(88vw, 340px)",
                background: "#F2F2EE",
                borderLeft: "1px solid rgba(25,40,55,0.08)",
                boxShadow: "-12px 0 48px rgba(0,0,0,0.15)",
              }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#192837]/10">
                <span className="text-[#192837] font-bold text-lg">Nexora<span className="gradient-text">.</span></span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-[#192837]/60 hover:text-[#192837] rounded-lg hover:bg-[#192837]/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="px-4 py-6 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <Link href={link.href} key={link.label} passHref legacyBehavior>
                    <motion.a
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.18 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-[#192837]/80 hover:text-[#192837] rounded-xl hover:bg-[#192837]/5 text-base font-medium transition-all"
                    >
                      {link.label}
                    </motion.a>
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-8 left-4 right-4 space-y-3">
                <Link href="/auth/signup" className="block" onClick={() => setMenuOpen(false)}>
                  <button
                    className="w-full py-3 text-sm font-semibold text-white rounded-full"
                    style={{ background: "#7342E2", boxShadow: "0 4px 20px rgba(115,66,226,0.35)" }}
                  >
                    Get Started Free
                  </button>
                </Link>
                <Link href="/auth/signin" className="block" onClick={() => setMenuOpen(false)}>
                  <button className="w-full py-3 text-sm font-semibold text-[#192837] rounded-full border border-[#192837]/10 hover:bg-[#192837]/5 transition-colors">
                    Sign In
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
