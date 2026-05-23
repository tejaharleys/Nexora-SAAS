"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Users, UserPlus, Shield, MoreHorizontal, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

const DEFAULT_ORG_ID = "11111111-1111-1111-1111-111111111111";

export default function SettingsPage() {
  const [activeDashboard, setActiveDashboard] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const [isInviting, setIsInviting] = useState(false);

  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const active = localStorage.getItem("activeDashboard");
    setActiveDashboard(active);
    fetchTeamMembers();

    const subscription = supabase.channel("team_members_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_members" }, payload => {
        if (payload.eventType === "INSERT") {
          setTeamMembers(prev => [...prev, payload.new]);
        } else if (payload.eventType === "UPDATE") {
          setTeamMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        } else if (payload.eventType === "DELETE") {
          setTeamMembers(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTeamMembers = async () => {
    const { data } = await supabase.from("team_members").select("*").order("created_at", { ascending: true });
    if (data) setTeamMembers(data);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    
    try {
      const { error: dbError } = await supabase.from("team_members").insert([{
        org_id: DEFAULT_ORG_ID,
        name: inviteName,
        email: inviteEmail,
        role: inviteRole
      }]);

      if (dbError) {
        throw new Error("Failed to insert into database");
      }

      const response = await fetch('/api/v1/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          inviterName: teamMembers[0]?.name || "Workspace Owner",
          workspaceName: activeDashboard || localStorage.getItem("userOrg") || "Personal Workspace"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to send email: ${errorData.error}\n\nThe user was still added to the workspace, but they did not receive an email notification.`);
      }

      setIsInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Viewer");
    } catch (err: any) {
      console.error(err);
      alert(`Error inviting member: ${err.message}`);
    }
    
    setIsInviting(false);
  };

  const updateRole = async (id: string, newRole: string) => {
    setOpenDropdownId(null);
    await supabase.from("team_members").update({ role: newRole }).eq("id", id);
  };

  const removeMember = async (id: string) => {
    setOpenDropdownId(null);
    await supabase.from("team_members").delete().eq("id", id);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#192837]" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
          Settings & Configuration
        </h1>
        <p className="text-[#192837]/60 text-sm mt-1">Manage your workspace identity and team members.</p>
      </div>

      <div 
        className="rounded-3xl p-8"
        style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}
      >
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#192837] flex items-center gap-2">
             Workspace Profile
          </h2>
          <p className="text-[#192837]/60 text-sm mt-1">
            {activeDashboard ? "Update your custom dashboard name." : "Update your primary organization name."}
          </p>
        </div>
        
        <div className="flex items-end gap-4 max-w-sm">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#192837]/60 uppercase tracking-wider mb-1.5">
              {activeDashboard ? "Dashboard Name" : "Organization Name"}
            </label>
            <input 
              type="text" 
              defaultValue={typeof window !== "undefined" ? (activeDashboard || localStorage.getItem("userOrg") || "Personal Workspace") : ""}
              id="org-name-input"
              className="w-full px-4 py-2.5 bg-white border border-[#192837]/10 rounded-xl text-sm font-medium focus:outline-none focus:border-[#7342E2]/50 text-[#192837]"
            />
          </div>
          <button 
            onClick={async () => {
              const val = (document.getElementById("org-name-input") as HTMLInputElement).value.trim();
              if (val) {
                if (activeDashboard) {
                  const saved = JSON.parse(localStorage.getItem("customDashboards") || "[]");
                  const updated = saved.map((d: any) => d.name === activeDashboard ? { ...d, name: val } : d);
                  
                  localStorage.setItem("customDashboards", JSON.stringify(updated));
                  localStorage.setItem("activeDashboard", val);
                  await supabase.auth.updateUser({ data: { customDashboards: updated } });
                  window.location.reload();
                } else {
                  localStorage.setItem("userOrg", val);
                  await supabase.auth.updateUser({ data: { userOrg: val } });
                  window.location.reload();
                }
              }
            }}
            className="px-5 py-2.5 bg-[#192837] text-white rounded-xl text-sm font-semibold hover:bg-[#192837]/80 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Team Management */}
      <div 
        className="rounded-3xl p-8"
        style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-[#192837] flex items-center gap-2">
              <Users size={20} className="text-[#7342E2]" /> Team Management
            </h2>
            <p className="text-[#192837]/60 text-sm mt-1">Manage team members and their role-based access to this workspace.</p>
          </div>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#192837]/10 text-[#192837] rounded-xl text-sm font-semibold transition-all hover:bg-[#192837]/5 active:scale-95"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        </div>

        <div className="space-y-3">
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-[#192837]/50 text-sm">Loading team members...</div>
          )}
          {teamMembers.map((member, index) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-[#192837]/5 bg-white/40 hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7342E2]/20 to-cyan-500/20 flex items-center justify-center text-[#7342E2] font-bold text-sm">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-[#192837]">{member.name}</h3>
                    {index === 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#192837]/10 text-[#192837]/70 font-semibold tracking-wide">YOU</span>}
                  </div>
                  <p className="text-xs text-[#192837]/60 mt-0.5">{member.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 relative">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#192837]/5 border border-[#192837]/10 text-xs font-semibold text-[#192837]/80">
                  <Shield size={14} className={member.role === 'Owner' ? 'text-red-500' : member.role === 'Admin' ? 'text-orange-500' : member.role === 'Analyst' ? 'text-blue-500' : 'text-gray-500'} />
                  {member.role}
                  {index !== 0 && (
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === member.id ? null : member.id)}
                      className="ml-2 text-[#192837]/40 hover:text-[#192837] cursor-pointer"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {openDropdownId === member.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#192837]/10 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-1">
                        {['Owner', 'Admin', 'Analyst', 'Viewer'].map((r) => (
                          <button
                            key={r}
                            onClick={() => updateRole(member.id, r)}
                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${member.role === r ? 'bg-[#7342E2]/10 text-[#7342E2]' : 'text-[#192837]/80 hover:bg-[#192837]/5'}`}
                          >
                            Make {r}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-[#192837]/10 p-1">
                        <button
                          onClick={() => removeMember(member.id)}
                          className="w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-between"
                        >
                          Remove Member <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {mounted && createPortal(
        <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#192837]/40 backdrop-blur-sm"
              onClick={() => setIsInviteOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative z-10"
            >
              <button onClick={() => setIsInviteOpen(false)} className="absolute top-6 right-6 text-[#192837]/40 hover:text-[#192837]">
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold text-[#192837] mb-1">Invite Member</h2>
              <p className="text-sm text-[#192837]/60 mb-6">Send an invitation to join your workspace.</p>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#192837]/60 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input required type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#192837]/10 rounded-xl text-sm text-[#192837] focus:outline-none focus:border-[#7342E2]/50" placeholder="e.g. Alex Chen" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#192837]/60 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input required type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#192837]/10 rounded-xl text-sm text-[#192837] focus:outline-none focus:border-[#7342E2]/50" placeholder="alex@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#192837]/60 uppercase tracking-wider mb-1.5">Workspace Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-[#192837]/10 rounded-xl text-sm text-[#192837] focus:outline-none focus:border-[#7342E2]/50 cursor-pointer">
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                
                <button type="submit" disabled={isInviting} className="w-full py-3 mt-2 bg-[#7342E2] text-white rounded-xl text-sm font-semibold hover:bg-[#7342E2]/90 disabled:opacity-50">
                  {isInviting ? "Sending Invite..." : "Send Invitation"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
