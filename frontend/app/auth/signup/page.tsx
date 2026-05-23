"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", org: "", email: "", password: "" });

  const passwordStrength = (() => {
    const pw = form.password;
    if (pw.length === 0) return 0;
    if (pw.length < 6) return 1;
    if (pw.length < 10) return 2;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 4;
    return 3;
  })();

  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Save to localStorage for the dashboard prototype
    if (typeof window !== "undefined") {
      localStorage.setItem("userName", form.name);
      localStorage.setItem("userOrg", form.org);
      localStorage.setItem("userEmail", form.email);
    }
    // In production: POST /api/v1/auth/register
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1400);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 z-0 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#signup-logo-grad)" />
            <path d="M8 16L13 11L18 16L13 21L8 16Z" fill="white" opacity="0.9"/>
            <path d="M14 10L19 5L24 10L19 15L14 10Z" fill="white" opacity="0.6"/>
            <path d="M14 22L19 17L24 22L19 27L14 22Z" fill="white" opacity="0.6"/>
            <defs>
              <linearGradient id="signup-logo-grad" x1="0" y1="0" x2="32" y2="32">
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
            Create your workspace
          </h1>
          <p className="text-[#192837]/70 text-sm mb-7">Start monitoring for free. No credit card required.</p>

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
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-[#192837]/10 flex-1" />
            <span className="text-xs text-[#192837]/50 uppercase tracking-widest font-medium">Or</span>
            <div className="h-px bg-[#192837]/10 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Org */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#192837]/80 mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl px-4 py-3 text-sm text-[#192837] placeholder-[#192837]/40 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(25, 40, 55, 0.15)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7342E2")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(25, 40, 55, 0.15)")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#192837]/80 mb-2">Organization</label>
                <input
                  type="text"
                  required
                  value={form.org}
                  onChange={(e) => setForm({ ...form, org: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full rounded-xl px-4 py-3 text-sm text-[#192837] placeholder-[#192837]/40 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(25, 40, 55, 0.15)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7342E2")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(25, 40, 55, 0.15)")}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#192837]/80 mb-2">Work Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-[#192837] placeholder-[#192837]/40 outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(25, 40, 55, 0.15)" }}
                onFocus={(e) => (e.target.style.borderColor = "#7342E2")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(25, 40, 55, 0.15)")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[#192837]/80 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-[#192837] placeholder-[#192837]/40 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(25, 40, 55, 0.15)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7342E2")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(25, 40, 55, 0.15)")}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#192837]/50 hover:text-[#192837] transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bars */}
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map((n) => (
                      <div key={n} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: n <= passwordStrength ? strengthColors[passwordStrength] : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strengthColors[passwordStrength] }}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="flex flex-col gap-1.5 py-1">
              {["Org workspace + API keys auto-created", "Role-based access from day one", "100K events/month free"].map((b) => (
                <div key={b} className="flex items-center gap-2 text-xs text-[#192837]/70">
                  <Check size={12} className="text-[#7342E2]" />
                  {b}
                </div>
              ))}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "#7342E2",
                boxShadow: "0 4px 20px rgba(115,66,226,0.35)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Creating workspace…" : "Create Free Workspace"}
              {!loading && <ArrowRight size={16} />}
            </motion.button>
          </form>

          <p className="text-center text-sm text-[#192837]/60 mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[#7342E2] hover:text-[#5b21b6] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#192837]/50 mt-5">
          By signing up you agree to our{" "}
          <a href="#" className="text-[#192837]/80 hover:text-[#192837] transition-colors">Terms</a>{" "}
          and{" "}
          <a href="#" className="text-[#192837]/80 hover:text-[#192837] transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
