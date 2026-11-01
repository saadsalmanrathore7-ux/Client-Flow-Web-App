import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM;
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

if (!resendApiKey) {
  // We intentionally do not throw here so the app can still build
  // without email credentials; calls will just no-op with a warning.
  console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendVerificationEmail(params: {
  to: string;
  token: string;
}) {
  if (!resend || !fromEmail) {
    console.warn("Resend client or EMAIL_FROM not configured");
    return;
  }

  const verifyUrl = `${appUrl}/auth/verify-email?token=${encodeURIComponent(
    params.token,
  )}`;

  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: "Verify your email",
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5;">
        <h1>Verify your email</h1>
        <p>Thanks for signing up. Click the button below to verify your email address.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;">
            Verify Email
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  token: string;
}) {
  if (!resend || !fromEmail) {
    console.warn("Resend client or EMAIL_FROM not configured");
    return;
  }

  const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(
    params.token,
  )}`;

  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: "Reset your password",
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5;">
        <h1>Reset your password</h1>
        <p>We received a request to reset your password. Click the button below to choose a new password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `,
  });
}

export async function sendChatNotificationEmail(params: {
  to: string;
  previewText: string;
  conversationUrl: string;
}) {
  if (!resend || !fromEmail) {
    console.warn("Resend client or EMAIL_FROM not configured for chat emails");
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: "New message in your client portal",
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5;">
        <h1>You have a new message</h1>
        <p>${params.previewText}</p>
        <p>
          <a href="${params.conversationUrl}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;">
            Open conversation
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p><a href="${params.conversationUrl}">${params.conversationUrl}</a></p>
      </div>
    `,
  });
}


