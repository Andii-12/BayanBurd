import { Router } from "express";
import { DocumentFile, ServiceHistory } from "../models";
import { asyncHandler, paginate } from "../utils/http";
import { AuthRequest, requireAdmin, requireAuth } from "../middleware/auth";
import { paginationQuery } from "@bbe/validation";
import { upload } from "../middleware/upload";
import { saveFile } from "../services/storage";

const router = Router();

router.get(
  "/documents",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user!.role);
    const filter: Record<string, unknown> = isAdmin ? {} : { clientId: req.user!.clientId };
    if (req.query.assetId) filter.assetId = req.query.assetId;
    const items = await DocumentFile.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ items });
  })
);

router.post(
  "/documents",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).json({ error: "Файл шаардлагатай" });
    const saved = await saveFile(req.file, "documents");
    const doc = await DocumentFile.create({
      clientId: req.body.clientId,
      assetId: req.body.assetId || undefined,
      orderId: req.body.orderId || undefined,
      type: req.body.type || "OTHER",
      name: req.body.name || saved.name,
      url: saved.url,
      mime: saved.mime,
      size: saved.size,
    });
    res.status(201).json(doc);
  })
);

router.get(
  "/service-history",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = paginationQuery.parse(req.query);
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "ENGINEER", "SUPPORT"].includes(req.user!.role);
    const filter: Record<string, unknown> = isAdmin ? {} : { clientId: req.user!.clientId };
    if (req.query.assetId) filter.assetId = req.query.assetId;
    if (req.query.clientId && isAdmin) filter.clientId = req.query.clientId;
    const total = await ServiceHistory.countDocuments(filter);
    const items = await ServiceHistory.find(filter)
      .populate("assetId clientId engineerId issueId")
      .sort({ performedAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    res.json({ items, ...paginate(q.page, q.limit, total) });
  })
);

export default router;
