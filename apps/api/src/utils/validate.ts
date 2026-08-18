import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./http";

export function validate(schema: z.ZodTypeAny, source: "body" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      return next(new AppError(400, msg || "Буруу өгөгдөл"));
    }
    req[source] = parsed.data;
    next();
  };
}
