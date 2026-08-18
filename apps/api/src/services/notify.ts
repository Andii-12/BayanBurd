import { Notification, User } from "../models";
import type { NotificationType } from "@bbe/types";
import { sendEmailSafe } from "./email";

export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  email?: { to: string; subject: string; html: string };
}) {
  await Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
  });
  if (params.email) {
    await sendEmailSafe(params.email.to, params.email.subject, params.email.html);
  }
}

export async function notifyClientUsers(
  clientId: string,
  payload: Omit<Parameters<typeof notifyUser>[0], "userId">
) {
  const users = await User.find({ clientId, active: true });
  await Promise.all(users.map((u) => notifyUser({ ...payload, userId: String(u._id) })));
}

export async function notifyAdmins(payload: Omit<Parameters<typeof notifyUser>[0], "userId">) {
  const users = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] }, active: true });
  await Promise.all(users.map((u) => notifyUser({ ...payload, userId: String(u._id) })));
}
