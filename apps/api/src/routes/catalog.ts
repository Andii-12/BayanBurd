import { Router } from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import { productSchema, paginationQuery } from "@bbe/validation";
import { Brand, Category, Product } from "../models";
import { asyncHandler, AppError, paginate } from "../utils/http";
import { validate } from "../utils/validate";
import { requireAdmin, requireAuth, optionalAuth, AuthRequest } from "../middleware/auth";
import { audit } from "../services/audit";
import { uploadImages } from "../middleware/upload";
import { saveFile } from "../services/storage";

const router = Router();

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const items = await Category.find({ active: true }).sort({ name: 1 });
    res.json({ items });
  })
);

router.post(
  "/categories",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = slugify(req.body.slug || req.body.name, { lower: true, strict: true });
    const item = await Category.create({ ...req.body, slug });
    res.status(201).json(item);
  })
);

router.get(
  "/brands",
  asyncHandler(async (_req, res) => {
    const items = await Brand.find({ active: true }).sort({ name: 1 });
    res.json({ items });
  })
);

router.post(
  "/brands",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const slug = slugify(req.body.slug || req.body.name, { lower: true, strict: true });
    const item = await Brand.create({ ...req.body, slug });
    res.status(201).json(item);
  })
);

router.get(
  "/products",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = paginationQuery.parse(req.query);
    const filter: Record<string, unknown> = { archived: { $ne: true } };
    const isAdmin = req.user && ["ADMIN", "SUPER_ADMIN", "SALES"].includes(req.user.role);
    if (!isAdmin) filter.active = true;
    if (req.query.productType) filter.productType = req.query.productType;
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    if (req.query.brandId) filter.brandId = req.query.brandId;
    if (req.query.inStock === "true") filter.stock = { $gt: 0 };
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {
        ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
        ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {}),
      };
    }
    if (q.search) {
      filter.$or = [
        { name: new RegExp(q.search, "i") },
        { sku: new RegExp(q.search, "i") },
        { shortDescription: new RegExp(q.search, "i") },
      ];
    }
    const total = await Product.countDocuments(filter);
    const items = await Product.find(filter)
      .populate("categoryId brandId")
      .sort(q.sort === "price" ? { price: 1 } : { createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit);
    res.json({ items, ...paginate(q.page, q.limit, total) });
  })
);

router.get(
  "/products/:slug",
  asyncHandler(async (req, res) => {
    const or: Record<string, unknown>[] = [{ slug: req.params.slug }];
    if (mongoose.isValidObjectId(req.params.slug)) or.push({ _id: req.params.slug });
    const item = await Product.findOne({ $or: or, archived: { $ne: true } }).populate("categoryId brandId");
    if (!item) throw new AppError(404, "Бүтээгдэхүүн олдсонгүй");
    res.json(item);
  })
);

router.post(
  "/products",
  requireAuth,
  requireAdmin,
  validate(productSchema),
  asyncHandler(async (req, res) => {
    const slug =
      req.body.slug ||
      slugify(req.body.name, { lower: true, strict: true }) + "-" + Date.now().toString(36);
    const item = await Product.create({ ...req.body, slug });
    await audit({
      userId: String((req as any).user._id),
      action: "PRODUCT_CREATE",
      entity: "Product",
      entityId: String(item._id),
    });
    res.status(201).json(item);
  })
);

router.patch(
  "/products/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw new AppError(404, "Бүтээгдэхүүн олдсонгүй");
    await audit({
      userId: String((req as any).user._id),
      action: "PRODUCT_UPDATE",
      entity: "Product",
      entityId: String(item._id),
    });
    res.json(item);
  })
);

router.delete(
  "/products/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await Product.findByIdAndUpdate(req.params.id, { archived: true, active: false }, { new: true });
    if (!item) throw new AppError(404, "Бүтээгдэхүүн олдсонгүй");
    await audit({
      userId: String((req as any).user._id),
      action: "PRODUCT_DELETE",
      entity: "Product",
      entityId: String(item._id),
    });
    res.json({ ok: true });
  })
);

router.post(
  "/products/:id/images",
  requireAuth,
  requireAdmin,
  uploadImages.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "files", maxCount: 8 },
  ]),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError(404, "Бүтээгдэхүүн олдсонгүй");
    const grouped = (req.files as { thumbnail?: Express.Multer.File[]; files?: Express.Multer.File[] }) || {};
    const thumb = grouped.thumbnail?.[0];
    const gallery = grouped.files || [];
    if (thumb) {
      const saved = await saveFile(thumb, "products");
      product.thumbnail = saved.url;
    }
    if (gallery.length) {
      const saved = await Promise.all(gallery.map((f) => saveFile(f, "products")));
      product.images.push(...saved.map((s) => s.url));
    }
    await product.save();
    res.json(product);
  })
);

export default router;
