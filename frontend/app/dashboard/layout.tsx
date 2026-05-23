"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Activity, AlertTriangle, Settings,
  LogOut, Bell, Search, ChevronDown, Plus, Menu, X, Key
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { supabase } from "@/lib/supabase";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/dashboard/events", icon: Activity },
  { label: "Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
  { label: "API Keys", href: "/dashboard/apikeys", icon: Key },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userOrg, setUserOrg] = useState("Personal Workspace");
  const [activeDashboard, setActiveDashboard] = useState<string | null>(null);
  const [customDashboards, setCustomDashboards] = useState<{id: string, name: string}[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const storedName = localStorage.getItem("userName");
      const storedOrg = localStorage.getItem("userOrg");
      
      let finalName = storedName;
      let finalOrg = storedOrg;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (!finalName) finalName = user.user_metadata?.full_name || user.email?.split('@')[0];
        
        if (!finalOrg) finalOrg = user.user_metadata?.userOrg || "Personal Workspace";
        else if (finalOrg !== user.user_metadata?.userOrg) {
          supabase.auth.updateUser({ data: { userOrg: finalOrg } }).catch(()=>{});
        }
        
        if (finalName && finalName !== user.user_metadata?.full_name) {
          supabase.auth.updateUser({ data: { full_name: finalName } }).catch(()=>{});
        }
      }

      if (finalName) setUserName(finalName);
      if (finalOrg) setUserOrg(finalOrg);
      
      let savedDashboards = JSON.parse(localStorage.getItem("customDashboards") || "[]");
      if (user) {
        const metadataDashboards = user.user_metadata?.customDashboards || [];
        if (savedDashboards.length === 0 && metadataDashboards.length > 0) {
           savedDashboards = metadataDashboards;
           localStorage.setItem("customDashboards", JSON.stringify(savedDashboards));
        } else if (savedDashboards.length > 0 && JSON.stringify(savedDashboards) !== JSON.stringify(metadataDashboards)) {
           supabase.auth.updateUser({ data: { customDashboards: savedDashboards } }).catch(()=>{});
        }
      }
      setCustomDashboards(savedDashboards);
      
      const active = localStorage.getItem("activeDashboard");
      if (active) setActiveDashboard(active);

      // Fetch alerts
      let query = supabase.from('events').select('*').eq('event_name', 'ALERT_TRIGGERED').order('created_at', { ascending: false }).limit(5);
      if (active) query = query.eq("metadata->>dashboard", active);
      else query = query.is("metadata->>dashboard", null);
      
      const { data: alertsData } = await query;
      if (alertsData) setUnreadAlerts(alertsData);

      // Subscribe to real-time alerts
      const channel = supabase.channel('layout_alerts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: "event_name=eq.ALERT_TRIGGERED" }, (payload) => {
          const ev = payload.new as any;
          if (active) {
            if (ev.metadata?.dashboard !== active) return;
          } else {
            if (ev.metadata?.dashboard) return;
          }
          setUnreadAlerts(prev => [ev, ...prev].slice(0, 5));
        }).subscribe();
        
      return () => { supabase.removeChannel(channel); };
    }
    loadProfile();
  }, []);

  const handleSelectDashboard = (name: string | null) => {
    if (name) {
      localStorage.setItem("activeDashboard", name);
      setActiveDashboard(name);
    } else {
      localStorage.removeItem("activeDashboard");
      setActiveDashboard(null);
    }
    setIsDropdownOpen(false);
    // Reload to re-mount content with new context
    window.location.reload();
  };

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(25, 40, 55, 0.15)" }}>
      {/* Logo */}
      <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#dl)"/>
            <path d="M8 16L13 11L18 16L13 21L8 16Z" fill="white" opacity="0.9"/>
            <path d="M14 10L19 5L24 10L19 15L14 10Z" fill="white" opacity="0.6"/>
            <path d="M14 22L19 17L24 22L19 27L14 22Z" fill="white" opacity="0.6"/>
            <defs>
              <linearGradient id="dl" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#7C3AED"/><stop offset="1" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
          <span style={{ color: "#192837", fontWeight: 700, fontSize: 16 }}>
            Nexora<span style={{ color: "#7342E2" }}>.</span>
          </span>
        </Link>
      </div>

      {/* Org / Dashboard Switcher */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(25, 40, 55, 0.1)", position: "relative" }}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: "#192837" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(25, 40, 55, 0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: activeDashboard ? "#06B6D4" : "#7342E2", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {activeDashboard ? activeDashboard.charAt(0).toUpperCase() : userOrg.charAt(0).toUpperCase()}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeDashboard || userOrg}
            </span>
          </span>
          <ChevronDown size={14} color="#192837" style={{ transform: isDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <div 
                style={{ position: "fixed", inset: 0, zIndex: 90 }} 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", top: "100%", left: 16, right: 16, marginTop: 4, zIndex: 100,
                  background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(24px)",
                  border: "1px solid rgba(25, 40, 55, 0.15)", borderRadius: 12, padding: 8,
                  boxShadow: "0 12px 40px rgba(25, 40, 55, 0.1)"
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(25, 40, 55, 0.5)", textTransform: "uppercase", padding: "4px 8px 8px" }}>
                  Workspaces
                </div>
                <button 
                  onClick={() => handleSelectDashboard(null)}
                  style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "none", background: !activeDashboard ? "rgba(115, 66, 226, 0.1)" : "transparent", color: !activeDashboard ? "#7342E2" : "#192837", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onMouseEnter={e => !activeDashboard ? null : (e.currentTarget.style.background = "rgba(25, 40, 55, 0.05)")}
                  onMouseLeave={e => !activeDashboard ? null : (e.currentTarget.style.background = "transparent")}
                >
                  {userOrg}
                  {!activeDashboard && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7342E2" }} />}
                </button>

                {customDashboards.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(25, 40, 55, 0.1)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(25, 40, 55, 0.5)", textTransform: "uppercase", padding: "4px 8px 8px" }}>
                      Custom Dashboards
                    </div>
                    {customDashboards.map(db => (
                      <button 
                        key={db.id}
                        onClick={() => handleSelectDashboard(db.name)}
                        style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "none", background: activeDashboard === db.name ? "rgba(6, 182, 212, 0.1)" : "transparent", color: activeDashboard === db.name ? "#06B6D4" : "#192837", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        onMouseEnter={e => activeDashboard === db.name ? null : (e.currentTarget.style.background = "rgba(25, 40, 55, 0.05)")}
                        onMouseLeave={e => activeDashboard === db.name ? null : (e.currentTarget.style.background = "transparent")}
                      >
                        {db.name}
                        {activeDashboard === db.name && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06B6D4" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: 12, marginBottom: 2, fontSize: 14, fontWeight: 500,
                color: active ? "#7342E2" : "rgba(25, 40, 55, 0.7)",
                background: active ? "rgba(115, 66, 226, 0.1)" : "transparent",
                border: active ? "1px solid rgba(115, 66, 226, 0.2)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(25, 40, 55, 0.05)"; e.currentTarget.style.color = "#192837"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(25, 40, 55, 0.7)"; } }}
              >
                <Icon size={17} color={active ? "#7342E2" : undefined} />
                <span>{item.label}</span>
                {item.label === "Alerts" && unreadAlerts.length > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 6px", borderRadius: 20, background: "rgba(248,113,113,0.15)", color: "#ef4444", fontWeight: 600 }}>{unreadAlerts.length}</span>
                )}
              </div>
            </Link>
          );
        })}
        <Link href="/dashboard/new" style={{ textDecoration: "none" }}>
          <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginTop: 16, borderRadius: 12, border: "1px dashed rgba(25, 40, 55, 0.2)", background: "transparent", color: "rgba(25, 40, 55, 0.7)", fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(25, 40, 55, 0.4)"; e.currentTarget.style.color = "#192837"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(25, 40, 55, 0.2)"; e.currentTarget.style.color = "rgba(25, 40, 55, 0.7)"; }}
          >
            <Plus size={16} /> New Dashboard
          </button>
        </Link>
      </nav>

      {/* User */}
      <div style={{ borderTop: "1px solid rgba(25, 40, 55, 0.1)", padding: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7342E2", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{userName.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#192837", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
            <div style={{ fontSize: 11, color: "rgba(25, 40, 55, 0.6)" }}>Owner</div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/auth/signin'; }} style={{ padding: 6, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: "rgba(25, 40, 55, 0.6)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(25, 40, 55, 0.05)"; e.currentTarget.style.color = "#192837"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(25, 40, 55, 0.6)"; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AuroraBackground showRadialGradient={true} className="!h-screen w-full flex-row items-stretch justify-start !p-0 overflow-hidden text-[#192837]">
      <div style={{ display: "flex", width: "100%", height: "100%", zIndex: 10 }}>
        {/* Desktop sidebar */}
      <div style={{ width: 256, flexShrink: 0, display: "none" }} className="md-sidebar">
        {sidebarContent}
      </div>
      <style>{`
        @media (min-width: 768px) { .md-sidebar { display: block !important; } .mobile-menu-btn { display: none !important; } }
      `}</style>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(25, 40, 55, 0.4)", backdropFilter: "blur(4px)", zIndex: 40 }}
            />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "fixed", left: 0, top: 0, width: 256, height: "100%", zIndex: 50 }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid rgba(25, 40, 55, 0.1)", background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(24px)", flexShrink: 0, zIndex: 100, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}
              style={{ padding: 8, background: "transparent", border: "none", cursor: "pointer", color: "rgba(25, 40, 55, 0.7)", borderRadius: 8 }}>
              <Menu size={20} />
            </button>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(25, 40, 55, 0.5)" }} />
              <input 
                id="global-search-input"
                placeholder="Search events…" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      router.push(`/dashboard/events?q=${encodeURIComponent(val)}`);
                    } else {
                      router.push(`/dashboard/events`);
                    }
                  }
                }}
                style={{
                  paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8, width: 220,
                  background: "rgba(255,255,255,0.8)", border: "1px solid rgba(25, 40, 55, 0.15)",
                  borderRadius: 12, fontSize: 13, color: "#192837", outline: "none",
                }}
                onFocus={e => (e.target.style.borderColor = "#7342E2")}
                onBlur={e => (e.target.style.borderColor = "rgba(25, 40, 55, 0.15)")}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, color: "#16a34a" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse-dot 2s ease-in-out infinite" }} />
              Live
            </div>
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                style={{ position: "relative", padding: 8, background: "transparent", border: "none", cursor: "pointer", color: "rgba(25, 40, 55, 0.7)", borderRadius: 10 }}
              >
                <Bell size={18} />
                {unreadAlerts.length > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute", top: "100%", right: 0, marginTop: 4, zIndex: 100, width: 320,
                        background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(24px)",
                        border: "1px solid rgba(25, 40, 55, 0.15)", borderRadius: 16, padding: 0,
                        boxShadow: "0 12px 40px rgba(25, 40, 55, 0.1)", overflow: "hidden"
                      }}
                    >
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(25, 40, 55, 0.1)", fontWeight: 600, fontSize: 13, color: "#192837", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        Notifications
                        <span style={{ fontSize: 11, background: "rgba(115, 66, 226, 0.1)", color: "#7342E2", padding: "2px 6px", borderRadius: 10 }}>{unreadAlerts.length} New</span>
                      </div>
                      <div style={{ maxHeight: 300, overflowY: "auto" }}>
                        {unreadAlerts.length === 0 ? (
                          <div style={{ padding: 24, textAlign: "center", color: "rgba(25, 40, 55, 0.5)", fontSize: 13 }}>
                            No new alerts right now.
                          </div>
                        ) : (
                          unreadAlerts.map(alert => (
                            <Link href="/dashboard/alerts" key={alert.id} style={{ textDecoration: "none" }} onClick={() => setIsNotificationsOpen(false)}>
                              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(25, 40, 55, 0.05)", display: "flex", gap: 12 }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(25, 40, 55, 0.02)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", marginTop: 6, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: "#192837", marginBottom: 2 }}>{alert.metadata?.type === 'error_rate_spike' ? 'Error Rate Spike Detected' : 'Alert Triggered'}</div>
                                  <div style={{ fontSize: 12, color: "rgba(25, 40, 55, 0.6)", lineHeight: 1.4 }}>{alert.metadata?.message || 'Threshold Exceeded'}</div>
                                  <div style={{ fontSize: 11, color: "rgba(25, 40, 55, 0.4)", marginTop: 4 }}>{new Date(alert.created_at).toLocaleTimeString()}</div>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, zIndex: 1, position: "relative" }}>
          {children}
        </div>
      </div>
      </div>
    </AuroraBackground>
  );
}
