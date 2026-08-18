import { Request, Response, NextFunction } from "express";
import { User, UserDoc } from "../models";
import { verifyAccess } from "../services/auth";
import { AppError } from "../utils/http";
import type { UserRole } from "@bbe/types";

export interface AuthRequest extends Request {
  user?: UserDoc;
}

export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;
    if (!token) throw new AppError(401, "Нэвтрэх шаардлагатай");
    const payload = verifyAccess(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.active) throw new AppError(401, "Хэрэглэгч идэвхгүй");
    req.user = user;
    next();
  } catch (e) {
    if (e instanceof AppError) return next(e);
    next(new AppError(401, "Токен хүчингүй"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Нэвтрэх шаардлагатай"));
    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError(403, "Хандах эрхгүй"));
    }
    next();
  };
}

export const requireAdmin = requireRole("ADMIN", "SUPER_ADMIN", "ENGINEER", "SALES", "SUPPORT");
export const requireSuperAdmin = requireRole("SUPER_ADMIN");

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;
  if (!token) return next();
  try {
    const payload = verifyAccess(token);
    User.findById(payload.sub).then((user) => {
      if (user?.active) req.user = user;
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}
