import { Router } from "express";
import { paginationQuery } from "@bbe/validation";
import {
  Asset,
  AuditLog,
  Client,
  Installation,
  Issue,
  Order,
  RefreshToken,
  User,
} from "../models";
import { asyncHandler, AppError, paginate } from "../utils/http";
import { AuthRequest, requireAdmin, requireAuth, requireSuperAdmin } from "../middleware/auth";
import { hashPassword } from "../services/auth";
import { audit } from "../services/audit";

const router = Router();

router.get(
  "/dashboard",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 864e5);
    const [
      clients,
      assets,
      openIssues,
      criticalIssues,
      pendingOrders,
      upcomingInstallations,
      issueGroups,
      recentIssues,
      recentOrders,
      upcoming,
      expiringWarranty,
      expiringLicenses,
    ] = await Promise.all([
      Client.countDocuments({ active: true }),
      Asset.countDocuments({ status: { $nin: ["RETIRED"] } }),
      Issue.countDocuments({ status: { $nin: ["RESOLVED", "CLOSED"] } }),
      Issue.countDocuments({ priority: "CRITICAL", status: { $nin: ["RESOLVED", "CLOSED"] } }),
      Order.countDocuments({ status: { $in: ["PENDING", "CONFIRMED"] } }),
      Installation.countDocuments({
        status: { $in: ["SCHEDULED", "ON_THE_WAY"] },
        scheduledDate: { $gte: now },
      }),
      Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Issue.find().populate("assetId clientId").sort({ createdAt: -1 }).limit(8),
      Order.find().populate("clientId").sort({ createdAt: -1 }).limit(8),
      Installation.find({
        status: { $in: ["SCHEDULED", "ON_THE_WAY"] },
        scheduledDate: { $gte: now },
      })
        .populate("clientId assetId engineerId")
        .sort({ scheduledDate: 1 })
        .limit(8),
      Asset.find({
        warrantyEndDate: { $gte: now, $lte: in30 },
      })
        .populate("clientId")
        .limit(8),
      Asset.find({
        $or: [
          { licenseEndDate: { $gte: now, $lte: in30 } },
          { serviceEndDate: { $gte: now, $lte: in30 } },
        ],
      })
        .populate("clientId")
        .limit(8),
    ]);
    res.json({
      kpis: { clients, assets, openIssues, criticalIssues, pendingOrders, upcomingInstallations },
      issueGroups,
      recentIssues,
      recentOrders,
      upcoming,
      expiringWarranty,
      expiringLicenses,
    });
  })
);

router.get(
  "/clients",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const q = paginationQuery.parse(req.query);
    const filter: Record<string, unknown> = {};
    if (q.search) {
      filter.$or = [
        { companyName: new RegExp(q.search, "i") },
        { email: new RegExp(q.search, "i") },
        { registrationNumber: new RegExp(q.search, "i") },
      ];
    }
    const total = await Client.countDocuments(filter);
    const items = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    const ids = items.map((c) => c._id);
    const [assetCounts, issueCounts, orderCounts] = await Promise.all([
      Asset.aggregate([{ $match: { clientId: { $in: ids } } }, { $group: { _id: "$clientId", count: { $sum: 1 } } }]),
      Issue.aggregate([
        { $match: { clientId: { $in: ids }, status: { $nin: ["RESOLVED", "CLOSED"] } } },
        { $group: { _id: "$clientId", count: { $sum: 1 } } },
      ]),
      Order.aggregate([{ $match: { clientId: { $in: ids } } }, { $group: { _id: "$clientId", count: { $sum: 1 } } }]),
    ]);
    const a = new Map(assetCounts.map((x) => [String(x._id), x.count]));
    const i = new Map(issueCounts.map((x) => [String(x._id), x.count]));
    const o = new Map(orderCounts.map((x) => [String(x._id), x.count]));
    res.json({
      items: items.map((c) => ({
        ...c.toObject(),
        assetCount: a.get(String(c._id)) || 0,
        openIssueCount: i.get(String(c._id)) || 0,
        orderCount: o.get(String(c._id)) || 0,
      })),
      ...paginate(q.page, q.limit, total),
    });
  })
);

router.get(
  "/clients/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const client = await Client.findById(req.params.id);
    if (!client) throw new AppError(404, "Харилцагч олдсонгүй");
    const [assets, orders, issues, installations, users, history] = await Promise.all([
      Asset.find({ clientId: client._id }).sort({ createdAt: -1 }),
      Order.find({ clientId: client._id }).sort({ createdAt: -1 }),
      Issue.find({ clientId: client._id }).populate("assetId").sort({ createdAt: -1 }),
      Installation.find({ clientId: client._id }).populate("assetId engineerId").sort({ scheduledDate: -1 }),
      User.find({ clientId: client._id }).select("-passwordHash"),
      (await import("../models")).ServiceHistory.find({ clientId: client._id })
        .populate("assetId")
        .sort({ performedAt: -1 })
        .limit(50),
    ]);
    res.json({ client, assets, orders, issues, installations, users, history });
  })
);

router.get(
  "/users",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const q = paginationQuery.parse(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.role) filter.role = req.query.role;
    const total = await User.countDocuments(filter);
    const items = await User.find(filter)
      .select("-passwordHash")
      .populate("clientId")
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    res.json({ items, ...paginate(q.page, q.limit, total) });
  })
);

router.post(
  "/users",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      passwordHash: await hashPassword(req.body.password),
      role: req.body.role || "ADMIN",
      clientId: req.body.clientId,
    });
    await audit({
      userId: String(req.user!._id),
      action: "USER_CREATE",
      entity: "User",
      entityId: String(user._id),
    });
    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  })
);

router.patch(
  "/users/:id",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const update: Record<string, unknown> = { ...req.body };
    delete update.passwordHash;
    if (req.body.password) update.passwordHash = await hashPassword(req.body.password);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash");
    res.json(user);
  })
);

router.delete(
  "/users/:id",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    if (String(req.user!._id) === req.params.id) {
      throw new AppError(400, "Өөрийн бүртгэлийг устгах боломжгүй");
    }
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError(404, "Хэрэглэгч олдсонгүй");
    if (user.role === "SUPER_ADMIN") {
      const remaining = await User.countDocuments({ role: "SUPER_ADMIN", _id: { $ne: user._id } });
      if (remaining < 1) throw new AppError(400, "Сүүлчийн SUPER_ADMIN-ийг устгах боломжгүй");
    }
    await RefreshToken.deleteMany({ userId: user._id });
    await user.deleteOne();
    await audit({
      userId: String(req.user!._id),
      action: "USER_DELETE",
      entity: "User",
      entityId: String(user._id),
      metadata: { email: user.email, role: user.role },
    });
    res.json({ ok: true });
  })
);

router.get(
  "/audit-logs",
  requireAuth,
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const q = paginationQuery.parse(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.entity) filter.entity = req.query.entity;
    const total = await AuditLog.countDocuments(filter);
    const items = await AuditLog.find(filter)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    res.json({ items, ...paginate(q.page, q.limit, total) });
  })
);

router.get(
  "/engineers",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const items = await User.find({
      role: { $in: ["ADMIN", "SUPER_ADMIN", "ENGINEER", "SUPPORT"] },
      active: true,
    }).select("firstName lastName email avatar role");
    res.json({ items });
  })
);

export default router;
