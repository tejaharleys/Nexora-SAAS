"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Layout, Database, BarChart3, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    source: "all_events",
    customQuery: "",
  });

  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    "kpi_cards", "event_volume"
  ]);

  const widgets = [
    { id: "kpi_cards", name: "KPI Overview Cards", icon: Layout },
    { id: "event_volume", name: "Event Volume Chart", icon: BarChart3 },
    { id: "live_stream", name: "Real-time Event Stream", icon: Database },
  ];

  const toggleWidget = (id: string) => {
    if (selectedWidgets.includes(id)) {
      setSelectedWidgets(selectedWidgets.filter(w => w !== id));
    } else {
      setSelectedWidgets([...selectedWidgets, id]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      // Save dashboard to local storage
      const existing = JSON.parse(localStorage.getItem("customDashboards") || "[]");
      existing.push({ id: Date.now().toString(), name: form.name });
      localStorage.setItem("customDashboards", JSON.stringify(existing));
      
      // Set as active
      localStorage.setItem("activeDashboard", form.name);
      
      window.location.href = "/dashboard";
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-[#192837] mb-2" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
          Create New Dashboard
        </h1>
        <p className="text-[#192837]/60 text-sm">
          Set up a custom view to monitor specific events or metrics.
        </p>
      </div>

      <motion.form 
        onSubmit={handleCreate}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 space-y-8"
        style={{ 
          background: "rgba(255, 255, 255, 0.6)", 
          border: "1px solid rgba(25, 40, 55, 0.15)", 
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 80px rgba(25, 40, 55, 0.05)"
        }}
      >
        {/* Basic Info */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-[#192837] border-b border-[#192837]/10 pb-3">
            1. Basic Details
          </h2>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#192837] mb-2">Dashboard Name</label>
              <input 
                type="text" 
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g., Marketing Campaign Analytics" 
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-[#192837]/15 text-[#192837] text-sm outline-none focus:border-[#7342E2]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#192837] mb-2">Description (Optional)</label>
              <textarea 
                rows={3}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="What is this dashboard tracking?" 
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-[#192837]/15 text-[#192837] text-sm outline-none focus:border-[#7342E2]/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-[#192837] border-b border-[#192837]/10 pb-3">
            2. Data Source
          </h2>
          <div className="space-y-3">
            <select 
              value={form.source}
              onChange={e => setForm({...form, source: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-white/80 border border-[#192837]/15 text-[#192837] text-sm outline-none focus:border-[#7342E2]/50 transition-colors"
            >
              <option value="all_events">All Events in Workspace</option>
              <option value="api_errors">Only API Errors</option>
              <option value="user_auth">Authentication Events</option>
              <option value="custom">Custom Query...</option>
            </select>
            
            {form.source === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                className="overflow-hidden"
              >
                <textarea 
                  rows={3}
                  value={form.customQuery}
                  onChange={e => setForm({...form, customQuery: e.target.value})}
                  placeholder="SELECT * FROM events WHERE status = 'error'..." 
                  className="w-full px-4 py-3 rounded-xl bg-[#192837]/5 border border-[#192837]/15 text-[#192837] text-sm font-mono outline-none focus:border-[#7342E2]/50 transition-colors resize-none"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Widgets */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-[#192837] border-b border-[#192837]/10 pb-3">
            3. Select Widgets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {widgets.map(widget => {
              const Icon = widget.icon;
              const isSelected = selectedWidgets.includes(widget.id);
              return (
                <button
                  type="button"
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? "bg-[#7342E2]/5 border-[#7342E2]/30 shadow-[0_4px_12px_rgba(115,66,226,0.1)]" 
                      : "bg-white/50 border-[#192837]/10 hover:border-[#192837]/30 hover:bg-white"
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    isSelected ? "bg-[#7342E2] border-[#7342E2]" : "border-[#192837]/20"
                  }`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div>
                    <Icon size={18} className={`mb-2 ${isSelected ? "text-[#7342E2]" : "text-[#192837]/60"}`} />
                    <div className="font-semibold text-[#192837] text-sm">{widget.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-[#192837]/70 hover:text-[#192837] transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading || !form.name}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:brightness-110 active:scale-95 shadow-[0_4px_20px_rgba(115,66,226,0.35)]"
            style={{ background: "#7342E2" }}
          >
            {loading ? "Creating..." : "Create Dashboard"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
