"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("userName", form.email.split('@')[0]);
      localStorage.setItem("userEmail", form.email);
      // We don't overwrite userOrg here so it stays whatever it was, or falls back to "Personal Workspace"
    }

    // Simulated auth — in production this calls POST /api/v1/auth/login
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1200);
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Video is in layout.tsx, so it's behind this if transparent */}
      <div className="absolute inset-0 z-0 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#auth-logo-grad)" />
            <path d="M8 16L13 11L18 16L13 21L8 16Z" fill="white" opacity="0.9"/>
            <path d="M14 10L19 5L24 10L19 15L14 10Z" fill="white" opacity="0.6"/>
            <path d="M14 22L19 17L24 22L19 27L14 22Z" fill="white" opacity="0.6"/>
            <defs>
              <linearGradient id="auth-logo-grad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#7C3AED"/><stop offset="1" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-[#192837] font-bold text-xl">Nexora<span className="gradient-text">.</span></span>
        </Link>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 24px 80px rgba(25, 40, 55, 0.1)",
          }}
        >
          <h1 className="text-2xl font-bold text-[#192837] mb-1" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p className="text-[#192837]/70 text-sm mb-7">Sign in to your Nexora workspace</p>

          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold text-[#192837] mb-6 transition-all"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(25, 40, 55, 0.15)",
              boxShadow: "0 4px 12px rgba(25, 40, 55, 0.05)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.8 15.72 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.72 17.57C14.73 18.23 13.47 18.63 12 18.63C9.16 18.63 6.75 16.71 5.88 14.14H2.21V16.99C4.01 20.57 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.88 14.14C5.66 13.48 5.53 12.76 5.53 12C5.53 11.24 5.66 10.52 5.88 9.86V7.01H2.21C1.47 8.49 1.05 10.19 1.05 12C1.05 13.81 1.47 15.51 2.21 16.99L5.88 14.14Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.62 5.38 15.07 5.94 16.22 7.03L19.37 3.88C17.45 2.09 14.97 1 12 1C7.7 1 4.01 3.43 2.21 7.01L5.88 9.86C6.75 7.29 9.16 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-[#192837]/10 flex-1" />
            <span className="text-xs text-[#192837]/50 uppercase tracking-widest font-medium">Or</span>
            <div className="h-px bg-[#192837]/10 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#192837]/80 mb-2">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-[#192837] placeholder-[#192837]/40 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(25, 40, 55, 0.15)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7342E2")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(25, 40, 55, 0.15)")}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#192837]/80 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-[#192837] placeholder-[#192837]/40 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(25, 40, 55, 0.15)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#7342E2")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(25, 40, 55, 0.15)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#192837]/50 hover:text-[#192837] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white mt-2"
              style={{
                background: "#7342E2",
                boxShadow: "0 4px 20px rgba(115,66,226,0.35)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight size={16} />}
            </motion.button>
          </form>

          <p className="text-center text-sm text-[#192837]/60 mt-6">
            No account?{" "}
            <Link href="/auth/signup" className="text-[#7342E2] hover:text-[#5b21b6] font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
