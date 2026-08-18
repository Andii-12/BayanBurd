import { Router } from "express";
import { quotationSchema, paginationQuery } from "@bbe/validation";
import { Order, Product, Quotation } from "../models";
import { asyncHandler, AppError, paginate } from "../utils/http";
import { validate } from "../utils/validate";
import { AuthRequest, optionalAuth, requireAdmin, requireAuth } from "../middleware/auth";
import { nextOrderNumber, nextQuotationNumber } from "../services/counters";
import { audit } from "../services/audit";
import { notifyAdmins } from "../services/notify";

const router = Router();

router.post(
  "/",
  optionalAuth,
  validate(quotationSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const item = await Quotation.create({
      quotationNumber: await nextQuotationNumber(),
      clientId: req.user?.clientId,
      companyName: req.body.companyName,
      contactName: req.body.contactName,
      email: req.body.email,
      phone: req.body.phone,
      requirements: req.body.requirements,
      items: req.body.items,
      attachments: [],
      status: "NEW",
    });
    await notifyAdmins({
      type: "QUOTATION",
      title: `Үнийн санал ${item.quotationNumber}`,
      message: item.companyName,
      link: `/admin/quotations/${item._id}`,
    });
    res.status(201).json(item);
  })
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = paginationQuery.parse(req.query);
    const isAdmin = ["ADMIN", "SUPER_ADMIN", "SALES"].includes(req.user!.role);
    const filter: Record<string, unknown> = isAdmin ? {} : { clientId: req.user!.clientId };
    if (req.query.status) filter.status = req.query.status;
    const total = await Quotation.countDocuments(filter);
    const items = await Quotation.find(filter)
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
    const item = await Quotation.findById(req.params.id);
    if (!item) throw new AppError(404, "Үнийн санал олдсонгүй");
    res.json(item);
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const item = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw new AppError(404, "Үнийн санал олдсонгүй");
    res.json(item);
  })
);

router.post(
  "/:id/convert",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = await Quotation.findById(req.params.id);
    if (!q) throw new AppError(404, "Үнийн санал олдсонгүй");
    if (!q.clientId) throw new AppError(400, "Харилцагч холбоогүй тул захиалга болгох боломжгүй");
    const items = [];
    for (const it of q.items) {
      const product = it.productId ? await Product.findById(it.productId) : null;
      items.push({
        productId: product?._id || it.productId,
        name: it.name,
        sku: product?.sku || "QT",
        quantity: it.quantity,
        unitPrice: it.unitPrice || product?.price || 0,
        installation: false,
        quotationOnly: false,
      });
    }
    const total = items.reduce((s, i) => s + (i.unitPrice || 0) * i.quantity, 0);
    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      clientId: q.clientId,
      userId: req.user!._id,
      items,
      subtotal: total,
      total,
      status: "CONFIRMED",
      paymentMethod: "INVOICE",
      paymentStatus: "UNPAID",
      contactName: q.contactName,
      phone: q.phone,
      email: q.email,
      notes: `Converted from ${q.quotationNumber}`,
    });
    q.status = "CONVERTED_TO_ORDER";
    q.convertedOrderId = order._id;
    await q.save();
    await audit({
      userId: String(req.user!._id),
      action: "QUOTATION_CONVERT",
      entity: "Quotation",
      entityId: String(q._id),
      metadata: { orderId: String(order._id) },
    });
    res.json({ quotation: q, order });
  })
);

export default router;
