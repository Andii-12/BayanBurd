import { Router } from "express";
import { Asset, Issue, Order, ServiceHistory } from "../models";
import { asyncHandler } from "../utils/http";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const clientId = req.user!.clientId;
    if (!clientId) return res.json({ kpis: {}, recentAssets: [], activity: [] });
    const [total, active, installPending, openIssues, recentAssets, recentIssues, recentOrders, history] =
      await Promise.all([
        Asset.countDocuments({ clientId }),
        Asset.countDocuments({ clientId, status: { $in: ["ACTIVE", "INSTALLED"] } }),
        Asset.countDocuments({
          clientId,
          status: { $in: ["INSTALLATION_PENDING", "INSTALLATION_SCHEDULED", "INSTALLING"] },
        }),
        Issue.countDocuments({ clientId, status: { $nin: ["RESOLVED", "CLOSED"] } }),
        Asset.find({ clientId }).sort({ updatedAt: -1 }).limit(6),
        Issue.find({ clientId }).populate("assetId").sort({ updatedAt: -1 }).limit(5),
        Order.find({ clientId }).sort({ createdAt: -1 }).limit(5),
        ServiceHistory.find({ clientId }).populate("assetId").sort({ performedAt: -1 }).limit(8),
      ]);
    res.json({
      kpis: { total, active, installPending, openIssues },
      recentAssets,
      recentIssues,
      recentOrders,
      history,
    });
  })
);

export default router;
