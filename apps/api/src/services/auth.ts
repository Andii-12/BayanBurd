import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../config/env";
import { RefreshToken, User, UserDoc } from "../models";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(user: UserDoc) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, clientId: user.clientId ? String(user.clientId) : null },
    env.jwtSecret,
    { expiresIn: env.jwtAccessExpires as jwt.SignOptions["expiresIn"] }
  );
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId, typ: "refresh" }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpires as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, env.jwtSecret) as {
    sub: string;
    role: string;
    clientId: string | null;
  };
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string; typ: string };
}

export async function persistRefreshToken(userId: string, token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const decoded = jwt.decode(token) as { exp?: number };
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 864e5);
  await RefreshToken.create({ userId, tokenHash, expiresAt });
}

export async function rotateRefreshToken(oldToken: string) {
  const payload = verifyRefresh(oldToken);
  const tokenHash = crypto.createHash("sha256").update(oldToken).digest("hex");
  const stored = await RefreshToken.findOne({ userId: payload.sub, tokenHash });
  if (!stored) throw new Error("Invalid refresh token");
  await stored.deleteOne();
  const user = await User.findById(payload.sub);
  if (!user || !user.active) throw new Error("User inactive");
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(String(user._id));
  await persistRefreshToken(String(user._id), refreshToken);
  return { user, accessToken, refreshToken };
}

export async function revokeRefreshToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await RefreshToken.deleteOne({ tokenHash });
}

export function publicUser(user: UserDoc) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    clientId: user.clientId ? String(user.clientId) : null,
    avatar: user.avatar,
    active: user.active,
  };
}
