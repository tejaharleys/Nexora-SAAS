import React from "react";

export default async function DashboardGenericPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex-1 flex items-center justify-center pt-20 pb-20 px-4">
        <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="text-center mb-12">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-[#7342E2] border mb-6"
              style={{ background: "rgba(115,66,226,0.1)", borderColor: "rgba(115,66,226,0.25)" }}
            >
              Workspace Module
            </span>
            <h1 
              className="text-3xl md:text-4xl font-bold text-[#192837] mb-4"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              {title}
            </h1>
            <p className="text-[#192837]/70 text-sm max-w-xl mx-auto">
              This module provides deep insights and configuration options for your workspace. Use the API keys from your Settings to send real-time events, which will automatically populate analytics across all modules.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm">
                <h3 className="font-bold text-[#192837] mb-2">Automated Alerting</h3>
                <p className="text-xs text-[#192837]/70">Configure your thresholds. Our Celery Beat workers evaluate your traffic every minute and dispatch emails via Resend when errors spike.</p>
             </div>
             <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm">
                <h3 className="font-bold text-[#192837] mb-2">Organization Roles</h3>
                <p className="text-xs text-[#192837]/70">FastAPI dependency guards ensure strict role hierarchies (Owner, Admin, Analyst, Viewer) across your team data.</p>
             </div>
          </div>
        </div>
    </div>
  );
}
