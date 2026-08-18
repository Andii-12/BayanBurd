import nodemailer from "nodemailer";
import { env } from "../config/env";

function transport() {
  if (!env.smtpHost) return null;
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const t = transport();
  if (!t) {
    console.log("[email:dev]", { to, subject });
    return;
  }
  await t.sendMail({ from: env.smtpFrom, to, subject, html });
}

export const emailTemplates = {
  registration: (name: string) => ({
    subject: "Bayan Burd Eternity — бүртгэл амжилттай",
    html: `<p>Сайн байна уу, ${name}.</p><p>Таны бүртгэл амжилттай үүслээ.</p>`,
  }),
  orderCreated: (orderNumber: string) => ({
    subject: `Захиалга ${orderNumber} үүслээ`,
    html: `<p>Таны захиалга <b>${orderNumber}</b> амжилттай бүртгэгдлээ.</p>`,
  }),
  orderConfirmed: (orderNumber: string) => ({
    subject: `Захиалга ${orderNumber} баталгаажлаа`,
    html: `<p>Захиалга <b>${orderNumber}</b> баталгаажлаа.</p>`,
  }),
  issueCreated: (issueNumber: string, title: string) => ({
    subject: `Issue #${issueNumber} үүслээ`,
    html: `<p>Шинэ issue: <b>#${issueNumber}</b> — ${title}</p>`,
  }),
  issueCommented: (issueNumber: string) => ({
    subject: `Issue #${issueNumber} — шинэ сэтгэгдэл`,
    html: `<p>Таны Issue #${issueNumber}-д шинэ comment нэмэгдлээ.</p>`,
  }),
  issueResolved: (issueNumber: string) => ({
    subject: `Issue #${issueNumber} шийдвэрлэгдлээ`,
    html: `<p>Issue #${issueNumber} RESOLVED боллоо.</p>`,
  }),
  installationScheduled: (date: string) => ({
    subject: "Суурилуулалт товлогдлоо",
    html: `<p>Суурилуулалт ${date}-нд товлогдлоо.</p>`,
  }),
  warrantyExpiring: (name: string, days: number) => ({
    subject: `Баталгаа дуусахад ${days} хоног үлдлээ`,
    html: `<p>${name} баталгааны хугацаа ${days} хоногийн дараа дуусна.</p>`,
  }),
};
