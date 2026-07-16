import nodemailer from 'nodemailer';

const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

/**
 * Sends the ticket email if real SMTP credentials are configured (SMTP_HOST / SMTP_USER /
 * SMTP_PASS env vars). Otherwise simulates the send by logging the content — nothing is
 * delivered, but the report is still marked as ticketed so the officer flow works end-to-end.
 */
export async function sendTicketEmail({ to, subject, text }) {
  if (!transporter) {
    console.log('--- SIMULATED TICKET EMAIL (no SMTP configured) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log('--- set SMTP_HOST / SMTP_USER / SMTP_PASS env vars to send for real ---');
    return { simulated: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
  return { simulated: false };
}
