"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Key, Copy, Check, Trash2, Plus, Server } from "lucide-react";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState<string | null>(null);

  useEffect(() => {
    const active = localStorage.getItem("activeDashboard");
    setActiveDashboard(active);
    fetchApiKeys(active);
  }, []);

  const fetchApiKeys = async (active: string | null) => {
    const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    if (data) {
      const filtered = data.filter((k: any) => {
        if (active) {
          return k.name.startsWith(`[${active}] `);
        } else {
          return !k.name.startsWith("[");
        }
      });
      setApiKeys(filtered);
    }
  };

  const generateApiKey = async () => {
    setIsGenerating(true);
    // Generate a secure looking API key
    const newKey = "sk_live_" + Array.from({ length: 32 }, () => Math.random().toString(36)[2] || "a").join("");
    
    // For this MVP, we use the test organization we created
    const orgId = "11111111-1111-1111-1111-111111111111";
    const keyName = activeDashboard ? `[${activeDashboard}] Production Key ${apiKeys.length + 1}` : `Production Key ${apiKeys.length + 1}`;

    const { data, error } = await supabase
      .from("api_keys")
      .insert([{ org_id: orgId, api_key: newKey, name: keyName }])
      .select()
      .single();

    if (data) {
      setApiKeys([data, ...apiKeys]);
    } else {
      console.error("Error generating key:", error);
      alert("Failed to create key. Make sure you ran the SQL setup script!");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteKey = async (id: string) => {
    await supabase.from("api_keys").delete().eq("id", id);
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#192837]" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}>
          Developer API Keys
        </h1>
        <p className="text-[#192837]/60 text-sm mt-1">Manage your active API keys and integrate your applications.</p>
      </div>

      <div 
        className="rounded-3xl p-8"
        style={{ background: "rgba(255, 255, 255, 0.6)", border: "1px solid rgba(25, 40, 55, 0.15)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-[#192837] flex items-center gap-2">
              <Key size={20} className="text-[#7342E2]" /> API Keys
            </h2>
            <p className="text-[#192837]/60 text-sm mt-1">Use these keys to authenticate your apps with Nexora's ingestion API.</p>
          </div>
          <button
            onClick={generateApiKey}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-[#7342E2] text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
            Generate New Key
          </button>
        </div>

        {/* Integration Code Snippet */}
        <div className="mb-8 p-5 rounded-2xl bg-[#192837] text-white overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" /> Quick Integration
              </h3>
              <p className="text-xs text-white/60 mt-1 max-w-xl">
                Copy and paste this code into your application. <strong className="text-yellow-300">Security Note:</strong> Always store your actual API Key in a <code className="bg-white/20 px-1 rounded">.env</code> file (e.g. <code>process.env.NEXORA_API_KEY</code>) rather than hardcoding it into your frontend or repository!
              </p>
            </div>
            <button 
              onClick={() => copyToClipboard(`const NEXORA_API_KEY = process.env.NEXORA_API_KEY; // Store your actual key in .env!\nconst NEXORA_ENDPOINT = "http://localhost:3000/api/v1/events"; // Change to your deployed Nexora URL later\n\nexport const trackEvent = async (eventName: string, userId: string = "anonymous", status: "ok" | "error" = "ok") => {\n  try {\n    await fetch(NEXORA_ENDPOINT, {\n      method: "POST",\n      headers: {\n        "Authorization": \`Bearer \${NEXORA_API_KEY}\`,\n        "Content-Type": "application/json",\n      },\n      body: JSON.stringify({\n        event_name: eventName,\n        user_id: userId,\n        status: status,\n        latency: Math.floor(Math.random() * 50) + 10,\n      }),\n    });\n  } catch (error) {\n    console.error("Failed to send event to Nexora Analytics");\n  }\n};`, "snippet")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedId === "snippet" ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              Copy Code
            </button>
          </div>
          <pre className="text-xs font-mono text-white/80 overflow-x-auto pb-2 custom-scrollbar">
            <code>{`const NEXORA_API_KEY = process.env.NEXORA_API_KEY; // Store your actual key in .env!
const NEXORA_ENDPOINT = "http://localhost:3000/api/v1/events"; // Change to your deployed Nexora URL later

export const trackEvent = async (eventName: string, userId: string = "anonymous", status: "ok" | "error" = "ok") => {
  try {
    await fetch(NEXORA_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${NEXORA_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: eventName,
        user_id: userId,
        status: status,
        latency: Math.floor(Math.random() * 50) + 10,
      }),
    });
  } catch (error) {
    console.error("Failed to send event to Nexora Analytics");
  }
};`}</code>
          </pre>
        </div>


        {apiKeys.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-[#192837]/10 rounded-2xl">
            <Server size={32} className="mx-auto mb-3 text-[#192837]/20" />
            <p className="text-[#192837]/60 text-sm">No API keys found. Generate one to start sending data.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((keyObj) => (
              <div key={keyObj.id} className="flex items-center justify-between p-4 rounded-xl border border-[#192837]/10 bg-white/40 hover:bg-white/60 transition-colors">
                <div>
                  <h3 className="font-semibold text-sm text-[#192837]">{keyObj.name.replace(/^\[.*?\]\s*/, '')}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <code className="text-xs font-mono px-2 py-1 bg-[#192837]/5 text-[#192837]/80 rounded-md select-all">
                      {keyObj.api_key}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(keyObj.api_key, keyObj.id)}
                      className="text-[#192837]/40 hover:text-[#7342E2] transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === keyObj.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#192837]/40 block mb-0.5">Created</span>
                    <span className="text-xs text-[#192837]/70">{new Date(keyObj.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="w-px h-8 bg-[#192837]/10" />
                  <button 
                    onClick={() => deleteKey(keyObj.id)}
                    className="p-2 text-[#192837]/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke Key"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
