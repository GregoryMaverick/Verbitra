import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransport() {
  const smtpUrl = process.env.SMTP_URL;

  if (smtpUrl) {
    return nodemailer.createTransport(smtpUrl);
  }

  logger.warn("No SMTP_URL configured — magic link emails will be logged to console only");
  return null;
}

const transport = createTransport();

export async function sendMagicLinkEmail(email: string, link: string): Promise<void> {
  const subject = "Your Verbitra sign-in link";
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 8px; font-size: 20px; color: #1a1a2e;">Sign in to Verbitra</h2>
      <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
        Tap the button below to sign in. This link expires in 15 minutes and can only be used once.
      </p>
      <a href="${link}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Sign in to Verbitra
      </a>
      <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px;">
        If you didn't request this, you can ignore this email. The link will expire automatically.
      </p>
    </div>
  `;

  if (!transport) {
    if (process.env.NODE_ENV === "production") {
      // In production without SMTP, log only the email — never expose the token-bearing URL.
      logger.warn(
        { email },
        "Magic link could not be sent (SMTP_URL not set). Set SMTP_URL to enable email delivery.",
      );
    } else {
      // Development only: log the full link so devs can sign in without a real email provider.
      logger.info({ email, link }, "Magic link (email not configured — logging instead)");
    }
    return;
  }

  const fromAddress = process.env.EMAIL_FROM ?? "noreply@memorizer.app";

  await transport.sendMail({
    from: fromAddress,
    to: email,
    subject,
    html,
    text: `Sign in to Verbitra: ${link}\n\nThis link expires in 15 minutes.`,
  });

  logger.info({ email }, "Magic link email sent");
}
