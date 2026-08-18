import { Router } from "express";
import { Notification } from "../models";
import { asyncHandler, AppError } from "../utils/http";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!._id;
    const items = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ userId, read: { $ne: true } });
    res.json({ items, unread });
  })
);

router.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await Notification.updateMany(
      { userId: req.user!._id, read: { $ne: true } },
      { $set: { read: true } }
    );
    res.json({ ok: true, updated: result.modifiedCount });
  })
);

router.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await Notification.updateOne(
      { _id: req.params.id, userId: req.user!._id },
      { $set: { read: true } }
    );
    if (!result.matchedCount) throw new AppError(404, "Мэдэгдэл олдсонгүй");
    res.json({ ok: true });
  })
);

export default router;
