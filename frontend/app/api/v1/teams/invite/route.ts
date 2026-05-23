import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, role, inviterName, workspaceName } = await req.json();

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send Email via Resend
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #192837;">You've been invited to Nexora Analytics!</h2>
          <p style="color: #192837; font-size: 16px; line-height: 1.5;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="color: #192837; font-size: 16px; line-height: 1.5;">
            <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace as an <strong>${role}</strong>.
          </p>
          <p style="color: #192837; font-size: 16px; line-height: 1.5;">
            Nexora is your real-time telemetry and analytics platform.
          </p>
          <div style="margin: 30px 0;">
            <a href="http://localhost:3000/login" style="background-color: #7342E2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="color: #666666; font-size: 12px;">
            If you did not expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: 'Nexora Analytics <onboarding@resend.dev>',
        to: [email],
        subject: `You're invited to join ${workspaceName} on Nexora`,
        html: emailHtml,
      });

      if (error) {
        console.error("Resend API returned error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

    } catch (emailError: any) {
      console.error("Resend Email Exception:", emailError);
      return NextResponse.json({ error: emailError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Invite API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
