import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "../config/env";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
}

function wrap(title: string, inner: string) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#f7f8f6;font-family:Arial,sans-serif;color:#171717;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <div style="background:#28521F;color:#fff;padding:18px 24px;font-size:16px;font-weight:700;">Bayan Burd Eternity</div>
    <div style="padding:24px;">
      <h1 style="margin:0 0 12px;font-size:18px;">${escapeHtml(title)}</h1>
      ${inner}
    </div>
    <div style="padding:12px 24px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">Энэ имэйл автоматаар илгээгдсэн.</div>
  </div>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#F7934C;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">${escapeHtml(label)}</a></p>`;
}

let resendClient: Resend | null | undefined;

function resend() {
  if (!env.resendApiKey) return null;
  if (resendClient === undefined) resendClient = new Resend(env.resendApiKey);
  return resendClient;
}

function smtp() {
  if (!env.smtpHost) return null;
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const client = resend();
  if (client) {
    const { data, error } = await client.emails.send({
      from: env.resendFrom,
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message || "Resend имэйл илгээгдсэнгүй");
    console.log("[email] Resend илгээлээ", { to, subject, id: data?.id });
    return;
  }
  const t = smtp();
  if (t) {
    await t.sendMail({ from: env.smtpFrom, to, subject, html });
    return;
  }
  console.log("[email:dev] RESEND_API_KEY байхгүй, имэйл илгээгдсэнгүй", { to, subject });
}

export async function sendEmailSafe(to: string, subject: string, html: string) {
  try {
    await sendEmail(to, subject, html);
  } catch (err) {
    console.error("[email] илгээгдсэнгүй:", err instanceof Error ? err.message : err);
  }
}

export const emailTemplates = {
  registration: (companyName: string, loginUrl: string) => ({
    subject: "Bayan Burd Eternity — бүртгэл амжилттай",
    html: wrap(
      "Бүртгэл амжилттай",
      `<p>Сайн байна уу, <b>${escapeHtml(companyName)}</b>.</p>
       <p>Таны харилцагчийн бүртгэл амжилттай үүслээ. Одоо портал руу нэвтэрч захиалга, asset, issue-ээ удирдах боломжтой.</p>
       ${button(loginUrl, "Портал руу орох")}`
    ),
  }),
  passwordReset: (resetUrl: string) => ({
    subject: "Bayan Burd Eternity — нууц үг сэргээх",
    html: wrap(
      "Нууц үг сэргээх",
      `<p>Та нууц үгээ сэргээх хүсэлт илгээлээ. Доорх товчийг дарж шинэ нууц үг тохируулна уу. Холбоос <b>1 цаг</b> хүчинтэй.</p>
       ${button(resetUrl, "Нууц үг солих")}
       <p style="font-size:12px;color:#6b7280;">Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.</p>`
    ),
  }),
  orderCreated: (orderNumber: string) => ({
    subject: `Захиалга ${orderNumber} үүслээ`,
    html: wrap("Шинэ захиалга", `<p>Таны захиалга <b>${escapeHtml(orderNumber)}</b> амжилттай бүртгэгдлээ.</p>`),
  }),
  orderConfirmed: (orderNumber: string) => ({
    subject: `Захиалга ${orderNumber} баталгаажлаа`,
    html: wrap("Захиалга баталгаажлаа", `<p>Захиалга <b>${escapeHtml(orderNumber)}</b> баталгаажлаа.</p>`),
  }),
  issueCreated: (issueNumber: string, title: string) => ({
    subject: `Issue #${issueNumber} үүслээ`,
    html: wrap("Шинэ issue", `<p>Шинэ issue: <b>#${escapeHtml(issueNumber)}</b> — ${escapeHtml(title)}</p>`),
  }),
  issueCommented: (issueNumber: string) => ({
    subject: `Issue #${issueNumber} — шинэ сэтгэгдэл`,
    html: wrap("Шинэ сэтгэгдэл", `<p>Таны Issue #${escapeHtml(issueNumber)}-д шинэ comment нэмэгдлээ.</p>`),
  }),
  issueResolved: (issueNumber: string) => ({
    subject: `Issue #${issueNumber} шийдвэрлэгдлээ`,
    html: wrap("Issue шийдвэрлэгдлээ", `<p>Issue #${escapeHtml(issueNumber)} RESOLVED боллоо.</p>`),
  }),
  installationScheduled: (date: string) => ({
    subject: "Суурилуулалт товлогдлоо",
    html: wrap("Суурилуулалт", `<p>Суурилуулалт ${escapeHtml(date)}-нд товлогдлоо.</p>`),
  }),
  warrantyExpiring: (name: string, days: number) => ({
    subject: `Баталгаа дуусахад ${days} хоног үлдлээ`,
    html: wrap("Баталгаа дуусах дөхлөө", `<p>${escapeHtml(name)} баталгааны хугацаа ${days} хоногийн дараа дуусна.</p>`),
  }),
};
