import { Router } from "express";
import { orderCreateSchema, paginationQuery } from "@bbe/validation";
import { Order, Product, Asset, ServiceHistory } from "../models";
import { asyncHandler, AppError, paginate } from "../utils/http";
import { validate } from "../utils/validate";
import { AuthRequest, requireAdmin, requireAuth } from "../middleware/auth";
import { nextOrderNumber, nextAssetCode } from "../services/counters";
import { audit } from "../services/audit";
import { notifyAdmins, notifyClientUsers } from "../services/notify";
import { emailTemplates } from "../services/email";
import { AssetStatusHistory } from "../models";
import type { ProductType, AssetType, OrderStatus } from "@bbe/types";

const router = Router();

function toAssetType(t: ProductType): AssetType {
  if (t === "HARDWARE") return "HARDWARE";
  if (t === "LICENSE") return "LICENSE";
  if (t === "SERVICE") return "SERVICE";
  if (t === "SYSTEM") return "SYSTEM";
  return "SOFTWARE";
}

router.post(
  "/",
  requireAuth,
  validate(orderCreateSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user?.clientId) throw new AppError(400, "Харилцагчийн бүртгэл шаардлагатай");
    const products = await Product.find({ _id: { $in: req.body.items.map((i: any) => i.productId) } });
    const map = new Map(products.map((p) => [String(p._id), p]));
    const items = req.body.items.map((i: any) => {
      const p = map.get(i.productId);
      if (!p) throw new AppError(400, "Бүтээгдэхүүн олдсонгүй");
      return {
        productId: p._id,
        name: p.name,
        sku: p.sku,
        quantity: i.quantity,
        unitPrice: p.quotationOnly ? 0 : p.price || 0,
        installation: Boolean(i.installation),
        quotationOnly: p.quotationOnly,
      };
    });
    const subtotal = items.reduce((s: number, i: any) => s + i.unitPrice * i.quantity, 0);
    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      clientId: req.user.clientId,
      userId: req.user._id,
      items,
      subtotal,
      total: subtotal,
      status: "PENDING",
      paymentMethod: req.body.paymentMethod,
      paymentStatus: "UNPAID",
      contactName: req.body.contactName,
      phone: req.body.phone,
      email: req.body.email,
      billingAddress: req.body.billingAddress,
      deliveryLocation: req.body.deliveryLocation,
      notes: req.body.notes,
    });
    const t = emailTemplates.orderCreated(order.orderNumber);
    await notifyClientUsers(String(req.user.clientId), {
      type: "ORDER_CREATED",
      title: `Захиалга ${order.orderNumber}`,
      message: "Таны захиалга амжилттай бүртгэгдлээ.",
      link: `/dashboard/orders/${order._id}`,
      email: { to: req.body.email, subject: t.subject, html: t.html },
    });
    await notifyAdmins({
      type: "ORDER_CREATED",
      title: `Шинэ захиалга ${order.orderNumber}`,
      message: `${req.body.contactName} захиалга үүсгэлээ.`,
      link: `/admin/orders/${order._id}`,
    });
    res.status(201).json(order);
  })
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = paginationQuery.parse(req.query);
    const filter: Record<string, unknown> = {};
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "SALES"].includes(req.user!.role);
    if (!isAdmin) filter.clientId = req.user!.clientId;
    else if (req.query.clientId) filter.clientId = req.query.clientId;
    if (req.query.status) filter.status = req.query.status;
    if (q.search) filter.orderNumber = new RegExp(q.search, "i");
    const total = await Order.countDocuments(filter);
    const items = await Order.find(filter)
      .populate("clientId")
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    res.json({ items, ...paginate(q.page, q.limit, total) });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await Order.findById(req.params.id).populate("clientId items.productId");
    if (!order) throw new AppError(404, "Захиалга олдсонгүй");
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "SALES"].includes(req.user!.role);
    if (!isAdmin && String(order.clientId) !== String(req.user!.clientId)) {
      throw new AppError(403, "Хандах эрхгүй");
    }
    res.json(order);
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError(404, "Захиалга олдсонгүй");
    const prev = order.status;
    order.status = req.body.status as OrderStatus;
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
    await order.save();
    await audit({
      userId: String(req.user!._id),
      action: "ORDER_STATUS",
      entity: "Order",
      entityId: String(order._id),
      metadata: { from: prev, to: order.status },
    });

    if (["DELIVERED", "INSTALLATION_PENDING", "COMPLETED"].includes(order.status)) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        const existing = await Asset.findOne({ orderId: order._id, productId: product._id });
        if (existing) continue;
        for (let i = 0; i < item.quantity; i++) {
          const asset = await Asset.create({
            assetCode: await nextAssetCode(),
            clientId: order.clientId,
            orderId: order._id,
            name: product.name,
            type: toAssetType(product.productType),
            productId: product._id,
            manufacturer: undefined,
            status: item.installation || product.installationAvailable ? "INSTALLATION_PENDING" : "ACTIVE",
            warrantyMonths: product.warrantyMonths,
            image: product.images[0],
          });
          await AssetStatusHistory.create({
            assetId: asset._id,
            userId: req.user!._id,
            newStatus: asset.status,
            note: `Order ${order.orderNumber}`,
          });
          await ServiceHistory.create({
            assetId: asset._id,
            clientId: order.clientId,
            title: "Захиалга хүргэгдсэн / бүртгэгдсэн",
            performedAt: new Date(),
          });
        }
      }
    }

    await notifyClientUsers(String(order.clientId), {
      type: "ORDER_STATUS",
      title: `Захиалга ${order.orderNumber}`,
      message: `Төлөв шинэчлэгдлээ: ${order.status}`,
      link: `/dashboard/orders/${order._id}`,
    });
    res.json(order);
  })
);

export default router;
