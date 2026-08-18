import { Router } from "express";
import { Asset, Client, Issue, Order, Product } from "../models";
import { asyncHandler } from "../utils/http";
import { AuthRequest, optionalAuth } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ products: [], assets: [], issues: [], orders: [], clients: [] });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const products = await Product.find({
      active: true,
      archived: { $ne: true },
      $or: [{ name: rx }, { sku: rx }, { shortDescription: rx }],
    })
      .limit(8)
      .select("name slug sku productType images price quotationOnly");

    const user = req.user;
    if (!user) return res.json({ products, assets: [], issues: [], orders: [], clients: [] });

    const isAdmin = ["ADMIN", "SUPER_ADMIN", "ENGINEER", "SUPPORT", "SALES"].includes(user.role);
    const clientFilter = isAdmin ? {} : { clientId: user.clientId };

    const [assets, issues, orders, clients] = await Promise.all([
      Asset.find({
        ...clientFilter,
        $or: [{ name: rx }, { assetCode: rx }, { serialNumber: rx }, { model: rx }],
      })
        .limit(8)
        .populate("clientId", "companyName")
        .select("name assetCode type serialNumber status clientId"),
      Issue.find({
        ...clientFilter,
        $or: [{ title: rx }, { issueNumber: rx }],
      })
        .limit(8)
        .select("title issueNumber status priority"),
      Order.find({
        ...clientFilter,
        orderNumber: rx,
      })
        .limit(6)
        .select("orderNumber status total createdAt"),
      isAdmin
        ? Client.find({ $or: [{ companyName: rx }, { email: rx }, { registrationNumber: rx }] })
            .limit(6)
            .select("companyName email phone")
        : Promise.resolve([]),
    ]);

    res.json({ products, assets, issues, orders, clients });
  })
);

export default router;
