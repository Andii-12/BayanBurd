import bcrypt from "bcryptjs";
import { connectDb } from "../config/db";
import {
  Asset,
  AssetStatusHistory,
  Brand,
  Category,
  Client,
  Counter,
  DocumentFile,
  Installation,
  Issue,
  IssueActivity,
  IssueComment,
  Notification,
  Order,
  Product,
  Quotation,
  ServiceHistory,
  User,
} from "../models";

async function main() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Client.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Asset.deleteMany({}),
    Issue.deleteMany({}),
    IssueComment.deleteMany({}),
    IssueActivity.deleteMany({}),
    Installation.deleteMany({}),
    ServiceHistory.deleteMany({}),
    Quotation.deleteMany({}),
    Notification.deleteMany({}),
    DocumentFile.deleteMany({}),
    AssetStatusHistory.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("DevPass123!", 12);

  const abc = await Client.create({
    companyName: "ABC ХХК",
    registrationNumber: "5012345",
    address: "Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо",
    contactName: "Бат-Эрдэнэ Ганболд",
    email: "client@example.mn",
    phone: "99112233",
  });
  const munkh = await Client.create({
    companyName: "Мөнх Технологи ХХК",
    registrationNumber: "5098765",
    address: "Улаанбаатар, Баянзүрх",
    contactName: "Мөнхзул Очир",
    email: "munkh@example.mn",
    phone: "88112233",
  });
  const tenger = await Client.create({
    companyName: "Тэнгэр Трейд ХХК",
    registrationNumber: "5077777",
    address: "Дархан",
    contactName: "Тэмүүлэн Дорж",
    email: "tenger@example.mn",
    phone: "99001122",
  });

  const admin = await User.create({
    firstName: "Админ",
    lastName: "Eternity",
    email: "admin@eternity.mn",
    phone: "77001122",
    passwordHash,
    role: "SUPER_ADMIN",
  });
  const engineer = await User.create({
    firstName: "Бат-Эрдэнэ",
    lastName: "Инженер",
    email: "engineer@eternity.mn",
    phone: "88001122",
    passwordHash,
    role: "ENGINEER",
  });
  const clientUser = await User.create({
    firstName: "Бат-Эрдэнэ",
    lastName: "Ганболд",
    email: "client@example.mn",
    phone: "99112233",
    passwordHash,
    role: "CLIENT",
    clientId: abc._id,
  });
  await User.create({
    firstName: "Мөнхзул",
    lastName: "Очир",
    email: "munkh@example.mn",
    phone: "88112233",
    passwordHash,
    role: "CLIENT",
    clientId: munkh._id,
  });

  const cats = await Category.insertMany([
    { name: "Компьютер", slug: "computer", productType: "HARDWARE" },
    { name: "Сервер", slug: "server", productType: "HARDWARE" },
    { name: "Сүлжээ", slug: "network", productType: "HARDWARE" },
    { name: "Принтер", slug: "printer", productType: "HARDWARE" },
    { name: "Камер / NVR", slug: "camera", productType: "HARDWARE" },
    { name: "UPS / Rack", slug: "power", productType: "HARDWARE" },
    { name: "Веб систем", slug: "website", productType: "SOFTWARE" },
    { name: "ERP / CRM", slug: "erp", productType: "SYSTEM" },
    { name: "Лиценз", slug: "license", productType: "LICENSE" },
    { name: "Үйлчилгээ", slug: "service", productType: "SERVICE" },
  ]);
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!;

  const brands = await Brand.insertMany([
    { name: "Dell", slug: "dell" },
    { name: "HPE", slug: "hpe" },
    { name: "Cisco", slug: "cisco" },
    { name: "HP", slug: "hp" },
    { name: "Synology", slug: "synology" },
    { name: "MikroTik", slug: "mikrotik" },
    { name: "Microsoft", slug: "microsoft" },
    { name: "Bayan Burd Eternity", slug: "bbe" },
  ]);
  const brand = (slug: string) => brands.find((b) => b.slug === slug)!;

  const products = await Product.insertMany([
    {
      name: "Dell OptiPlex 7020 SFF",
      slug: "dell-optiplex-7020-sff",
      sku: "DELL-7020-SFF",
      productType: "HARDWARE",
      categoryId: cat("computer")._id,
      brandId: brand("dell")._id,
      shortDescription: "Оффисын найдвартай desktop компьютер.",
      description:
        "Intel Core процессор, 16GB RAM, 512GB SSD бүхий оффисын компьютер. Суурилуулалт болон 12 сарын баталгаатай.",
      price: 1890000,
      stock: 14,
      installationAvailable: true,
      warrantyMonths: 12,
      specifications: { CPU: "Intel Core i5", RAM: "16GB", Storage: "512GB SSD", Form: "SFF" },
      images: [],
      active: true,
    },
    {
      name: "HPE ProLiant DL380 Gen10",
      slug: "hpe-proliant-dl380-gen10",
      sku: "HPE-DL380-G10",
      productType: "HARDWARE",
      categoryId: cat("server")._id,
      brandId: brand("hpe")._id,
      shortDescription: "Дата төвийн 2U rack сервер.",
      description: "Enterprise сервер. Үнийн санал авах боломжтой.",
      quotationOnly: true,
      stock: 3,
      installationAvailable: true,
      warrantyMonths: 36,
      specifications: { Form: "2U", CPU: "2x Xeon", RAM: "64GB+", RAID: "P408i" },
      images: [],
      active: true,
    },
    {
      name: "Cisco Catalyst 2960X-48TD-L",
      slug: "cisco-catalyst-2960x-48td-l",
      sku: "CISCO-2960X-48",
      productType: "HARDWARE",
      categoryId: cat("network")._id,
      brandId: brand("cisco")._id,
      shortDescription: "48 порт Gigabit switch.",
      price: 4200000,
      stock: 6,
      installationAvailable: true,
      warrantyMonths: 12,
      specifications: { Ports: "48x 1G", Uplink: "2x 10G SFP+" },
      images: [],
      active: true,
    },
    {
      name: "HP LaserJet Pro M404dn",
      slug: "hp-laserjet-pro-m404dn",
      sku: "HP-M404DN",
      productType: "HARDWARE",
      categoryId: cat("printer")._id,
      brandId: brand("hp")._id,
      shortDescription: "Монгол оффисын лазер принтер.",
      price: 890000,
      stock: 20,
      installationAvailable: true,
      warrantyMonths: 12,
      specifications: { Type: "Mono Laser", Duplex: "Yes", Network: "Yes" },
      images: [],
      active: true,
    },
    {
      name: "Synology DS920+",
      slug: "synology-ds920-plus",
      sku: "SYN-DS920P",
      productType: "HARDWARE",
      categoryId: cat("server")._id,
      brandId: brand("synology")._id,
      shortDescription: "4-bay NAS хадгалалтын төхөөрөмж.",
      price: 2450000,
      stock: 5,
      installationAvailable: true,
      warrantyMonths: 24,
      specifications: { Bays: "4", CPU: "Intel Celeron J4125" },
      images: [],
      active: true,
    },
    {
      name: "MikroTik hAP ac³",
      slug: "mikrotik-hap-ac3",
      sku: "MT-HAP-AC3",
      productType: "HARDWARE",
      categoryId: cat("network")._id,
      brandId: brand("mikrotik")._id,
      shortDescription: "Оффисын Wi-Fi access point / router.",
      price: 320000,
      stock: 30,
      installationAvailable: true,
      warrantyMonths: 12,
      specifications: { WiFi: "ac dual-band", Ports: "5x Gigabit" },
      images: [],
      active: true,
    },
    {
      name: "Microsoft 365 Business Standard",
      slug: "microsoft-365-business-standard",
      sku: "MS-365-STD",
      productType: "LICENSE",
      categoryId: cat("license")._id,
      brandId: brand("microsoft")._id,
      shortDescription: "Бизнесийн имэйл, Office, Teams лиценз.",
      price: 185000,
      stock: 999,
      supportMonths: 12,
      warrantyMonths: 0,
      specifications: { Term: "1 year / user", Apps: "Word, Excel, Outlook, Teams" },
      images: [],
      active: true,
    },
    {
      name: "Inventory Management System",
      slug: "inventory-management-system",
      sku: "BBE-INV-SYS",
      productType: "SYSTEM",
      categoryId: cat("erp")._id,
      brandId: brand("bbe")._id,
      shortDescription: "Агуулах, борлуулалтын нэгдсэн систем.",
      quotationOnly: true,
      stock: 99,
      installationAvailable: true,
      supportMonths: 12,
      developmentTime: "30–60 хоног",
      technologies: ["Next.js", "Node.js", "MongoDB"],
      includedFeatures: ["Бараа бүртгэл", "Захиалга", "Тайлан", "Эрхийн удирдлага"],
      description: "Компанийн агуулах, борлуулалт, тайланг нэгтгэсэн custom систем.",
      images: [],
      active: true,
    },
    {
      name: "Корпорэйт веб сайт",
      slug: "corporate-website",
      sku: "BBE-WEB-CORP",
      productType: "SOFTWARE",
      categoryId: cat("website")._id,
      brandId: brand("bbe")._id,
      shortDescription: "Байгууллагын веб сайт, CMS, суурилуулалт.",
      quotationOnly: true,
      stock: 99,
      supportMonths: 12,
      developmentTime: "14–30 хоног",
      technologies: ["Next.js", "Tailwind CSS", "Cloudflare"],
      includedFeatures: ["Нүүр", "Бүтээгдэхүүн", "Мэдээ", "Холбоо барих", "CMS"],
      hostingOptional: true,
      domainOptional: true,
      maintenanceOptional: true,
      description: "Корпорэйт веб сайт — дизайн, хөгжүүлэлт, байршуулалт, 12 сарын дэмжлэг.",
      images: [],
      active: true,
    },
    {
      name: "Attendance Management System",
      slug: "attendance-management-system",
      sku: "BBE-ATT",
      productType: "SYSTEM",
      categoryId: cat("erp")._id,
      brandId: brand("bbe")._id,
      shortDescription: "Ирц, хандалтын бүртгэлийн систем.",
      quotationOnly: true,
      stock: 99,
      supportMonths: 12,
      developmentTime: "21–45 хоног",
      technologies: ["React", "Express", "PostgreSQL"],
      includedFeatures: ["Ирц", "Тайлан", "Төхөөрөмж холболт"],
      images: [],
      active: true,
    },
    {
      name: "Monitoring Dashboard",
      slug: "monitoring-dashboard",
      sku: "BBE-MON",
      productType: "SOFTWARE",
      categoryId: cat("website")._id,
      brandId: brand("bbe")._id,
      shortDescription: "Сервер, сүлжээ, системийн хяналтын самбар.",
      quotationOnly: true,
      stock: 99,
      supportMonths: 12,
      developmentTime: "14–30 хоног",
      technologies: ["Grafana", "Prometheus", "Node.js"],
      includedFeatures: ["Alert", "Uptime", "Resource charts"],
      images: [],
      active: true,
    },
  ]);
  const p = (sku: string) => products.find((x) => x.sku === sku)!;

  const order = await Order.create({
    orderNumber: "ORD-1004",
    clientId: abc._id,
    userId: clientUser._id,
    items: [
      {
        productId: p("DELL-7020-SFF")._id,
        name: p("DELL-7020-SFF").name,
        sku: "DELL-7020-SFF",
        quantity: 4,
        unitPrice: 1890000,
        installation: true,
        quotationOnly: false,
      },
    ],
    subtotal: 7560000,
    total: 7560000,
    status: "COMPLETED",
    paymentMethod: "INVOICE",
    paymentStatus: "PAID",
    contactName: "Бат-Эрдэнэ Ганболд",
    phone: "99112233",
    email: "client@example.mn",
    deliveryLocation: "Head Office",
  });

  await Counter.insertMany([
    { key: "issue", seq: 107 },
    { key: "order", seq: 1004 },
    { key: "asset", seq: 24 },
    { key: "quotation", seq: 12 },
  ]);

  const optiplex = await Asset.create({
    assetCode: "AST-000018",
    clientId: abc._id,
    orderId: order._id,
    productId: p("DELL-7020-SFF")._id,
    name: "Dell OptiPlex 7020 SFF",
    type: "HARDWARE",
    category: "Компьютер",
    manufacturer: "Dell",
    model: "OptiPlex 7020 SFF",
    serialNumber: "8YF2H93",
    installationDate: new Date("2026-08-15"),
    warrantyStartDate: new Date("2026-08-15"),
    warrantyEndDate: new Date("2027-08-15"),
    location: "Head Office",
    department: "Finance Department",
    status: "INSTALLED",
  });
  const dl380 = await Asset.create({
    assetCode: "AST-000019",
    clientId: abc._id,
    productId: p("HPE-DL380-G10")._id,
    name: "HPE ProLiant DL380 Gen10",
    type: "HARDWARE",
    category: "Сервер",
    manufacturer: "HPE",
    model: "DL380 Gen10",
    serialNumber: "CZJ2340G9K",
    installationDate: new Date("2026-03-10"),
    warrantyStartDate: new Date("2026-03-10"),
    warrantyEndDate: new Date("2029-03-10"),
    location: "Server Room",
    department: "IT",
    status: "HAS_ISSUE",
  });
  const inventory = await Asset.create({
    assetCode: "AST-000020",
    clientId: abc._id,
    productId: p("BBE-INV-SYS")._id,
    name: "Inventory Management System",
    type: "SYSTEM",
    version: "v2.4.1",
    systemUrl: "https://inventory.company.mn",
    environment: "production",
    installationDate: new Date("2026-05-20"),
    serviceStartDate: new Date("2026-05-20"),
    serviceEndDate: new Date("2027-05-20"),
    status: "ACTIVE",
  });
  const website = await Asset.create({
    assetCode: "AST-000021",
    clientId: abc._id,
    productId: p("BBE-WEB-CORP")._id,
    name: "Corporate Website",
    type: "WEBSITE",
    version: "v1.2.0",
    websiteUrl: "https://abc.mn",
    environment: "production",
    installationDate: new Date("2026-04-01"),
    serviceEndDate: new Date("2027-04-01"),
    status: "ACTIVE",
  });
  const m365 = await Asset.create({
    assetCode: "AST-000022",
    clientId: abc._id,
    productId: p("MS-365-STD")._id,
    name: "Microsoft 365 Business Standard",
    type: "LICENSE",
    licenseKeyMasked: "XXXX-XXXX-ABCD",
    licenseStartDate: new Date("2026-01-01"),
    licenseEndDate: new Date("2026-12-31"),
    status: "ACTIVE",
  });
  await Asset.create({
    assetCode: "AST-000023",
    clientId: abc._id,
    productId: p("CISCO-2960X-48")._id,
    name: "Cisco Catalyst 2960X-48TD-L",
    type: "HARDWARE",
    manufacturer: "Cisco",
    serialNumber: "FOC2451X1AB",
    location: "Head Office / Network closet",
    installationDate: new Date("2026-02-12"),
    warrantyEndDate: new Date("2027-02-12"),
    status: "ACTIVE",
  });
  await Asset.create({
    assetCode: "AST-000024",
    clientId: munkh._id,
    name: "Attendance Management System",
    type: "SYSTEM",
    version: "v1.0.3",
    systemUrl: "https://hr.munkh.mn",
    status: "ACTIVE",
    serviceEndDate: new Date("2026-11-01"),
  });

  const be104 = await Issue.create({
    issueNumber: "BE-000104",
    clientId: abc._id,
    assetId: dl380._id,
    title: "Серверийн диск дүүрсэн — багтаамж нэмэх шаардлагатай",
    description:
      "Серверийн C drive 95% дүүрсэн байна. Лог болон нөөцлөлт бичигдэхгүй болж, үйлчилгээ удааширч байна. Шинэ SSD суурилуулах шаардлагатай.",
    category: "Storage",
    priority: "HIGH",
    status: "OPEN",
    createdBy: clientUser._id,
    openedAt: new Date("2026-08-05"),
  });
  const be105 = await Issue.create({
    issueNumber: "BE-000105",
    clientId: abc._id,
    assetId: inventory._id,
    title: "Тайлан татах үед 500 error гарч байна",
    description: "Сарын борлуулалтын тайлан татах үед 500 Internal Server Error гарч байна.",
    category: "Report",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assignedAdminId: engineer._id,
    createdBy: clientUser._id,
    startedAt: new Date("2026-08-08"),
  });
  const be106 = await Issue.create({
    issueNumber: "BE-000106",
    clientId: abc._id,
    assetId: website._id,
    title: "Нүүр хуудасны banner mobile дээр буруу харагдаж байна",
    description: "iPhone болон Android төхөөрөмж дээр banner хэт том, товчлуур дарагдахгүй байна.",
    category: "UI",
    priority: "MEDIUM",
    status: "ASSIGNED",
    assignedAdminId: engineer._id,
    createdBy: clientUser._id,
    assignedAt: new Date("2026-08-09"),
  });
  await Issue.create({
    issueNumber: "BE-000107",
    clientId: abc._id,
    assetId: m365._id,
    title: "Шинэ хэрэглэгч лиценз идэвхжүүлж чадахгүй байна",
    description: "Шинэ ажилтанд Microsoft 365 лиценз онооход идэвхжүүлэлт амжилтгүй болж байна.",
    category: "Activation",
    priority: "MEDIUM",
    status: "OPEN",
    createdBy: clientUser._id,
  });

  await IssueActivity.create({ issueId: be104._id, userId: clientUser._id, action: "Issue үүсгэсэн" });
  await IssueActivity.create({ issueId: be105._id, userId: admin._id, action: "Status OPEN → IN_PROGRESS болгосон" });
  await IssueActivity.create({
    issueId: be105._id,
    userId: admin._id,
    action: "Бат-Эрдэнэд хуваарилсан",
  });
  await IssueComment.create({
    issueId: be104._id,
    userId: engineer._id,
    visibility: "PUBLIC",
    body: "Серверийн C drive 95% дүүрсэн байна. Шинэ SSD суурилуулах шаардлагатай.",
  });
  await IssueComment.create({
    issueId: be104._id,
    userId: clientUser._id,
    visibility: "PUBLIC",
    body: "Шинэ SSD суурилуулахыг зөвшөөрч байна.",
  });
  await IssueComment.create({
    issueId: be105._id,
    userId: engineer._id,
    visibility: "INTERNAL",
    body: "Stack trace: report controller timeout. Query optimize хийх.",
  });

  await Installation.create({
    clientId: abc._id,
    orderId: order._id,
    assetId: optiplex._id,
    installationType: "Desktop суурилуулалт",
    scheduledDate: new Date("2026-08-15"),
    scheduledTime: "10:00",
    location: "Head Office / Finance Department",
    engineerId: engineer._id,
    status: "COMPLETED",
    completedAt: new Date("2026-08-15"),
  });
  await Installation.create({
    clientId: abc._id,
    assetId: dl380._id,
    installationType: "SSD нэмэх / диск өргөтгөл",
    scheduledDate: new Date("2026-08-20"),
    scheduledTime: "14:00",
    location: "Server Room",
    engineerId: engineer._id,
    status: "SCHEDULED",
    notes: "Issue #BE-000104",
  });

  await ServiceHistory.insertMany([
    {
      assetId: optiplex._id,
      clientId: abc._id,
      title: "Төхөөрөмж суурилуулсан",
      engineerId: engineer._id,
      performedAt: new Date("2026-08-15"),
    },
    {
      assetId: dl380._id,
      clientId: abc._id,
      issueId: be104._id,
      title: "Issue #BE-000104 үүссэн",
      performedAt: new Date("2026-08-05"),
    },
    {
      assetId: inventory._id,
      clientId: abc._id,
      title: "v2.4.1 deployed",
      performedAt: new Date("2026-05-20"),
    },
    {
      assetId: website._id,
      clientId: abc._id,
      title: "SSL renewed",
      performedAt: new Date("2026-07-01"),
    },
  ]);

  await AssetStatusHistory.insertMany([
    { assetId: optiplex._id, newStatus: "ORDERED", createdAt: new Date("2026-07-01") },
    { assetId: optiplex._id, newStatus: "INSTALLED", createdAt: new Date("2026-08-15") },
    { assetId: dl380._id, newStatus: "HAS_ISSUE", createdAt: new Date("2026-08-05") },
  ]);

  await Quotation.create({
    quotationNumber: "QT-0012",
    clientId: tenger._id,
    companyName: "Тэнгэр Трейд ХХК",
    contactName: "Тэмүүлэн Дорж",
    email: "tenger@example.mn",
    phone: "99001122",
    requirements: "10 ширхэг компьютер + сүлжээний төхөөрөмж + суурилуулалт",
    items: [
      { productId: p("DELL-7020-SFF")._id, name: "Dell OptiPlex 7020 SFF", quantity: 10 },
      { productId: p("MT-HAP-AC3")._id, name: "MikroTik hAP ac³", quantity: 2 },
    ],
    status: "NEW",
  });

  await Notification.create({
    userId: clientUser._id,
    type: "ISSUE_CREATED",
    title: "Issue #BE-000104",
    message: "Серверийн диск дүүрсэн — багтаамж нэмэх шаардлагатай",
    link: "/dashboard/issues",
    read: false,
  });
  await Notification.create({
    userId: admin._id,
    type: "ISSUE_CREATED",
    title: "Шинэ Issue #BE-000104",
    message: "ABC ХХК — HPE DL380",
    link: "/admin/issues",
    read: false,
  });

  console.log("Seed complete.");
  console.log("Admin:  admin@eternity.mn");
  console.log("Client: client@example.mn");
  console.log("Dev password is documented in README (development only).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
