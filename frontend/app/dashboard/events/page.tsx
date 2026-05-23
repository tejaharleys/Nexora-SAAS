"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Activity, Search, Filter, Download, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showAlertToast, setShowAlertToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get("q");
      if (q) setSearchQuery(q);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    // Subscribe to realtime updates
    const active = localStorage.getItem("activeDashboard");
    const channel = supabase
      .channel('events_page_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: active ? `metadata->>dashboard=eq.${active}` : undefined }, (payload) => {
        setEvents((prev) => [payload.new, ...prev].slice(0, 100)); // Keep last 100
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    const active = localStorage.getItem("activeDashboard");
    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
      
    if (active) {
      query = query.eq("metadata->>dashboard", active);
    }
    
    const { data } = await query;
    
    if (data) setEvents(data);
    setIsLoading(false);
  };

  const filteredEvents = events.filter(e => 
    (e.event_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.user_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.status || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    if (filteredEvents.length === 0) return;
    const headers = ["ID", "Timestamp", "Event Name", "User ID", "Latency (ms)", "Status", "Metadata"];
    const csvContent = [
      headers.join(","),
      ...filteredEvents.map(e => [
        e.id, 
        new Date(e.created_at).toISOString(),
        e.event_name,
        e.user_id || "anonymous",
        e.latency,
        e.status,
        JSON.stringify(e.metadata || {}).replace(/"/g, '""')
      ].map(v => `"${v}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `events_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAlert = () => {
    setShowAlertToast(true);
    setTimeout(() => setShowAlertToast(false), 3000);
  };

  return (
    <div className="max-w-[1280px] space-y-6 relative">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#192837]" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
            Event Logs
          </h1>
          <p className="text-[#192837]/60 text-sm mt-1">Real-time terminal of all incoming events across your organizations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCreateAlert} className="flex items-center gap-2 px-4 py-2 bg-[#7342E2] text-white rounded-xl text-sm font-semibold transition-all hover:brightness-110 shadow-[0_4px_20px_rgba(115,66,226,0.35)]">
            <Bell size={16} /> Create Alert
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white/40 border border-[#192837]/10 text-[#192837]/70 rounded-xl text-sm font-semibold transition-all hover:bg-white/80">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div 
        className="rounded-3xl overflow-hidden flex flex-col relative z-0"
        style={{ 
          background: "rgba(255, 255, 255, 0.6)", 
          border: "1px solid rgba(25, 40, 55, 0.15)", 
          backdropFilter: "blur(24px)",
          minHeight: "600px"
        }}
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-[#192837]/10 flex items-center gap-4 bg-white/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#192837]/40" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name, user, or status..." 
              className="w-full pl-9 pr-4 py-2 bg-white/50 border border-[#192837]/10 rounded-lg text-sm text-[#192837] placeholder-[#192837]/40 outline-none focus:border-[#7342E2]/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white/50 border border-[#192837]/10 text-[#192837]/70 rounded-lg text-sm font-medium hover:bg-white transition-colors">
            <Filter size={16} /> Filter
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
            <span className="text-xs font-semibold text-[#192837]/60 uppercase tracking-wider">Live Connection Active</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-[#192837]/10">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#192837]/70 uppercase tracking-wide text-xs">Timestamp</th>
                <th className="px-6 py-4 font-semibold text-[#192837]/70 uppercase tracking-wide text-xs">Event Name</th>
                <th className="px-6 py-4 font-semibold text-[#192837]/70 uppercase tracking-wide text-xs">User ID</th>
                <th className="px-6 py-4 font-semibold text-[#192837]/70 uppercase tracking-wide text-xs">Latency</th>
                <th className="px-6 py-4 font-semibold text-[#192837]/70 uppercase tracking-wide text-xs">Status</th>
                <th className="px-6 py-4 font-semibold text-[#192837]/70 uppercase tracking-wide text-xs text-right">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#192837]/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#192837]/50">
                    <div className="w-6 h-6 border-2 border-[#7342E2]/30 border-t-[#7342E2] rounded-full animate-spin mx-auto mb-3" />
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#192837]/50">
                    <Activity size={32} className="mx-auto mb-3 opacity-50" />
                    No events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, backgroundColor: "rgba(115, 66, 226, 0.1)" }} 
                    animate={{ opacity: 1, backgroundColor: "transparent" }}
                    transition={{ duration: 0.8 }}
                    key={ev.id || i} 
                    className="hover:bg-[#192837]/5 transition-colors group"
                  >
                    <td className="px-6 py-4 text-xs text-[#192837]/60 whitespace-nowrap">
                      {new Date(ev.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#192837] font-medium">{ev.event_name}</td>
                    <td className="px-6 py-4 text-xs text-[#192837]/70">{ev.user_id || 'anonymous'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-[#192837]/60">{ev.latency}ms</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                        style={ev.status === "ok" ? { background: "rgba(34,197,94,0.12)", color: "#4ade80" } : { background: "rgba(248,113,113,0.12)", color: "#f87171" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ev.status === "ok" ? "#4ade80" : "#f87171" }} />
                        {ev.status === "ok" ? "200 OK" : "500 ERR"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedEvent(ev)} className="text-xs text-[#7342E2] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View JSON</button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Modal */}
      {mounted && createPortal(
        <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#192837]/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-[#192837]/10 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#192837] font-mono">{selectedEvent.event_name}</h2>
                <button onClick={() => setSelectedEvent(null)} className="text-[#192837]/50 hover:text-[#192837]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-auto max-h-[60vh] bg-[#f8fafc]">
                <pre className="text-xs text-[#192837] font-mono whitespace-pre-wrap">
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Alert Toast */}
      <AnimatePresence>
        {showAlertToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-50 bg-[#192837] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-green-400" /> Alert created successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
