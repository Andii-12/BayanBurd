import { Router } from "express";
import {
  issueCreateSchema,
  issueCommentSchema,
  issueStatusSchema,
  issuePrioritySchema,
  issueAssignSchema,
  issueResolveSchema,
  paginationQuery,
} from "@bbe/validation";
import { Asset, Issue, IssueActivity, IssueComment, ServiceHistory, User } from "../models";
import { asyncHandler, AppError, paginate } from "../utils/http";
import { validate } from "../utils/validate";
import { AuthRequest, requireAdmin, requireAuth } from "../middleware/auth";
import { nextIssueNumber } from "../services/counters";
import { audit } from "../services/audit";
import { notifyAdmins, notifyClientUsers, notifyUser } from "../services/notify";
import { emailTemplates } from "../services/email";
import { upload } from "../middleware/upload";
import { saveFile } from "../services/storage";
import type { IssueStatus } from "@bbe/types";

const router = Router();

function isStaff(role: string) {
  return ["ADMIN", "SUPER_ADMIN", "ENGINEER", "SUPPORT"].includes(role);
}

async function logActivity(issueId: string, userId: string, action: string, oldValue?: string, newValue?: string) {
  await IssueActivity.create({ issueId, userId, action, oldValue, newValue });
}

async function assertIssueAccess(req: AuthRequest, issue: InstanceType<typeof Issue>) {
  if (isStaff(req.user!.role)) return;
  if (String(issue.clientId) !== String(req.user!.clientId)) throw new AppError(403, "Хандах эрхгүй");
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const q = paginationQuery.parse(req.query);
    const filter: Record<string, unknown> = {};
    if (!isStaff(req.user!.role)) filter.clientId = req.user!.clientId;
    else if (req.query.clientId) filter.clientId = req.query.clientId;
    if (req.query.assetId) filter.assetId = req.query.assetId;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedAdminId) filter.assignedAdminId = req.query.assignedAdminId;
    if (req.query.status) {
      if (req.query.status === "openish") {
        filter.status = { $in: ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_CLIENT", "WAITING_PART", "REOPENED"] };
      } else if (req.query.status === "waiting") {
        filter.status = { $in: ["WAITING_CLIENT", "WAITING_PART"] };
      } else filter.status = req.query.status;
    }
    if (q.search) {
      filter.$or = [
        { title: new RegExp(q.search, "i") },
        { issueNumber: new RegExp(q.search.replace("#", ""), "i") },
      ];
    }
    const total = await Issue.countDocuments(filter);
    const items = await Issue.find(filter)
      .populate("assetId clientId assignedAdminId createdBy")
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
    const issue = await Issue.findById(req.params.id).populate(
      "assetId clientId assignedAdminId createdBy"
    );
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    await assertIssueAccess(req, issue);
    const commentFilter: Record<string, unknown> = { issueId: issue._id };
    if (!isStaff(req.user!.role)) commentFilter.visibility = "PUBLIC";
    const [comments, activity] = await Promise.all([
      IssueComment.find(commentFilter).populate("userId").sort({ createdAt: 1 }),
      IssueActivity.find({ issueId: issue._id }).populate("userId").sort({ createdAt: 1 }),
    ]);
    res.json({ ...issue.toObject(), comments, activity });
  })
);

router.post(
  "/",
  requireAuth,
  validate(issueCreateSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const asset = await Asset.findById(req.body.assetId);
    if (!asset) throw new AppError(404, "Asset олдсонгүй");
    if (!isStaff(req.user!.role) && String(asset.clientId) !== String(req.user!.clientId)) {
      throw new AppError(403, "Зөвхөн өөрийн бүтээгдэхүүнд Issue үүсгэнэ");
    }
    const issue = await Issue.create({
      issueNumber: await nextIssueNumber(),
      clientId: asset.clientId,
      assetId: asset._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      status: "OPEN",
      createdBy: req.user!._id,
      openedAt: new Date(),
    });
    await logActivity(String(issue._id), String(req.user!._id), "Issue үүсгэсэн");
    if (asset.status !== "HAS_ISSUE") {
      asset.status = "HAS_ISSUE";
      await asset.save();
    }
    const t = emailTemplates.issueCreated(issue.issueNumber, issue.title);
    await notifyAdmins({
      type: "ISSUE_CREATED",
      title: `#${issue.issueNumber}`,
      message: issue.title,
      link: `/admin/issues/${issue._id}`,
    });
    await notifyClientUsers(String(asset.clientId), {
      type: "ISSUE_CREATED",
      title: `Issue #${issue.issueNumber} үүслээ`,
      message: issue.title,
      link: `/dashboard/issues/${issue._id}`,
      email: { to: req.user!.email, subject: t.subject, html: t.html },
    });
    res.status(201).json(issue);
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    res.json(issue);
  })
);

router.post(
  "/:id/comments",
  requireAuth,
  upload.array("files", 8),
  validate(issueCommentSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    await assertIssueAccess(req, issue);
    let visibility = req.body.visibility || "PUBLIC";
    if (!isStaff(req.user!.role)) visibility = "PUBLIC";
    const files = (req.files as Express.Multer.File[]) || [];
    const attachments = await Promise.all(files.map((f) => saveFile(f, "issues")));
    const comment = await IssueComment.create({
      issueId: issue._id,
      userId: req.user!._id,
      body: req.body.body,
      visibility,
      attachments,
    });
    await logActivity(String(issue._id), String(req.user!._id), "Comment нэмсэн");
    const t = emailTemplates.issueCommented(issue.issueNumber);
    if (visibility === "PUBLIC") {
      await notifyClientUsers(String(issue.clientId), {
        type: "ISSUE_COMMENTED",
        title: `Issue #${issue.issueNumber}`,
        message: "Шинэ comment нэмэгдлээ.",
        link: `/dashboard/issues/${issue._id}`,
        email: { to: req.user!.email, subject: t.subject, html: t.html },
      });
    }
    res.status(201).json(await comment.populate("userId"));
  })
);

router.post(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validate(issueStatusSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    const prev = issue.status;
    issue.status = req.body.status as IssueStatus;
    if (issue.status === "IN_PROGRESS" && !issue.startedAt) issue.startedAt = new Date();
    if (issue.status === "CLOSED") issue.closedAt = new Date();
    await issue.save();
    await logActivity(String(issue._id), String(req.user!._id), `Status ${prev} → ${issue.status} болгосон`, prev, issue.status);
    await notifyClientUsers(String(issue.clientId), {
      type: "ISSUE_STATUS",
      title: `Issue #${issue.issueNumber}`,
      message: `Төлөв: ${issue.status}`,
      link: `/dashboard/issues/${issue._id}`,
    });
    res.json(issue);
  })
);

router.post(
  "/:id/priority",
  requireAuth,
  requireAdmin,
  validate(issuePrioritySchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    const prev = issue.priority;
    issue.priority = req.body.priority;
    await issue.save();
    await logActivity(String(issue._id), String(req.user!._id), `Priority ${req.body.priority} болгосон`, prev, req.body.priority);
    res.json(issue);
  })
);

router.post(
  "/:id/assign",
  requireAuth,
  requireAdmin,
  validate(issueAssignSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    const engineer = await User.findById(req.body.assignedAdminId);
    if (!engineer) throw new AppError(404, "Ажилтан олдсонгүй");
    issue.assignedAdminId = engineer._id;
    issue.assignedAt = new Date();
    if (issue.status === "OPEN" || issue.status === "REOPENED") issue.status = "ASSIGNED";
    await issue.save();
    await logActivity(
      String(issue._id),
      String(req.user!._id),
      `${engineer.firstName} ${engineer.lastName}-д хуваарилсан`
    );
    await audit({
      userId: String(req.user!._id),
      action: "ISSUE_ASSIGN",
      entity: "Issue",
      entityId: String(issue._id),
      metadata: { assignedAdminId: String(engineer._id) },
    });
    await notifyUser({
      userId: String(engineer._id),
      type: "ISSUE_ASSIGNED",
      title: `Issue #${issue.issueNumber} хуваарилагдлаа`,
      message: issue.title,
      link: `/admin/issues/${issue._id}`,
    });
    res.json(issue);
  })
);

router.post(
  "/:id/resolve",
  requireAuth,
  requireAdmin,
  validate(issueResolveSchema),
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    issue.status = "RESOLVED";
    issue.resolvedAt = new Date();
    await issue.save();
    await logActivity(String(issue._id), String(req.user!._id), "Issue RESOLVED болгосон");
    if (req.body.createServiceHistory) {
      await ServiceHistory.create({
        assetId: issue.assetId,
        clientId: issue.clientId,
        issueId: issue._id,
        title: `Issue #${issue.issueNumber} шийдвэрлэсэн`,
        cause: req.body.cause,
        actionTaken: req.body.actionTaken,
        partsReplaced: req.body.partsReplaced,
        notes: req.body.notes || req.body.resolution,
        engineerId: req.user!._id,
        performedAt: new Date(),
      });
    }
    const open = await Issue.countDocuments({
      assetId: issue.assetId,
      status: { $nin: ["RESOLVED", "CLOSED"] },
    });
    if (open === 0) {
      await Asset.findByIdAndUpdate(issue.assetId, { status: "ACTIVE" });
    }
    const t = emailTemplates.issueResolved(issue.issueNumber);
    await notifyClientUsers(String(issue.clientId), {
      type: "ISSUE_RESOLVED",
      title: `Issue #${issue.issueNumber} шийдвэрлэгдлээ`,
      message: issue.title,
      link: `/dashboard/issues/${issue._id}`,
      email: { to: req.user!.email, subject: t.subject, html: t.html },
    });
    res.json(issue);
  })
);

router.post(
  "/:id/reopen",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    await assertIssueAccess(req, issue);
    issue.status = "REOPENED";
    issue.closedAt = undefined;
    issue.resolvedAt = undefined;
    await issue.save();
    await logActivity(String(issue._id), String(req.user!._id), "Issue дахин нээсэн");
    await Asset.findByIdAndUpdate(issue.assetId, { status: "HAS_ISSUE" });
    res.json(issue);
  })
);

router.post(
  "/:id/attachments",
  requireAuth,
  upload.array("files", 8),
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await Issue.findById(req.params.id);
    if (!issue) throw new AppError(404, "Issue олдсонгүй");
    await assertIssueAccess(req, issue);
    const files = (req.files as Express.Multer.File[]) || [];
    const saved = await Promise.all(files.map((f) => saveFile(f, "issues")));
    issue.attachments.push(...saved);
    await issue.save();
    await logActivity(String(issue._id), String(req.user!._id), "Attachment нэмсэн");
    res.json(issue);
  })
);

export default router;
