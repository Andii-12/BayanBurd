import { Router } from "express";
import crypto from "crypto";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@bbe/validation";
import { Client, User } from "../models";
import { asyncHandler, AppError } from "../utils/http";
import { validate } from "../utils/validate";
import {
  hashPassword,
  persistRefreshToken,
  publicUser,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from "../services/auth";
import { sendEmail, emailTemplates } from "../services/email";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { env } from "../config/env";

const router = Router();

function setRefreshCookie(res: import("express").Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 7 * 24 * 3600 * 1000,
    path: "/api/auth",
  });
}

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const body = req.body;
    const exists = await User.findOne({ email: body.email.toLowerCase() });
    if (exists) throw new AppError(409, "Имэйл бүртгэлтэй байна");
    const client = await Client.create({
      companyName: body.companyName,
      registrationNumber: body.registrationNumber,
      address: body.address,
      contactName: `${body.firstName} ${body.lastName}`,
      email: body.email.toLowerCase(),
      phone: body.phone,
    });
    const user = await User.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      passwordHash: await hashPassword(body.password),
      role: "CLIENT",
      clientId: client._id,
    });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(String(user._id));
    await persistRefreshToken(String(user._id), refreshToken);
    setRefreshCookie(res, refreshToken);
    const t = emailTemplates.registration(body.companyName);
    await sendEmail(user.email, t.subject, t.html);
    res.status(201).json({ user: publicUser(user), client, accessToken });
  })
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError(401, "Имэйл эсвэл нууц үг буруу");
    }
    if (!user.active) throw new AppError(403, "Хэрэглэгч идэвхгүй");
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(String(user._id));
    await persistRefreshToken(String(user._id), refreshToken);
    setRefreshCookie(res, refreshToken);
    const client = user.clientId ? await Client.findById(user.clientId) : null;
    res.json({ user: publicUser(user), client, accessToken });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new AppError(401, "Refresh token байхгүй");
    try {
      const { user, accessToken, refreshToken } = await rotateRefreshToken(token);
      setRefreshCookie(res, refreshToken);
      res.json({ user: publicUser(user), accessToken });
    } catch {
      throw new AppError(401, "Refresh token хүчингүй");
    }
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (token) await revokeRefreshToken(token);
    res.clearCookie("refreshToken", { path: "/api/auth" });
    res.json({ ok: true });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const client = req.user?.clientId ? await Client.findById(req.user.clientId) : null;
    res.json({ user: publicUser(req.user!), client });
  })
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
      user.passwordResetExpires = new Date(Date.now() + 3600_000);
      await user.save();
      await sendEmail(
        user.email,
        "Нууц үг сэргээх",
        `<p>Нууц үг сэргээх холбоос: ${env.frontendUrl}/reset-password?token=${token}</p>`
      );
    }
    res.json({ ok: true, message: "Хэрэв имэйл бүртгэлтэй бол заавар илгээгдлээ." });
  })
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const hash = crypto.createHash("sha256").update(req.body.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hash,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) throw new AppError(400, "Токен хүчингүй эсвэл хугацаа дууссан");
    user.passwordHash = await hashPassword(req.body.password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ ok: true });
  })
);

export default router;
