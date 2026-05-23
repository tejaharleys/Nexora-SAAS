import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// ─── CORS ─────────────────────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ─── Alert thresholds ─────────────────────────────────────────────────────
const ERROR_RATE_THRESHOLD = 5;   // Alert if error rate > 5%
const ALERT_OWNER_EMAIL    = process.env.ALERT_EMAIL || 'admin@example.com'; // ← your email

let lastAlertSentAt = 0; // Prevent spamming — 1 alert per 5 minutes max

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");
    let payloadEmail = null;
    let payloadDashboard = null;
    try {
      const body = await req.json();
      payloadEmail = body?.email;
      payloadDashboard = body?.dashboard;
    } catch (e) {}
    
    const TARGET_EMAIL = process.env.ALERT_EMAIL || payloadEmail || 'admin@example.com';
    const now = Date.now();
    // Rate-limit: only send one alert every 10 seconds (for testing purposes)
    if (now - lastAlertSentAt < 10 * 1000) {
      return NextResponse.json({ skipped: 'cooldown active' }, { headers: corsHeaders });
    }

    // ── Check error rate in last 5 minutes ─────────────────────────────────
    const since5m = new Date(now - 5 * 60 * 1000).toISOString();

    let queryTotal = supabase.from('events').select('*', { count: 'exact', head: true }).gte('created_at', since5m);
    let queryErrors = supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'error').gte('created_at', since5m);

    if (payloadDashboard) {
      queryTotal = queryTotal.eq('metadata->>dashboard', payloadDashboard);
      queryErrors = queryErrors.eq('metadata->>dashboard', payloadDashboard);
    } else {
      queryTotal = queryTotal.is('metadata->>dashboard', null);
      queryErrors = queryErrors.is('metadata->>dashboard', null);
    }

    const { count: total } = await queryTotal;
    const { count: errors } = await queryErrors;

    if (!total || total < 1) {
      // Not enough data to evaluate
      return NextResponse.json({ skipped: 'not enough data' }, { headers: corsHeaders });
    }

    const errorRate = (errors ?? 0) / total * 100;

    if (errorRate < ERROR_RATE_THRESHOLD) {
      return NextResponse.json({ ok: true, errorRate: errorRate.toFixed(2) }, { headers: corsHeaders });
    }

    // ── Alert triggered! ──────────
    lastAlertSentAt = now;

    // 1. Store the triggered alert in DB so it shows in the Alerts UI IMMEDIATELY
    const { error: dbError } = await supabase.from('events').insert([{
      org_id: '11111111-1111-1111-1111-111111111111',
      event_name: 'ALERT_TRIGGERED',
      user_id: 'nexora_system',
      status: 'error',
      latency: 0,
      metadata: {
        type: 'error_rate_spike',
        error_rate: errorRate.toFixed(2),
        threshold: ERROR_RATE_THRESHOLD,
        message: `Error rate spiked to ${errorRate.toFixed(2)}%`,
        dashboard: payloadDashboard || null,
      },
    }]);

    if (dbError) {
      console.error("Failed to log alert to DB:", dbError);
    }

    // 2. Send the email (wrapped in try/catch in case API key is invalid and throws)
    let emailStatus = "Email Attempted";
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'Nexora Alerts <onboarding@resend.dev>',
        to: TARGET_EMAIL,
        subject: `🚨 CRITICAL: High Error Rate Spike Detected`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #192837;">
            <h2 style="color: #7342E2; margin-bottom: 0;">Nexora Analytics</h2>
            <p style="color: #666; margin-top: 5px;">Automated Alert System</p>
            
            <div style="background: #FFF5F5; border: 1px solid #FED7D7; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: #C53030; margin-top: 0;">⚠️ Alert Triggered: High Error Rate</h3>
              <p>Your project has crossed the critical threshold in the last 5 minutes.</p>
              
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;"><strong>Error Rate:</strong> <span style="color: #C53030; font-size: 18px;">${errorRate.toFixed(2)}%</span> (Threshold: ${ERROR_RATE_THRESHOLD}%)</li>
                <li style="margin-bottom: 10px;"><strong>Total Events:</strong> ${total}</li>
                <li style="margin-bottom: 10px;"><strong>Failed Events:</strong> ${errors}</li>
              </ul>
            </div>
            
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #7342E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Dashboard in Nexora
            </a>
          </div>
        `,
      });

      if (emailError) {
        console.error('Resend email failed:', emailError.message);
        emailStatus = `Email Failed: ${emailError.message}`;
      } else {
        emailStatus = `Alert email sent to ${TARGET_EMAIL}`;
      }
    } catch (e: any) {
      console.error('Resend threw an exception:', e.message);
      emailStatus = `Email Exception: ${e.message}`;
    }

    return NextResponse.json(
      { alert: true, errorRate: errorRate.toFixed(2), email: emailStatus },
      { headers: corsHeaders }
    );

  } catch (err) {
    console.error('Alert check error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
