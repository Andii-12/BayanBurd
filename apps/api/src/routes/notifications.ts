import { Router } from "express";
import { Notification } from "../models";
import { asyncHandler } from "../utils/http";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const items = await Notification.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ userId: req.user!._id, read: false });
    res.json({ items, unread });
  })
);

router.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await Notification.updateOne({ _id: req.params.id, userId: req.user!._id }, { read: true });
    res.json({ ok: true });
  })
);

router.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    await Notification.updateMany({ userId: req.user!._id }, { read: true });
    res.json({ ok: true });
  })
);

export default router;
