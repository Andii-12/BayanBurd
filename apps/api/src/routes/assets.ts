import { Router } from "express";
import { assetCreateSchema, paginationQuery } from "@bbe/validation";
import { Asset, AssetStatusHistory, Issue, ServiceHistory } from "../models";
import { asyncHandler, AppError, paginate } from "../utils/http";
import { validate } from "../utils/validate";
import { AuthRequest, requireAdmin, requireAuth } from "../middleware/auth";
import { nextAssetCode } from "../services/counters";
import { audit } from "../services/audit";

const router = Router();

function clientScope(req: AuthRequest) {
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "ENGINEER", "SUPPORT"].includes(req.user!.role);
  if (isAdmin) return req.query.clientId ? { clientId: req.query.clientId } : {};
  if (!req.user!.clientId) throw new AppError(403, "Хандах эрхгүй");
  return { clientId: req.user!.clientId };
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = paginationQuery.parse(req.query);
    const filter: Record<string, unknown> = { ...clientScope(req) };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (q.search) {
      filter.$or = [
        { name: new RegExp(q.search, "i") },
        { assetCode: new RegExp(q.search, "i") },
        { serialNumber: new RegExp(q.search, "i") },
      ];
    }
    const total = await Asset.countDocuments(filter);
    const items = await Asset.find(filter)
      .populate("clientId productId")
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    const ids = items.map((a) => a._id);
    const openCounts = await Issue.aggregate([
      { $match: { assetId: { $in: ids }, status: { $nin: ["RESOLVED", "CLOSED"] } } },
      { $group: { _id: "$assetId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(openCounts.map((c) => [String(c._id), c.count]));
    res.json({
      items: items.map((a) => ({ ...a.toObject(), openIssueCount: countMap.get(String(a._id)) || 0 })),
      ...paginate(q.page, q.limit, total),
    });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const asset = await Asset.findById(req.params.id).populate("clientId productId orderId");
    if (!asset) throw new AppError(404, "Asset олдсонгүй");
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "ENGINEER", "SUPPORT"].includes(req.user!.role);
    if (!isAdmin && String(asset.clientId._id || asset.clientId) !== String(req.user!.clientId)) {
      throw new AppError(403, "Хандах эрхгүй");
    }
    const [issues, history, statusHistory, openIssueCount] = await Promise.all([
      Issue.find({ assetId: asset._id }).sort({ createdAt: -1 }).limit(50),
      ServiceHistory.find({ assetId: asset._id }).sort({ performedAt: -1 }),
      AssetStatusHistory.find({ assetId: asset._id }).sort({ createdAt: -1 }),
      Issue.countDocuments({ assetId: asset._id, status: { $nin: ["RESOLVED", "CLOSED"] } }),
    ]);
    res.json({ ...asset.toObject(), issues, history, statusHistory, openIssueCount });
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(assetCreateSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const asset = await Asset.create({
      ...req.body,
      assetCode: await nextAssetCode(),
      status: req.body.status || "ACTIVE",
    });
    await AssetStatusHistory.create({
      assetId: asset._id,
      userId: req.user!._id,
      newStatus: asset.status,
      note: "Admin created",
    });
    await audit({
      userId: String(req.user!._id),
      action: "ASSET_CREATE",
      entity: "Asset",
      entityId: String(asset._id),
    });
    res.status(201).json(asset);
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const prev = await Asset.findById(req.params.id);
    if (!prev) throw new AppError(404, "Asset олдсонгүй");
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.body.status && req.body.status !== prev.status) {
      await AssetStatusHistory.create({
        assetId: asset!._id,
        userId: req.user!._id,
        oldStatus: prev.status,
        newStatus: req.body.status,
      });
      await audit({
        userId: String(req.user!._id),
        action: "ASSET_STATUS",
        entity: "Asset",
        entityId: String(asset!._id),
        metadata: { from: prev.status, to: req.body.status },
      });
    }
    res.json(asset);
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const asset = await Asset.findByIdAndUpdate(req.params.id, { status: "RETIRED" }, { new: true });
    if (!asset) throw new AppError(404, "Asset олдсонгүй");
    res.json(asset);
  })
);

export default router;
