import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = 'mom@veritamom.com';
const SITE = 'https://veritamom.com';

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${SITE}/en/reset-password?token=${token}`;

  await getResend().emails.send({
    from: `Veritamom <${FROM}>`,
    to,
    subject: 'Reset your Veritamom password',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAF8F3;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 22px; font-weight: bold; color: #8B1A2B; letter-spacing: 0.05em;">VERITAMOM</span>
          <p style="font-size: 9px; color: #C9A84C; letter-spacing: 0.17em; text-transform: uppercase; margin: 4px 0 0;">The Gold Standard in Maternal Intelligence</p>
        </div>
        <div style="background: #fff; border-radius: 16px; padding: 32px; border: 1px solid rgba(201,168,76,0.2);">
          <h1 style="font-size: 20px; color: #8B1A2B; margin: 0 0 12px;">Hi ${name},</h1>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #8B1A2B; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">
          © ${new Date().getFullYear()} Veritamom · <a href="${SITE}" style="color: #C9A84C;">veritamom.com</a>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await getResend().emails.send({
    from: `Veritamom <${FROM}>`,
    to,
    subject: 'Welcome to Veritamom',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAF8F3;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 22px; font-weight: bold; color: #8B1A2B; letter-spacing: 0.05em;">VERITAMOM</span>
          <p style="font-size: 9px; color: #C9A84C; letter-spacing: 0.17em; text-transform: uppercase; margin: 4px 0 0;">The Gold Standard in Maternal Intelligence</p>
        </div>
        <div style="background: #fff; border-radius: 16px; padding: 32px; border: 1px solid rgba(201,168,76,0.2);">
          <h1 style="font-size: 20px; color: #8B1A2B; margin: 0 0 12px;">Welcome, ${name} 👋</h1>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            You've joined a community of mothers and caregivers who believe in evidence-based, honest information.
          </p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Explore the research feed, track your baby's growth, and connect with mothers around the world.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${SITE}" style="display: inline-block; background: #8B1A2B; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 600;">
              Go to Veritamom
            </a>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">
          © ${new Date().getFullYear()} Veritamom · <a href="${SITE}" style="color: #C9A84C;">veritamom.com</a>
        </p>
      </div>
    `,
  });
}

export async function sendBulkUpdateEmail(
  recipients: { email: string; name: string }[],
  subject: string,
  bodyHtml: string,
) {
  const client = getResend();
  const results = { sent: 0, failed: 0 };
  for (const { email, name } of recipients) {
    const personalised = bodyHtml.replace(/\{\{name\}\}/g, name || 'there');
    try {
      await client.emails.send({
        from: `Veritamom <${FROM}>`,
        to: email,
        subject,
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAF8F3;">
            <div style="text-align: center; margin-bottom: 28px;">
              <span style="font-size: 22px; font-weight: bold; color: #8B1A2B; letter-spacing: 0.05em;">VERITAMOM</span>
              <p style="font-size: 9px; color: #C9A84C; letter-spacing: 0.17em; text-transform: uppercase; margin: 4px 0 0;">The Gold Standard in Maternal Intelligence</p>
            </div>
            <div style="background: #fff; border-radius: 16px; padding: 32px; border: 1px solid rgba(201,168,76,0.2);">
              ${personalised}
            </div>
            <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">
              © ${new Date().getFullYear()} Veritamom · <a href="${SITE}" style="color: #C9A84C;">veritamom.com</a>
            </p>
          </div>
        `,
      });
      results.sent++;
    } catch {
      results.failed++;
    }
    // stay within Resend's rate limit (~2 req/s on free tier)
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

export async function sendPublisherPromotionEmail(to: string, name: string) {
  await getResend().emails.send({
    from: `Veritamom <${FROM}>`,
    to,
    subject: 'You\'ve been promoted to Publisher on Veritamom',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAF8F3;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 22px; font-weight: bold; color: #8B1A2B; letter-spacing: 0.05em;">VERITAMOM</span>
          <p style="font-size: 9px; color: #C9A84C; letter-spacing: 0.17em; text-transform: uppercase; margin: 4px 0 0;">The Gold Standard in Maternal Intelligence</p>
        </div>
        <div style="background: #fff; border-radius: 16px; padding: 32px; border: 1px solid rgba(201,168,76,0.2);">
          <h1 style="font-size: 20px; color: #8B1A2B; margin: 0 0 12px;">Hi ${name},</h1>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            You've been granted <strong>Publisher access</strong> on Veritamom. You can now write and publish articles to our research feed.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${SITE}/en/publisher/articles" style="display: inline-block; background: #8B1A2B; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 600;">
              Start Writing
            </a>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">
          © ${new Date().getFullYear()} Veritamom · <a href="${SITE}" style="color: #C9A84C;">veritamom.com</a>
        </p>
      </div>
    `,
  });
}
