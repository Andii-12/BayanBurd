import { z } from "zod";

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
});

export const registerSchema = z.object({
  companyName: z.string().min(2).max(160),
  registrationNumber: z.string().min(2).max(40),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(6).max(30),
  password: z.string().min(8).max(128),
  address: z.string().max(300).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(220).optional(),
  sku: z.string().min(1).max(80),
  productType: z.enum(["HARDWARE", "SOFTWARE", "SYSTEM", "SERVICE", "LICENSE"]),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(400).optional(),
  price: z.number().min(0).optional(),
  quotationOnly: z.boolean().optional(),
  stock: z.number().int().min(0).optional(),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  installationAvailable: z.boolean().optional(),
  warrantyMonths: z.number().int().min(0).optional(),
  supportMonths: z.number().int().min(0).optional(),
  developmentTime: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  includedFeatures: z.array(z.string()).optional(),
  hostingOptional: z.boolean().optional(),
  domainOptional: z.boolean().optional(),
  maintenanceOptional: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const issueCreateSchema = z.object({
  assetId: z.string().min(1),
  title: z.string().min(4).max(240),
  description: z.string().min(4),
  category: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});

export const issueCommentSchema = z.object({
  body: z.string().min(1),
  visibility: z.enum(["PUBLIC", "INTERNAL"]).optional(),
});

export const issueStatusSchema = z.object({
  status: z.enum([
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_CLIENT",
    "WAITING_PART",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
  ]),
});

export const issuePrioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

export const issueAssignSchema = z.object({
  assignedAdminId: z.string().min(1),
});

export const issueResolveSchema = z.object({
  resolution: z.string().optional(),
  createServiceHistory: z.boolean().optional(),
  cause: z.string().optional(),
  actionTaken: z.string().optional(),
  partsReplaced: z.string().optional(),
  notes: z.string().optional(),
});

export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        installation: z.boolean().optional(),
      })
    )
    .min(1),
  contactName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  billingAddress: z.string().optional(),
  deliveryLocation: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["BANK_TRANSFER", "INVOICE", "MANUAL"]).default("INVOICE"),
});

export const quotationSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  requirements: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const assetCreateSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["HARDWARE", "SOFTWARE", "WEBSITE", "SYSTEM", "LICENSE", "SERVICE"]),
  category: z.string().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  version: z.string().optional(),
  websiteUrl: z.string().optional(),
  systemUrl: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  assignedContact: z.string().optional(),
  description: z.string().optional(),
  warrantyMonths: z.number().int().optional(),
  supportMonths: z.number().int().optional(),
});

export const installationCreateSchema = z.object({
  clientId: z.string().min(1),
  orderId: z.string().optional(),
  assetId: z.string().optional(),
  installationType: z.string().min(1),
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().optional(),
  location: z.string().min(1),
  engineerId: z.string().optional(),
  notes: z.string().optional(),
});

export const installationCompleteSchema = z.object({
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  location: z.string().optional(),
  installationDate: z.string().optional(),
  warrantyMonths: z.number().int().optional(),
  version: z.string().optional(),
  url: z.string().optional(),
  environment: z.string().optional(),
  supportMonths: z.number().int().optional(),
  engineerId: z.string().optional(),
  notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type IssueCreateInput = z.infer<typeof issueCreateSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;
