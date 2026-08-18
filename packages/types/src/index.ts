export type UserRole = "CLIENT" | "ADMIN" | "SUPER_ADMIN" | "ENGINEER" | "SALES" | "SUPPORT";

export type ProductType =
  | "HARDWARE"
  | "SOFTWARE"
  | "SYSTEM"
  | "SERVICE"
  | "LICENSE";

export type AssetType =
  | "HARDWARE"
  | "SOFTWARE"
  | "WEBSITE"
  | "SYSTEM"
  | "LICENSE"
  | "SERVICE";

export type AssetStatus =
  | "ORDERED"
  | "PREPARING"
  | "DELIVERY_PENDING"
  | "INSTALLATION_PENDING"
  | "INSTALLATION_SCHEDULED"
  | "INSTALLING"
  | "INSTALLED"
  | "ACTIVE"
  | "MAINTENANCE"
  | "HAS_ISSUE"
  | "SUSPENDED"
  | "EXPIRED"
  | "RETIRED";

export type IssueStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING_CLIENT"
  | "WAITING_PART"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY"
  | "DELIVERING"
  | "DELIVERED"
  | "INSTALLATION_PENDING"
  | "COMPLETED"
  | "CANCELLED";

export type InstallationStatus =
  | "SCHEDULED"
  | "ON_THE_WAY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "RESCHEDULED";

export type QuotationStatus =
  | "NEW"
  | "REVIEWING"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED_TO_ORDER";

export type CommentVisibility = "PUBLIC" | "INTERNAL";

export type DocumentType =
  | "MANUAL"
  | "WARRANTY"
  | "INVOICE"
  | "INSTALLATION_REPORT"
  | "CONTRACT"
  | "LICENSE"
  | "TECHNICAL_SPEC"
  | "SERVICE_REPORT"
  | "OTHER";

export type NotificationType =
  | "ISSUE_CREATED"
  | "ISSUE_COMMENTED"
  | "ISSUE_STATUS"
  | "ISSUE_ASSIGNED"
  | "ISSUE_RESOLVED"
  | "ORDER_CREATED"
  | "ORDER_STATUS"
  | "INSTALLATION_SCHEDULED"
  | "WARRANTY_EXPIRING"
  | "LICENSE_EXPIRING"
  | "QUOTATION"
  | "SYSTEM";

export type PaymentMethod = "BANK_TRANSFER" | "INVOICE" | "MANUAL";

export type PaymentStatus = "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "FAILED";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const ASSET_STATUS_MN: Record<AssetStatus, string> = {
  ORDERED: "Захиалсан",
  PREPARING: "Бэлтгэж байна",
  DELIVERY_PENDING: "Хүргэлт хүлээгдэж байна",
  INSTALLATION_PENDING: "Суурилуулалт хүлээгдэж байна",
  INSTALLATION_SCHEDULED: "Суурилуулалт товлогдсон",
  INSTALLING: "Суурилуулж байна",
  INSTALLED: "Суулгасан",
  ACTIVE: "Идэвхтэй",
  MAINTENANCE: "Засварт",
  HAS_ISSUE: "Асуудалтай",
  SUSPENDED: "Түр зогсоосон",
  EXPIRED: "Хугацаа дууссан",
  RETIRED: "Ашиглалтаас гарсан",
};

export const ASSET_TYPE_MN: Record<AssetType, string> = {
  HARDWARE: "Төхөөрөмж",
  SOFTWARE: "Программ",
  WEBSITE: "Веб сайт",
  SYSTEM: "Систем",
  LICENSE: "Лиценз",
  SERVICE: "Үйлчилгээ",
};

export const ISSUE_STATUS_MN: Record<IssueStatus, string> = {
  OPEN: "Нээлттэй",
  ASSIGNED: "Ажилтан хуваарилсан",
  IN_PROGRESS: "Шалгаж байна",
  WAITING_CLIENT: "Харилцагчаас мэдээлэл хүлээгдэж байна",
  WAITING_PART: "Сэлбэг хүлээгдэж байна",
  RESOLVED: "Шийдвэрлэсэн",
  CLOSED: "Хаасан",
  REOPENED: "Дахин нээсэн",
};

export const ISSUE_PRIORITY_MN: Record<IssuePriority, string> = {
  LOW: "Бага",
  MEDIUM: "Дунд",
  HIGH: "Өндөр",
  CRITICAL: "Ноцтой",
};

export const ORDER_STATUS_MN: Record<OrderStatus, string> = {
  PENDING: "Хүлээгдэж байна",
  CONFIRMED: "Баталгаажсан",
  PROCESSING: "Боловсруулж байна",
  READY: "Бэлэн",
  DELIVERING: "Хүргэж байна",
  DELIVERED: "Хүргэгдсэн",
  INSTALLATION_PENDING: "Суурилуулалт хүлээгдэж байна",
  COMPLETED: "Дууссан",
  CANCELLED: "Цуцлагдсан",
};

export const INSTALLATION_STATUS_MN: Record<InstallationStatus, string> = {
  SCHEDULED: "Товлогдсон",
  ON_THE_WAY: "Замд явж байна",
  IN_PROGRESS: "Хийгдэж байна",
  COMPLETED: "Дууссан",
  FAILED: "Амжилтгүй",
  RESCHEDULED: "Дахин товлогдсон",
};

export const QUOTATION_STATUS_MN: Record<QuotationStatus, string> = {
  NEW: "Шинэ",
  REVIEWING: "Хянаж байна",
  SENT: "Илгээсэн",
  APPROVED: "Зөвшөөрсөн",
  REJECTED: "Татгалзсан",
  EXPIRED: "Хугацаа дууссан",
  CONVERTED_TO_ORDER: "Захиалга болгосон",
};

export const PRODUCT_TYPE_MN: Record<ProductType, string> = {
  HARDWARE: "Тоног төхөөрөмж",
  SOFTWARE: "Программ",
  SYSTEM: "Систем",
  SERVICE: "Үйлчилгээ",
  LICENSE: "Лиценз",
};

export const ISSUE_CATEGORIES: Record<AssetType, string[]> = {
  HARDWARE: [
    "Hardware",
    "Power",
    "Network",
    "Display",
    "Printer",
    "Storage",
    "Peripheral",
    "Other",
  ],
  SOFTWARE: [
    "Bug",
    "Login",
    "Performance",
    "Database",
    "API",
    "UI",
    "Permission",
    "Backup",
    "Security",
    "Integration",
    "Other",
  ],
  WEBSITE: [
    "Website Down",
    "UI",
    "Content",
    "Login",
    "API",
    "Hosting",
    "SSL",
    "Domain",
    "Performance",
    "Bug",
    "Other",
  ],
  SYSTEM: [
    "System Error",
    "User Permission",
    "Database",
    "Integration",
    "API",
    "Performance",
    "Report",
    "Backup",
    "Workflow",
    "Other",
  ],
  LICENSE: ["Activation", "User Limit", "Renewal", "Permission", "Other"],
  SERVICE: ["Quality", "Schedule", "Scope", "Billing", "Other"],
};
