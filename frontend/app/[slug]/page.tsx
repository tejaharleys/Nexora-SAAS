import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default async function GenericPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-4xl w-full mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-[#7342E2] border mb-6"
              style={{ background: "rgba(115,66,226,0.1)", borderColor: "rgba(115,66,226,0.25)" }}
            >
              Nexora {title}
            </span>
            <h1 
              className="text-4xl md:text-5xl font-bold text-[#192837] mb-6"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              {title}
            </h1>
            <p className="text-[#192837]/70 text-lg mb-8 max-w-2xl mx-auto">
              {slug === "platform" || slug === "product" 
                ? "Nexora is a high-velocity, real-time analytics engine that processes millions of events asynchronously. Track user behavior, system latency, and critical errors with sub-50ms precision."
                : slug === "pricing"
                ? "Transparent, usage-based pricing for high-velocity teams. Start for free and scale seamlessly as your event volume grows."
                : slug === "webhooks" || slug === "api-reference" || slug === "developers" || slug === "sdk"
                ? "Integrate Nexora directly into your application. We provide strict Pydantic validation, Redis-backed rate limiting, and Stripe/Shopify webhook ingestion. Generate your API key in the dashboard to begin."
                : slug === "security" || slug === "privacy" || slug === "gdpr"
                ? "Your data security is our top priority. We provide organization-level data isolation, JWT authentication, and strict role-based access control (Owner, Admin, Analyst, Viewer)."
                : "Explore our real-time alerts, automated email notifications via Resend, drag-and-drop customizable dashboards, and scheduled PDF reporting."}
            </p>
            <div className="flex justify-center gap-4">
              <a href="/dashboard">
                <button className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: "#7342E2", boxShadow: "0 4px 20px rgba(115,66,226,0.35)" }}>
                  Open Dashboard
                </button>
              </a>
              <a href="/auth/signup">
                <button className="px-8 py-3.5 rounded-full text-sm font-semibold text-[#192837] bg-white border border-[#192837]/10 hover:bg-[#192837]/5 transition-all">
                  Start For Free
                </button>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {slug === "platform" || slug === "product" ? (
              <>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Event Ingestion Pipeline</h3>
                  <p className="text-sm text-[#192837]/70">Handles massive event streams with Redis buffering and FastAPI workers, ensuring no dropped payloads.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Automated Alerting</h3>
                  <p className="text-sm text-[#192837]/70">Trigger emails instantly when critical thresholds are crossed using Celery Beat background jobs.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Flexible Workspaces</h3>
                  <p className="text-sm text-[#192837]/70">Full multi-tenancy support right out of the box with built-in Role-Based Access Controls.</p>
                </div>
              </>
            ) : slug === "pricing" ? (
              <>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Hobby (Free)</h3>
                  <p className="text-sm text-[#192837]/70">Perfect for side projects. Up to 10k events/month with 1 week data retention and community support.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Pro ($49/mo)</h3>
                  <p className="text-sm text-[#192837]/70">For growing startups. 1M events/month, custom dashboards, and priority email alerting.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Enterprise (Custom)</h3>
                  <p className="text-sm text-[#192837]/70">Unlimited scale, dedicated infrastructure, VPC peering, and custom SSO integrations.</p>
                </div>
              </>
            ) : slug === "webhooks" || slug === "api-reference" || slug === "developers" || slug === "sdk" ? (
              <>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Pydantic Validation</h3>
                  <p className="text-sm text-[#192837]/70">Strict schema validation on our FastAPI endpoints prevents malformed data from ever reaching your database.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Secure API Keys</h3>
                  <p className="text-sm text-[#192837]/70">Generate and cycle Bearer tokens directly from the dashboard to securely authenticate external requests.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Native Webhooks</h3>
                  <p className="text-sm text-[#192837]/70">Out-of-the-box endpoints for consuming Stripe billing webhooks or Shopify order payloads asynchronously.</p>
                </div>
              </>
            ) : slug === "security" || slug === "privacy" || slug === "gdpr" ? (
              <>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Data Isolation</h3>
                  <p className="text-sm text-[#192837]/70">Supabase Row Level Security (RLS) policies guarantee that your telemetry data never leaks across organizations.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Role Guards</h3>
                  <p className="text-sm text-[#192837]/70">Owner, Admin, Analyst, and Viewer roles are strictly enforced via FastAPI dependency injection.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">GDPR Compliant</h3>
                  <p className="text-sm text-[#192837]/70">Configurable data retention policies allow you to easily anonymize or purge user metrics upon request.</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Real-Time Alerts</h3>
                  <p className="text-sm text-[#192837]/70">Threshold-based alerting evaluates your traffic every minute. Get instant email notifications when error rates spike.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Custom Dashboards</h3>
                  <p className="text-sm text-[#192837]/70">Drag, drop, and resize widgets. Build the exact analytical view your team needs to monitor KPIs efficiently.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-lg">
                  <h3 className="font-bold text-[#192837] mb-2">Multi-Tenancy</h3>
                  <p className="text-sm text-[#192837]/70">Invite your team, manage role hierarchies, and ensure strict data isolation across multiple workspaces.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
