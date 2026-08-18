import { Router } from "express";
import { installationCreateSchema, installationCompleteSchema, paginationQuery } from "@bbe/validation";
import { Asset, AssetStatusHistory, Installation, ServiceHistory } from "../models";
import { asyncHandler, AppError, paginate } from "../utils/http";
import { validate } from "../utils/validate";
import { AuthRequest, requireAdmin, requireAuth } from "../middleware/auth";
import { audit } from "../services/audit";
import { notifyClientUsers } from "../services/notify";
import { emailTemplates } from "../services/email";
import { nextAssetCode } from "../services/counters";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = paginationQuery.parse(req.query);
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "ENGINEER"].includes(req.user!.role);
    const filter: Record<string, unknown> = isAdmin ? {} : { clientId: req.user!.clientId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.clientId && isAdmin) filter.clientId = req.query.clientId;
    const total = await Installation.countDocuments(filter);
    const items = await Installation.find(filter)
      .populate("clientId assetId orderId engineerId")
      .sort({ scheduledDate: 1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    res.json({ items, ...paginate(q.page, q.limit, total) });
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(installationCreateSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const item = await Installation.create({
      ...req.body,
      scheduledDate: new Date(req.body.scheduledDate),
      status: "SCHEDULED",
    });
    if (req.body.assetId) {
      await Asset.findByIdAndUpdate(req.body.assetId, { status: "INSTALLATION_SCHEDULED" });
    }
    const t = emailTemplates.installationScheduled(req.body.scheduledDate);
    await notifyClientUsers(req.body.clientId, {
      type: "INSTALLATION_SCHEDULED",
      title: "Суурилуулалт товлогдлоо",
      message: `${req.body.scheduledDate} ${req.body.scheduledTime || ""}`.trim(),
      link: `/dashboard/installations`,
      email: { to: req.user!.email, subject: t.subject, html: t.html },
    });
    res.status(201).json(item);
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const item = await Installation.findById(req.params.id);
    if (!item) throw new AppError(404, "Суурилуулалт олдсонгүй");
    item.status = req.body.status;
    await item.save();
    if (item.assetId && req.body.status === "IN_PROGRESS") {
      await Asset.findByIdAndUpdate(item.assetId, { status: "INSTALLING" });
    }
    res.json(item);
  })
);

router.post(
  "/:id/complete",
  requireAuth,
  requireAdmin,
  validate(installationCompleteSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const item = await Installation.findById(req.params.id);
    if (!item) throw new AppError(404, "Суурилуулалт олдсонгүй");
    const body = req.body;
    item.status = "COMPLETED";
    item.completedAt = new Date();
    item.completionData = body;
    await item.save();

    let asset = item.assetId ? await Asset.findById(item.assetId) : null;
    const installDate = body.installationDate ? new Date(body.installationDate) : new Date();
    const warrantyMonths = body.warrantyMonths ?? 12;
    const supportMonths = body.supportMonths ?? 12;
    const warrantyEnd = new Date(installDate);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);
    const supportEnd = new Date(installDate);
    supportEnd.setMonth(supportEnd.getMonth() + supportMonths);

    if (!asset) {
      asset = await Asset.create({
        assetCode: await nextAssetCode(),
        clientId: item.clientId,
        orderId: item.orderId,
        name: item.installationType,
        type: body.version || body.url ? "SOFTWARE" : "HARDWARE",
        status: "INSTALLED",
      });
      item.assetId = asset._id;
      await item.save();
    }

    asset.status = "ACTIVE";
    asset.installationDate = installDate;
    asset.location = body.location || asset.location;
    asset.serialNumber = body.serialNumber || asset.serialNumber;
    asset.model = body.model || asset.model;
    asset.version = body.version || asset.version;
    asset.systemUrl = body.url || asset.systemUrl;
    asset.websiteUrl = body.url || asset.websiteUrl;
    asset.environment = body.environment || asset.environment;
    asset.warrantyStartDate = installDate;
    asset.warrantyEndDate = warrantyEnd;
    asset.serviceStartDate = installDate;
    asset.serviceEndDate = supportEnd;
    await asset.save();

    await AssetStatusHistory.create({
      assetId: asset._id,
      userId: req.user!._id,
      oldStatus: "INSTALLING",
      newStatus: "ACTIVE",
      note: "Installation completed",
    });
    await ServiceHistory.create({
      assetId: asset._id,
      clientId: item.clientId,
      title: "Төхөөрөмж / систем суурилуулсан",
      actionTaken: body.notes,
      engineerId: body.engineerId || req.user!._id,
      performedAt: installDate,
    });
    await audit({
      userId: String(req.user!._id),
      action: "INSTALLATION_COMPLETE",
      entity: "Installation",
      entityId: String(item._id),
      metadata: { assetId: String(asset._id) },
    });
    res.json({ installation: item, asset });
  })
);

export default router;
