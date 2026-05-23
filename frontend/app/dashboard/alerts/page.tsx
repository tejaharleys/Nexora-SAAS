"use client";

import { useEffect, useState } from "react";
import { BellRing, ShieldAlert, Zap, Clock, Plus, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeRules, setActiveRules] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", metric: "", severity: "warning" });
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const [activeDashboard, setActiveDashboard] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const active = localStorage.getItem("activeDashboard");
    setActiveDashboard(active);
    
    fetchAlerts(active);

    // Load active rules from local storage
    const storedRules = localStorage.getItem("activeAlertRules_" + (active || "default"));
    if (storedRules) {
      setActiveRules(JSON.parse(storedRules));
    }

    // Subscribe to new alerts in realtime
    const channel = supabase
      .channel('alerts_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: "event_name=eq.ALERT_TRIGGERED" }, (payload) => {
        const ev = payload.new as any;
        // Filter incoming events based on current dashboard context
        if (active) {
          if (ev.metadata?.dashboard !== active) return;
        } else {
          if (ev.metadata?.dashboard) return;
        }
        setAlerts(prev => [ev, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveRule = (rules: any[]) => {
    setActiveRules(rules);
    const active = localStorage.getItem("activeDashboard");
    localStorage.setItem("activeAlertRules_" + (active || "default"), JSON.stringify(rules));
  };

  const fetchAlerts = async (active: string | null) => {
    let query = supabase
      .from('events')
      .select('*')
      .eq('event_name', 'ALERT_TRIGGERED')
      .order('created_at', { ascending: false });
    
    if (active) {
      query = query.eq("metadata->>dashboard", active);
    } else {
      query = query.is("metadata->>dashboard", null);
    }

    const { data } = await query;
    if (data) setAlerts(data);
  };

  const filteredAlerts = alerts.filter(a => 
    (a.event_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.metadata?.message || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#192837]" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
            Alerts & Monitoring
          </h1>
          <p className="text-[#192837]/60 text-sm mt-1">Configure threshold rules to instantly notify your team via email or Webhook.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7342E2] text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95">
          <Plus size={16} /> Create Alert Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl p-6" style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <ShieldAlert size={20} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-[#192837] mb-1">{alerts.length}</div>
          <div className="text-sm font-semibold text-[#192837]/60">Triggered Alerts</div>
        </div>
        <div className="rounded-3xl p-6" style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}>
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
            <Check size={20} className="text-green-500" />
          </div>
          <div className="text-3xl font-bold text-[#192837] mb-1">0</div>
          <div className="text-sm font-semibold text-[#192837]/60">Resolved Today</div>
        </div>
        <div className="rounded-3xl p-6" style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}>
          <div className="w-10 h-10 rounded-xl bg-[#7342E2]/10 flex items-center justify-center mb-4">
            <Zap size={20} className="text-[#7342E2]" />
          </div>
          <div className="text-3xl font-bold text-[#192837] mb-1">{activeRules.length}</div>
          <div className="text-sm font-semibold text-[#192837]/60">Active Rules</div>
        </div>
      </div>

      <div 
        className="rounded-3xl p-8"
        style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#192837] flex items-center gap-2">
            <BellRing size={20} className="text-[#7342E2]" /> Triggered Alerts History
          </h2>
          <div className="relative w-64">
            <input 
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 bg-white/50 border border-[#192837]/10 rounded-lg text-sm text-[#192837] placeholder-[#192837]/40 outline-none focus:border-[#7342E2]/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#192837]/20 rounded-2xl">
               <p className="text-[#192837]/60">No alerts found.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-5 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full bg-red-500`} />
                  <div>
                    <h3 className="font-semibold text-sm text-[#192837] flex items-center gap-2">
                      Error Rate Spike Detected
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <code className="text-xs font-mono px-2 py-1 bg-red-500/10 text-red-700 rounded-md">
                        {alert.metadata?.message || 'Error Rate > 5%'}
                      </code>
                      <span className="flex items-center gap-1.5 text-xs text-[#192837]/50">
                        <Clock size={12} /> {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setSelectedAlert(alert)}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-[#192837]/10 rounded-lg text-[#192837]/70 hover:text-[#192837] shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Rule Modal */}
      {mounted && createPortal(
        <AnimatePresence>
        {isModalOpen && (
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-[#192837]/10 flex items-center justify-between bg-white/50">
                <h2 className="text-lg font-bold text-[#192837]">Create Alert Rule</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#192837]/50 hover:text-[#192837]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#192837]/80 mb-1.5">Rule Name</label>
                  <input type="text" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} placeholder="e.g. API Error Spike" className="w-full px-3 py-2 border border-[#192837]/10 rounded-lg text-sm outline-none focus:border-[#7342E2]/50 text-[#192837]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#192837]/80 mb-1.5">Metric Condition</label>
                  <input type="text" value={newRule.metric} onChange={e => setNewRule({...newRule, metric: e.target.value})} placeholder="e.g. Error Rate > 10%" className="w-full px-3 py-2 border border-[#192837]/10 rounded-lg text-sm outline-none focus:border-[#7342E2]/50 text-[#192837]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#192837]/80 mb-1.5">Severity</label>
                  <select value={newRule.severity} onChange={e => setNewRule({...newRule, severity: e.target.value})} className="w-full px-3 py-2 border border-[#192837]/10 rounded-lg text-sm outline-none focus:border-[#7342E2]/50 bg-white text-[#192837]">
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#192837]/10 flex justify-end gap-3 bg-[#f8fafc]">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#192837]/70 hover:text-[#192837]">Cancel</button>
                <button onClick={() => {
                  if (newRule.name && newRule.metric) {
                    saveRule([{ id: Date.now().toString(), ...newRule }, ...activeRules]);
                    setNewRule({ name: "", metric: "", severity: "warning" });
                    setIsModalOpen(false);
                  }
                }} className="px-4 py-2 bg-[#7342E2] text-white rounded-lg text-sm font-semibold hover:brightness-110 shadow-[0_4px_20px_rgba(115,66,226,0.35)]">Create Rule</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* View Alert Details Modal */}
      {mounted && createPortal(
        <AnimatePresence>
        {selectedAlert && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#192837]/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-[#192837]/10 flex items-center justify-between bg-white/50">
                <h2 className="text-lg font-bold text-[#192837] flex items-center gap-2">
                  <ShieldAlert size={18} className="text-red-500" />
                  Alert Details
                </h2>
                <button onClick={() => setSelectedAlert(null)} className="text-[#192837]/50 hover:text-[#192837]">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-[#192837]/50 uppercase tracking-wider mb-1">Time Triggered</div>
                    <div className="text-sm text-[#192837] font-medium">{new Date(selectedAlert.created_at).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#192837]/50 uppercase tracking-wider mb-1">Event Type</div>
                    <div className="text-sm font-mono text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100">{selectedAlert.event_name}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#192837]/50 uppercase tracking-wider mb-1">Message</div>
                    <div className="text-sm text-[#192837] font-medium">{selectedAlert.metadata?.message || "Threshold Exceeded"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#192837]/50 uppercase tracking-wider mb-2">Raw Metadata</div>
                    <pre className="bg-[#192837]/5 p-4 rounded-xl text-xs font-mono text-[#192837]/80 overflow-x-auto border border-[#192837]/10">
                      {JSON.stringify(selectedAlert.metadata || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#192837]/10 bg-[#f8fafc] flex justify-end">
                <button onClick={() => setSelectedAlert(null)} className="px-5 py-2.5 bg-white border border-[#192837]/10 text-[#192837] rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-sm transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
