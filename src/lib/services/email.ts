import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "LaunchProof <noreply@launchproof.com>";

export async function sendWelcomeEmail(to: string, name?: string) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to LaunchProof!",
    html: welcomeTemplate(name || "there"),
  });
}

export async function sendSignupNotification(
  to: string,
  projectName: string,
  signupEmail: string,
  signupCount: number
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New signup for ${projectName}!`,
    html: signupNotificationTemplate(projectName, signupEmail, signupCount),
  });
}

export async function sendWeeklyReport(
  to: string,
  projectName: string,
  stats: { pageViews: number; signups: number; conversionRate: number; score: number }
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Weekly report: ${projectName}`,
    html: weeklyReportTemplate(projectName, stats),
  });
}

export async function sendTestComplete(
  to: string,
  projectName: string,
  score: number,
  totalSignups: number
) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Validation complete: ${projectName} scored ${score}/100`,
    html: testCompleteTemplate(projectName, score, totalSignups),
  });
}

// Inline HTML templates (simple, no React Email overhead for server-side sends)

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;color:#111827;">🚀 LaunchProof</span>
    </div>
    <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
      <p>LaunchProof — Validate your startup idea in 24 hours</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://launchproof.com"}/settings/notifications" style="color:#6366f1;">Manage notifications</a></p>
    </div>
  </div>
</body>
</html>`;
}

function welcomeTemplate(name: string) {
  return baseLayout(`
    <h1 style="font-size:20px;color:#111827;margin:0 0 16px;">Welcome, ${name}!</h1>
    <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Thanks for joining LaunchProof. You're now ready to validate your startup ideas with real market data.
    </p>
    <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;">Here's how to get started:</p>
    <ol style="color:#4b5563;line-height:1.8;padding-left:20px;margin:0 0 24px;">
      <li><strong>Chat with AI Coach</strong> — describe your idea and get structured feedback</li>
      <li><strong>Generate a landing page</strong> — AI creates conversion-optimized copy</li>
      <li><strong>Create ad content</strong> — get ready-to-use ads for multiple channels</li>
      <li><strong>Track validation</strong> — measure real interest with signups and analytics</li>
    </ol>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://launchproof.com"}/project/new"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
      Create Your First Project
    </a>
  `);
}

function signupNotificationTemplate(projectName: string, signupEmail: string, signupCount: number) {
  return baseLayout(`
    <h1 style="font-size:20px;color:#111827;margin:0 0 16px;">New signup! 🎉</h1>
    <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">
      Someone just signed up for <strong>${projectName}</strong>.
    </p>
    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:0 0 16px;">
      <p style="margin:0;color:#374151;"><strong>Email:</strong> ${signupEmail}</p>
    </div>
    <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;">
      You now have <strong>${signupCount}</strong> total signup${signupCount !== 1 ? "s" : ""}.
    </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://launchproof.com"}/dashboard"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
      View Dashboard
    </a>
  `);
}

function weeklyReportTemplate(
  projectName: string,
  stats: { pageViews: number; signups: number; conversionRate: number; score: number }
) {
  return baseLayout(`
    <h1 style="font-size:20px;color:#111827;margin:0 0 16px;">Weekly Report: ${projectName}</h1>
    <p style="color:#4b5563;line-height:1.6;margin:0 0 20px;">Here's how your validation test performed this week:</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Page Views</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;text-align:right;">${stats.pageViews.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Signups</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;text-align:right;">${stats.signups}</td>
      </tr>
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Conversion Rate</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;text-align:right;">${stats.conversionRate.toFixed(1)}%</td>
      </tr>
      <tr>
        <td style="padding:12px;color:#6b7280;">Validation Score</td>
        <td style="padding:12px;font-weight:600;color:#6366f1;text-align:right;">${stats.score}/100</td>
      </tr>
    </table>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://launchproof.com"}/dashboard"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
      View Full Analytics
    </a>
  `);
}

function testCompleteTemplate(projectName: string, score: number, totalSignups: number) {
  const verdict = score >= 70 ? "Strong validation" : score >= 40 ? "Moderate interest" : "Needs iteration";
  const verdictColor = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#dc2626";

  return baseLayout(`
    <h1 style="font-size:20px;color:#111827;margin:0 0 16px;">Validation Complete!</h1>
    <p style="color:#4b5563;line-height:1.6;margin:0 0 20px;">
      Your validation test for <strong>${projectName}</strong> has finished.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;width:100px;height:100px;border-radius:50%;border:4px solid ${verdictColor};line-height:100px;font-size:32px;font-weight:700;color:${verdictColor};">
        ${score}
      </div>
      <p style="margin:8px 0 0;font-weight:600;color:${verdictColor};">${verdict}</p>
    </div>
    <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#374151;"><strong>Total Signups:</strong> ${totalSignups}</p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://launchproof.com"}/dashboard"
       style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
      View Results
    </a>
  `);
}
