"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Zap, Users, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
// @ts-ignore
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const INITIAL_LAYOUTS = {
  lg: [
    { i: 'Total Events', x: 0, y: 0, w: 3, h: 2 },
    { i: 'Active Users', x: 3, y: 0, w: 3, h: 2 },
    { i: 'Error Rate', x: 6, y: 0, w: 3, h: 2 },
    { i: 'Avg Latency', x: 9, y: 0, w: 3, h: 2 },
    { i: 'eventVolume', x: 0, y: 2, w: 8, h: 3 },
    { i: 'topEvents', x: 8, y: 2, w: 4, h: 3 },
  ]
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(25, 40, 55, 0.1)",
    backdropFilter: "blur(12px)",
    borderRadius: "10px",
    color: "#192837",
    fontSize: "12px",
  },
  itemStyle: { color: "#192837" },
  labelStyle: { color: "rgba(25, 40, 55, 0.6)" },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

export default function DashboardContent() {
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeApiKey, setActiveApiKey] = useState<string>("sk_live_123456789");
  const [totalEvents, setTotalEvents]   = useState(0);
  const [activeUsers, setActiveUsers]   = useState(0);
  const [errorRate, setErrorRate]       = useState("0.00%");
  const [avgLatency, setAvgLatency]     = useState("0ms");
  const [chartData, setChartData]       = useState<any[]>([]);
  const [topEvents, setTopEvents]       = useState<any[]>([]);
  const [userOrg, setUserOrg]           = useState("Personal Workspace");
  const [activeDashboard, setActiveDashboard] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<any>(INITIAL_LAYOUTS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrg = localStorage.getItem("userOrg");
      if (storedOrg) setUserOrg(storedOrg);
      const active = localStorage.getItem("activeDashboard");
      if (active) setActiveDashboard(active);
      
      // Fetch the correct API key for this dashboard
      supabase.from("api_keys").select("*").order("created_at", { ascending: false }).then(({ data }) => {
        if (data && data.length > 0) {
          const scopedKey = data.find((k: any) => {
            if (active) return k.name.startsWith(`[${active}] `);
            return !k.name.startsWith("[");
          });
          if (scopedKey) {
            setActiveApiKey(scopedKey.api_key);
          } else {
            setActiveApiKey(""); // Force failure if no key exists
          }
        }
      });
    }
  }, []);

  // ─── Load real metrics from Supabase ─────────────────────────────────────
  const loadMetrics = useCallback(async () => {
    const active = localStorage.getItem("activeDashboard");
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since5m  = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Helper to apply dashboard filter
    const applyFilter = (query: any) => {
      if (active) return query.eq("metadata->>dashboard", active);
      return query;
    };

    // 1. Total events (all time)
    const { count: total } = await applyFilter(supabase.from("events").select("*", { count: "exact", head: true }));
    setTotalEvents(total ?? 0);

    // 2. Active users (unique user_ids in last 5 mins)
    const { data: activeData } = await applyFilter(supabase.from("events").select("user_id").gte("created_at", since5m));
    const uniqueUsers = new Set((activeData ?? []).map((e: any) => e.user_id).filter(Boolean));
    setActiveUsers(uniqueUsers.size);

    // 3. Error rate (last 24h)
    const { count: total24 } = await applyFilter(supabase.from("events").select("*", { count: "exact", head: true }).gte("created_at", since24h));
    const { count: errors24 } = await applyFilter(supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "error").gte("created_at", since24h));
    const rate = total24 ? ((errors24 ?? 0) / total24 * 100).toFixed(2) : "0.00";
    setErrorRate(`${rate}%`);

    // 4. Avg latency (last 24h)
    const { data: latencyData } = await applyFilter(supabase.from("events").select("latency").gte("created_at", since24h));
    if (latencyData && latencyData.length > 0) {
      const avg = latencyData.reduce((s: number, e: any) => s + (e.latency || 0), 0) / latencyData.length;
      setAvgLatency(`${Math.round(avg)}ms`);
    }

    // 5. Chart data — group by 2-hour bucket over last 24h
    const { data: allEvents } = await applyFilter(supabase.from("events").select("created_at, status").gte("created_at", since24h));
    if (allEvents) {
      const buckets: Record<string, { events: number; errors: number }> = {};
      for (let h = 0; h < 24; h += 2) {
        const label = `${String(h).padStart(2, "0")}:00`;
        buckets[label] = { events: 0, errors: 0 };
      }
      allEvents.forEach((ev: any) => {
        const d = new Date(ev.created_at);
        const bucket = `${String(Math.floor(d.getHours() / 2) * 2).padStart(2, "0")}:00`;
        if (buckets[bucket]) {
          buckets[bucket].events++;
          if (ev.status === "error") buckets[bucket].errors++;
        }
      });
      setChartData(Object.entries(buckets).map(([time, v]) => ({ time, ...v })));
    }

    // 6. Top events by name
    const { data: eventsAll } = await applyFilter(supabase.from("events").select("event_name").gte("created_at", since24h));
    if (eventsAll) {
      const counts: Record<string, number> = {};
      eventsAll.forEach((e: any) => { counts[e.event_name] = (counts[e.event_name] || 0) + 1; });
      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 7)
        .map(([name, count]) => ({ name, count }));
      setTopEvents(sorted);
    }
    // Fetch API key for simulation
    const { data: keyData } = await supabase.from("api_keys").select("api_key").limit(1).single();
    if (keyData) setActiveApiKey(keyData.api_key);
    
  }, []);

  // ─── Fetch initial latest events ─────────────────────────────────────────
  const loadRecentEvents = useCallback(async () => {
    const active = localStorage.getItem("activeDashboard");
    let query = supabase.from("events").select("*").order("created_at", { ascending: false }).limit(15);
    if (active) query = query.eq("metadata->>dashboard", active);
    const { data } = await query;
    if (data) setLiveEvents(data);
  }, []);

  useEffect(() => {
    loadMetrics();
    loadRecentEvents();

    // Auto-refresh metrics every 15 seconds
    const metricsTick = setInterval(loadMetrics, 15_000);

    // Realtime new events via WebSocket
    const active = localStorage.getItem("activeDashboard");
    const channel = supabase.channel("realtime_dashboard")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events", filter: active ? `metadata->>dashboard=eq.${active}` : undefined }, (payload) => {
        const ev = payload.new as any;
        setLiveEvents((prev) => [ev, ...prev].slice(0, 15));
        setTotalEvents((n) => n + 1);
        // Update chart last bucket
        setChartData((prev) => {
          if (!prev.length) return prev;
          const updated = [...prev];
          const last = { ...updated[updated.length - 1] };
          last.events++;
          if (ev.status === "error") last.errors++;
          updated[updated.length - 1] = last;
          return updated;
        });
        // Update top events
        setTopEvents((prev) => {
          const existing = prev.find((e) => e.name === ev.event_name);
          if (existing) {
            return prev.map((e) => e.name === ev.event_name ? { ...e, count: e.count + 1 } : e)
              .sort((a, b) => b.count - a.count);
          }
          return [...prev, { name: ev.event_name, count: 1 }].sort((a, b) => b.count - a.count).slice(0, 7);
        });
        // Check for errors to trigger alert
        if (ev.status === "error") {
          supabase.auth.getUser().then(({ data }) => {
            const targetEmail = data?.user?.email || localStorage.getItem("userEmail");
            fetch("/api/v1/alerts/check", { 
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: targetEmail, dashboard: active })
            }).catch(() => {});
          });
        }
      })
      .subscribe();

    return () => {
      clearInterval(metricsTick);
      supabase.removeChannel(channel);
    };
  }, [loadMetrics, loadRecentEvents]);

  // ─── Simulate traffic ─────────────────────────────────────────────────────
  const sendTestEvent = useCallback(async () => {
    const events = ["user_login", "payment_completed", "video_watched", "api_error", "page_view", "checkout_started", "signup"];
    const event = events[Math.floor(Math.random() * events.length)];
    const status = event === "api_error" ? "error" : "ok";
    const active = localStorage.getItem("activeDashboard");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    await fetch(`${backendUrl}/api/v1/events/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${activeApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: event, user_id: `usr_${Math.floor(Math.random() * 1000)}`, latency: Math.floor(Math.random() * 120), status, dashboard: active || undefined }),
    }).catch(() => {
      // Fallback to Next.js API if python backend isn't running
      fetch("/api/v1/events", {
        method: "POST",
        headers: { "Authorization": `Bearer ${activeApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ event_name: event, user_id: `usr_${Math.floor(Math.random() * 1000)}`, latency: Math.floor(Math.random() * 120), status, dashboard: active || undefined }),
      });
    });
  }, [activeApiKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) { sendTestEvent(); interval = setInterval(sendTestEvent, 2000); }
    return () => clearInterval(interval);
  }, [isSimulating, sendTestEvent]);

  // ─── KPI values ──────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Events",  value: formatNumber(totalEvents), icon: Zap,           color: "#a78bfa", up: true,  delta: "all time" },
    { label: "Active Users",  value: formatNumber(activeUsers),  icon: Users,         color: "#06B6D4", up: true,  delta: "last 5 min" },
    { label: "Error Rate",    value: errorRate,                   icon: AlertTriangle, color: "#f87171", up: false, delta: "last 24h" },
    { label: "Avg Latency",   value: avgLatency,                  icon: Clock,         color: "#fbbf24", up: false, delta: "last 24h" },
  ];

  return (
    <div className="space-y-6 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#192837]" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>{activeDashboard || "Overview"}</h1>
          <p className="text-[#192837]/60 text-sm mt-1">Last 24 hours · {activeDashboard ? "custom" : userOrg} workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSimulating(!isSimulating)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: isSimulating ? "#ef4444" : "#7342E2", color: "white", boxShadow: isSimulating ? "0 4px 20px rgba(239,68,68,0.35)" : "0 4px 20px rgba(115,66,226,0.35)" }}>
            {isSimulating ? "Stop Simulation" : "Simulate Traffic"}
          </button>
          <select className="text-sm text-[#192837] rounded-xl px-3 py-2 outline-none"
            style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(12px)" }}>
            <option>Last 24h</option><option>Last 7d</option><option>Last 30d</option>
          </select>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="layout-container">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={(layout: any, layouts: any) => setLayouts(layouts)}
          isDraggable={true}
          isResizable={true}
          margin={[16, 16]}
        >
          {/* KPI Cards */}
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label}>
                <motion.div custom={i} initial="hidden" animate="visible" variants={fadeUp}
                  className="rounded-2xl p-5 relative overflow-hidden w-full h-full"
                  style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)", cursor: "grab" }}>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}18` }}>
                    <Icon size={16} style={{ color: kpi.color === "#a78bfa" ? "#7342E2" : kpi.color }} />
                  </div>
                  <div className="text-xs text-[#192837]/60 mb-2">{kpi.label}</div>
                  <div className="text-2xl font-bold text-[#192837] mb-1.5" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
                    {kpi.value}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-green-500" : "text-[#192837]/50"}`}>
                    {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {kpi.delta}
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* Area Chart */}
          <div key="eventVolume">
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
              className="rounded-2xl p-5 w-full h-full flex flex-col"
              style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)", cursor: "grab" }}>
              <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-[#192837]">Event Volume</h3>
                  <p className="text-xs text-[#192837]/60 mt-0.5">Events ingested per 2-hour interval</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#192837]/60">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7342E2]" />Events</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Errors</span>
                </div>
              </div>
              <div className="flex-grow min-h-[150px]" style={{ minWidth: 0, minHeight: 0 }}>
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#192837]/40">
                    No events yet. Send some events to see the chart populate in real time!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f87171" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(25, 40, 55, 0.05)" />
                      <XAxis dataKey="time" stroke="rgba(25, 40, 55, 0.1)" tick={{ fill: "rgba(25, 40, 55, 0.5)", fontSize: 11 }} />
                      <YAxis stroke="rgba(25, 40, 55, 0.1)" tick={{ fill: "rgba(25, 40, 55, 0.5)", fontSize: 11 }} />
                      <Tooltip {...tooltipStyle} />
                      <Area type="monotone" dataKey="events" stroke="#7C3AED" strokeWidth={2} fill="url(#evGrad)" dot={false} />
                      <Area type="monotone" dataKey="errors" stroke="#f87171" strokeWidth={2} fill="url(#errGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bar Chart */}
          <div key="topEvents">
            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
              className="rounded-2xl p-5 w-full h-full flex flex-col"
              style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)", cursor: "grab" }}>
              <div className="mb-5 flex-shrink-0">
                <h3 className="text-sm font-semibold text-[#192837]">Top Events</h3>
                <p className="text-xs text-[#192837]/60 mt-0.5">By volume today</p>
              </div>
              <div className="flex-grow min-h-[150px]" style={{ minWidth: 0, minHeight: 0 }}>
                {topEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#192837]/40 text-center px-4">
                    No events yet. Start tracking to see your top events here.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={topEvents} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(25, 40, 55, 0.05)" horizontal={false} />
                      <XAxis type="number" stroke="rgba(25, 40, 55, 0.1)" tick={{ fill: "rgba(25, 40, 55, 0.5)", fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" stroke="rgba(25, 40, 55, 0.1)" tick={{ fill: "rgba(25, 40, 55, 0.5)", fontSize: 9 }} width={80} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="count" fill="#7342E2" radius={[0, 4, 4, 0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        </ResponsiveGridLayout>
      </div>

      {/* Live Event Stream */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#192837]/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
            <h3 className="text-sm font-semibold text-[#192837]">Live Event Stream</h3>
          </div>
          <span className="text-xs text-[#192837]/60">Updates instantly via WebSocket</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#192837]/10">
                {["Time", "Event", "User", "Latency", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#192837]/70 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#192837]/5">
              {liveEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-[#192837]/50">
                    Waiting for live events... Send your first event to see it stream here instantly.
                  </td>
                </tr>
              ) : liveEvents.map((ev, i) => (
                <motion.tr
                  initial={{ opacity: 0, x: -16, backgroundColor: "rgba(115, 66, 226, 0.08)" }}
                  animate={{ opacity: 1, x: 0, backgroundColor: "rgba(255, 255, 255, 0)" }}
                  transition={{ duration: 0.6 }}
                  key={ev.id || i} className="hover:bg-[#192837]/5 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-[#192837]/50 whitespace-nowrap font-mono">
                    {new Date(ev.created_at).toLocaleTimeString([], { hour12: false })}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[#192837] font-medium">{ev.event_name}</td>
                  <td className="px-5 py-3.5 text-xs text-[#192837]/70">{ev.user_id || "anonymous"}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[#192837]/60">{ev.latency}ms</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={ev.status === "ok" ? { background: "rgba(34,197,94,0.12)", color: "#22c55e" } : { background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ev.status === "ok" ? "#22c55e" : "#f87171" }} />
                      {ev.status === "ok" ? "200 OK" : "500 ERR"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
