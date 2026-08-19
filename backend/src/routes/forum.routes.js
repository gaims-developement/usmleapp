import { Router } from 'express'
import { z } from 'zod'
import multer from 'multer'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireRoles } from '../middleware/role.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AppError } from '../utils/app-error.js'
import { storageService } from '../services/storage/storage.service.js'
import {
  moderateForumContent,
  processAbusiveSubmission,
  checkUserBanStatus,
} from '../services/forum-moderation.service.js'

export const forumRouter = Router()

forumRouter.use(authenticate)

// ---------------------------------------------------------------------------
// Upload middleware for forum attachments
// ---------------------------------------------------------------------------
const forumAttachmentMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])

const uploadForumAttachments = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!forumAttachmentMimeTypes.has(file.mimetype)) {
      return cb(new AppError('Unsupported file type. Allowed: JPEG, PNG, WebP, PDF.', 400, 'UNSUPPORTED_FILE_TYPE'))
    }
    return cb(null, true)
  },
})

// ---------------------------------------------------------------------------
// Content sanitization: strip HTML tags
// ---------------------------------------------------------------------------
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').trim()
}

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    search: z.string().max(200).optional(),
    categoryId: z.string().optional(),
    postType: z.enum(['DISCUSSION', 'QUESTION', 'EXPERIENCE', 'RESOURCE', 'CLINICAL_CASE', 'HOSPITAL_REVIEW']).optional(),
    sort: z.enum(['latest', 'popular', 'oldest']).optional(),
  }),
})

const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(200),
    content: z.string().min(10).max(20000),
    categoryId: z.string().min(1),
    postType: z.enum(['DISCUSSION', 'QUESTION', 'EXPERIENCE', 'RESOURCE', 'CLINICAL_CASE', 'HOSPITAL_REVIEW']).default('DISCUSSION'),
  }),
})

const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(200).optional(),
    content: z.string().min(10).max(20000).optional(),
    categoryId: z.string().min(1).optional(),
    postType: z.enum(['DISCUSSION', 'QUESTION', 'EXPERIENCE', 'RESOURCE', 'CLINICAL_CASE', 'HOSPITAL_REVIEW']).optional(),
  }),
})

const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000),
    parentId: z.string().optional(),
  }),
})

const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(5000),
  }),
})

const reportSchema = z.object({
  body: z.object({
    reason: z.enum(['SPAM', 'HARASSMENT', 'MEDICAL_MISINFORMATION', 'OFFENSIVE_CONTENT', 'ADVERTISING', 'PERSONAL_INFORMATION', 'OTHER']),
    description: z.string().max(2000).optional(),
  }),
})

const moderateSchema = z.object({
  body: z.object({
    action: z.enum(['hide', 'restore']),
  }),
})

const moderateCommentSchema = z.object({
  body: z.object({
    action: z.enum(['remove', 'restore']),
  }),
})

const resolveReportSchema = z.object({
  body: z.object({
    action: z.enum(['resolve', 'dismiss']),
  }),
})

const appealSchema = z.object({
  body: z.object({
    appealMessage: z.string().min(10).max(2000),
  }),
})

const reviewAppealSchema = z.object({
  body: z.object({
    action: z.enum(['approve', 'reject']),
    notes: z.string().max(2000).optional(),
  }),
})

const adminStrikeSchema = z.object({
  body: z.object({
    action: z.enum(['add', 'remove']),
    reason: z.string().max(1000).optional(),
  }),
})

const adminBanSchema = z.object({
  body: z.object({
    action: z.enum(['ban', 'unban']),
    reason: z.string().max(1000).optional(),
    durationDays: z.number().int().min(1).max(365).default(7),
  }),
})

// ---------------------------------------------------------------------------
// Middleware: check if current user is temporarily banned from the forum
// ---------------------------------------------------------------------------
const checkForumBan = asyncHandler(async (req, _res, next) => {
  const banStatus = await checkUserBanStatus(req.user.id)
  if (banStatus.isBanned) {
    throw new AppError(
      'Your forum access is temporarily suspended due to community guidelines violations.',
      403,
      'FORUM_TEMP_BANNED',
      {
        bannedAt: banStatus.bannedAt,
        banExpiresAt: banStatus.banExpiresAt,
        reason: banStatus.reason,
        strikes: banStatus.strikes,
      }
    )
  }
  next()
})


// ---------------------------------------------------------------------------
// Helper: build post select/include for responses
// ---------------------------------------------------------------------------
const postInclude = {
  author: { select: { id: true, name: true, avatarUrl: true, role: { select: { name: true } } } },
  category: { select: { id: true, name: true, slug: true } },
  attachments: true,
  _count: { select: { comments: true, reactions: true, bookmarks: true } },
}

function formatPost(post, userId) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    postType: post.postType,
    status: post.status,
    upvoteCount: post.upvoteCount,
    commentCount: post.commentCount,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      id: post.author.id,
      name: post.author.name,
      avatarUrl: post.author.avatarUrl,
      role: post.author.role?.name ?? 'STUDENT',
    },
    category: post.category,
    attachments: post.attachments?.map(a => ({
      id: a.id,
      url: a.url,
      fileName: a.fileName,
      mimeType: a.mimeType,
      fileSize: a.fileSize,
    })) ?? [],
    commentCount: post._count?.comments ?? post.commentCount,
    upvoteCount: post.upvoteCount,
    isUpvoted: false,
    isBookmarked: false,
  }
}

// ---------------------------------------------------------------------------
// GET /api/forum/categories
// ---------------------------------------------------------------------------
forumRouter.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
    })

    return res.json({
      success: true,
      data: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        postCount: c._count.posts,
      })),
    })
  }),
)

// ---------------------------------------------------------------------------
// GET /api/forum/posts - List posts with pagination, search, filters
// ---------------------------------------------------------------------------
forumRouter.get(
  '/posts',
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { search, categoryId, postType, sort } = req.query
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const where = { status: 'PUBLISHED' }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (postType) {
      where.postType = postType
    }

    const orderBy = sort === 'popular'
      ? { upvoteCount: 'desc' }
      : sort === 'oldest'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          ...postInclude,
          reactions: {
            where: { userId, type: 'UPVOTE' },
            select: { id: true },
          },
          bookmarks: {
            where: { userId },
            select: { id: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.forumPost.count({ where }),
    ])

    const formatted = posts.map(post => {
      const formatted = formatPost(post, userId)
      formatted.isUpvoted = post.reactions.length > 0
      formatted.isBookmarked = post.bookmarks.length > 0
      return formatted
    })

    return res.json({
      success: true,
      data: {
        posts: formatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  }),
)

// ---------------------------------------------------------------------------
// GET /api/forum/posts/mine - Current user's posts
// ---------------------------------------------------------------------------
forumRouter.get(
  '/posts/mine',
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const where = { authorId: userId, status: { not: 'DELETED' } }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: postInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumPost.count({ where }),
    ])

    return res.json({
      success: true,
      data: {
        posts: posts.map(p => formatPost(p, userId)),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

// ---------------------------------------------------------------------------
// GET /api/forum/posts/bookmarked - Current user's bookmarks
// ---------------------------------------------------------------------------
forumRouter.get(
  '/posts/bookmarked',
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const where = { userId }

    const [bookmarks, total] = await Promise.all([
      prisma.forumBookmark.findMany({
        where,
        include: {
          post: {
            include: {
              ...postInclude,
              reactions: { where: { userId, type: 'UPVOTE' }, select: { id: true } },
              bookmarks: { where: { userId }, select: { id: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumBookmark.count({ where }),
    ])

    const formatted = bookmarks.map(b => {
      const formatted = formatPost(b.post, userId)
      formatted.isUpvoted = b.post.reactions.length > 0
      formatted.isBookmarked = true
      return formatted
    })

    return res.json({
      success: true,
      data: {
        posts: formatted,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

// ---------------------------------------------------------------------------
// GET /api/forum/posts/:id - Single post
// ---------------------------------------------------------------------------
forumRouter.get(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        ...postInclude,
        reactions: { where: { userId, type: 'UPVOTE' }, select: { id: true } },
        bookmarks: { where: { userId }, select: { id: true } },
      },
    })

    if (!post || post.status === 'DELETED') {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    if (post.status === 'HIDDEN' && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      throw new AppError('This post has been hidden by a moderator', 404, 'POST_HIDDEN')
    }

    const formatted = formatPost(post, userId)
    formatted.isUpvoted = post.reactions.length > 0
    formatted.isBookmarked = post.bookmarks.length > 0

    return res.json({ success: true, data: formatted })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/posts - Create post
// ---------------------------------------------------------------------------
forumRouter.post(
  '/posts',
  checkForumBan,
  uploadForumAttachments.array('attachments', 5),
  validate(createPostSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { title, content, categoryId, postType } = req.body

    // Automatic moderation check
    const modResult = moderateForumContent(`${title} ${content}`, 'post')
    if (modResult.isAbusive) {
      const subResult = await processAbusiveSubmission({
        userId,
        text: `${title} ${content}`,
        context: 'post',
        matchedTerms: modResult.matchedTerms,
        severity: modResult.severity,
      })
      throw new AppError(
        'Your post could not be published because it contains language that violates our community guidelines.',
        400,
        'CONTENT_MODERATION_BLOCKED',
        {
          severity: modResult.severity,
          matchedTerms: modResult.matchedTerms,
          strikes: subResult.strikes,
          isBanned: subResult.isBanned,
        }
      )
    }

    // Verify category exists
    const category = await prisma.forumCategory.findUnique({ where: { id: categoryId } })
    if (!category || !category.isActive) {
      throw new AppError('Invalid category', 400, 'INVALID_CATEGORY')
    }

    const sanitizedContent = stripHtml(content)

    const post = await prisma.forumPost.create({
      data: {
        authorId: userId,
        categoryId,
        title: title.trim(),
        content: sanitizedContent,
        postType,
      },
    })

    // Handle file uploads
    const files = req.files || []
    if (files.length > 0) {
      const attachmentData = []
      for (const file of files) {
        // Validate individual file sizes
        const isImage = file.mimetype.startsWith('image/')
        const isPdf = file.mimetype === 'application/pdf'
        if (isImage && file.size > 5 * 1024 * 1024) {
          throw new AppError(`Image "${file.originalname}" exceeds 5MB limit`, 400, 'FILE_TOO_LARGE')
        }
        if (isPdf && file.size > 10 * 1024 * 1024) {
          throw new AppError(`PDF "${file.originalname}" exceeds 10MB limit`, 400, 'FILE_TOO_LARGE')
        }

        const uploadResult = await storageService.uploadFile({
          file,
          studentProfileId: `forum/${post.id}`,
          documentId: Date.now().toString(),
        })

        attachmentData.push({
          postId: post.id,
          storageProvider: uploadResult.storageProvider,
          url: uploadResult.storagePath,
          fileName: uploadResult.fileName,
          mimeType: uploadResult.mimeType,
          fileSize: uploadResult.fileSize,
        })
      }

      await prisma.forumPostAttachment.createMany({ data: attachmentData })
    }

    const fullPost = await prisma.forumPost.findUnique({
      where: { id: post.id },
      include: postInclude,
    })

    return res.status(201).json({ success: true, data: formatPost(fullPost, userId) })
  }),
)

// ---------------------------------------------------------------------------
// PATCH /api/forum/posts/:id - Edit post
// ---------------------------------------------------------------------------
forumRouter.patch(
  '/posts/:id',
  checkForumBan,
  validate(updatePostSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params

    const existing = await prisma.forumPost.findUnique({ where: { id } })
    if (!existing) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    if (existing.authorId !== userId) throw new AppError('You can only edit your own posts', 403, 'FORBIDDEN')
    if (existing.status === 'DELETED') throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    if (req.body.title || req.body.content) {
      const checkText = `${req.body.title ?? existing.title} ${req.body.content ?? existing.content}`
      const modResult = moderateForumContent(checkText, 'post')
      if (modResult.isAbusive) {
        const subResult = await processAbusiveSubmission({
          userId,
          text: checkText,
          context: 'post',
          matchedTerms: modResult.matchedTerms,
          severity: modResult.severity,
          relatedPostId: id,
        })
        throw new AppError(
          'Your edited post contains language that violates our community guidelines.',
          400,
          'CONTENT_MODERATION_BLOCKED',
          {
            severity: modResult.severity,
            matchedTerms: modResult.matchedTerms,
            strikes: subResult.strikes,
            isBanned: subResult.isBanned,
          }
        )
      }
    }

    const data = {}
    if (req.body.title) data.title = req.body.title.trim()
    if (req.body.content) data.content = stripHtml(req.body.content)
    if (req.body.categoryId) {
      const cat = await prisma.forumCategory.findUnique({ where: { id: req.body.categoryId } })
      if (!cat || !cat.isActive) throw new AppError('Invalid category', 400, 'INVALID_CATEGORY')
      data.categoryId = req.body.categoryId
    }
    if (req.body.postType) data.postType = req.body.postType

    const updated = await prisma.forumPost.update({
      where: { id },
      data,
      include: postInclude,
    })

    return res.json({ success: true, data: formatPost(updated, userId) })
  }),
)

// ---------------------------------------------------------------------------
// DELETE /api/forum/posts/:id - Soft-delete post
// ---------------------------------------------------------------------------
forumRouter.delete(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params

    const existing = await prisma.forumPost.findUnique({ where: { id } })
    if (!existing) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    if (existing.authorId !== userId) throw new AppError('You can only delete your own posts', 403, 'FORBIDDEN')

    await prisma.forumPost.update({
      where: { id },
      data: { status: 'DELETED' },
    })

    return res.json({ success: true })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/posts/:id/comments - Add comment
// ---------------------------------------------------------------------------
forumRouter.post(
  '/posts/:id/comments',
  checkForumBan,
  validate(createCommentSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id: postId } = req.params
    const { content, parentId } = req.body

    // Automatic moderation check
    const modResult = moderateForumContent(content, 'comment')
    if (modResult.isAbusive) {
      const subResult = await processAbusiveSubmission({
        userId,
        text: content,
        context: 'comment',
        matchedTerms: modResult.matchedTerms,
        severity: modResult.severity,
        relatedPostId: postId,
      })
      throw new AppError(
        'Your comment could not be published because it contains language that violates our community guidelines.',
        400,
        'CONTENT_MODERATION_BLOCKED',
        {
          severity: modResult.severity,
          matchedTerms: modResult.matchedTerms,
          strikes: subResult.strikes,
          isBanned: subResult.isBanned,
        }
      )
    }

    const post = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!post || post.status !== 'PUBLISHED') {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    if (parentId) {
      const parentComment = await prisma.forumComment.findUnique({ where: { id: parentId } })
      if (!parentComment || parentComment.postId !== postId) {
        throw new AppError('Invalid parent comment', 400, 'INVALID_PARENT')
      }
      if (parentComment.parentId) {
        throw new AppError('Replies are limited to two levels', 400, 'NESTING_LIMIT')
      }
    }

    const sanitizedContent = stripHtml(content)

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId: userId,
        parentId: parentId || null,
        content: sanitizedContent,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: { select: { name: true } } } },
      },
    })

    // Increment comment count on post
    await prisma.forumPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    })

    // Notify post author (if not self)
    if (post.authorId !== userId) {
      try {
        const commenter = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            tone: 'INFO',
            title: 'New Reply',
            body: `${commenter?.name ?? 'Someone'} replied to your post "${post.title}"`,
            details: { postId, commentId: comment.id },
          },
        })
      } catch {
        // Notification failure is non-critical
      }
    }

    // Notify parent comment author (if replying and not self)
    if (parentId) {
      const parentComment = await prisma.forumComment.findUnique({ where: { id: parentId } })
      if (parentComment && parentComment.authorId !== userId) {
        try {
          const commenter = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
          await prisma.notification.create({
            data: {
              userId: parentComment.authorId,
              tone: 'INFO',
              title: 'Reply to Your Comment',
              body: `${commenter?.name ?? 'Someone'} replied to your comment on "${post.title}"`,
              details: { postId, commentId: comment.id },
            },
          })
        } catch {
          // Notification failure is non-critical
        }
      }
    }

    const formatted = {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      content: comment.content,
      upvoteCount: 0,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.name,
        avatarUrl: comment.author.avatarUrl,
        role: comment.author.role?.name ?? 'STUDENT',
      },
      isUpvoted: false,
      replies: [],
    }

    return res.status(201).json({ success: true, data: formatted })
  }),
)

// ---------------------------------------------------------------------------
// GET /api/forum/posts/:id/comments - Get comments
// ---------------------------------------------------------------------------
forumRouter.get(
  '/posts/:id/comments',
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id: postId } = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const post = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!post || post.status !== 'PUBLISHED') {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    const where = { postId, status: 'PUBLISHED' }

    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
        where: { ...where, parentId: null },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, role: { select: { name: true } } } },
          reactions: { where: { userId, type: 'UPVOTE' }, select: { id: true } },
          replies: {
            where: { status: 'PUBLISHED' },
            include: {
              author: { select: { id: true, name: true, avatarUrl: true, role: { select: { name: true } } } },
              reactions: { where: { userId, type: 'UPVOTE' }, select: { id: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { reactions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumComment.count({ where: { ...where, parentId: null } }),
    ])

    const formatted = comments.map(c => ({
      id: c.id,
      postId: c.postId,
      parentId: c.parentId,
      content: c.content,
      upvoteCount: c._count.reactions,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        avatarUrl: c.author.avatarUrl,
        role: c.author.role?.name ?? 'STUDENT',
      },
      isUpvoted: c.reactions.length > 0,
      replies: c.replies.map(r => ({
        id: r.id,
        postId: r.postId,
        parentId: r.parentId,
        content: r.content,
        upvoteCount: r._count?.reactions ?? 0,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        author: {
          id: r.author.id,
          name: r.author.name,
          avatarUrl: r.author.avatarUrl,
          role: r.author.role?.name ?? 'STUDENT',
        },
        isUpvoted: r.reactions.length > 0,
      })),
    }))

    return res.json({
      success: true,
      data: {
        comments: formatted,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

// ---------------------------------------------------------------------------
// PATCH /api/forum/comments/:id - Edit comment
// ---------------------------------------------------------------------------
forumRouter.patch(
  '/comments/:id',
  checkForumBan,
  validate(updateCommentSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params

    const existing = await prisma.forumComment.findUnique({ where: { id } })
    if (!existing) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND')
    if (existing.authorId !== userId) throw new AppError('You can only edit your own comments', 403, 'FORBIDDEN')

    const modResult = moderateForumContent(req.body.content, 'comment')
    if (modResult.isAbusive) {
      const subResult = await processAbusiveSubmission({
        userId,
        text: req.body.content,
        context: 'comment',
        matchedTerms: modResult.matchedTerms,
        severity: modResult.severity,
        relatedCommentId: id,
      })
      throw new AppError(
        'Your comment edit violates the community guidelines.',
        400,
        'CONTENT_MODERATION_BLOCKED',
        {
          severity: modResult.severity,
          matchedTerms: modResult.matchedTerms,
          strikes: subResult.strikes,
          isBanned: subResult.isBanned,
        }
      )
    }

    const updated = await prisma.forumComment.update({
      where: { id },
      data: { content: stripHtml(req.body.content) },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: { select: { name: true } } } },
      },
    })

    return res.json({
      success: true,
      data: {
        id: updated.id,
        content: updated.content,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        author: {
          id: updated.author.id,
          name: updated.author.name,
          avatarUrl: updated.author.avatarUrl,
          role: updated.author.role?.name ?? 'STUDENT',
        },
      },
    })
  }),
)

// ---------------------------------------------------------------------------
// DELETE /api/forum/comments/:id - Delete comment
// ---------------------------------------------------------------------------
forumRouter.delete(
  '/comments/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params

    const existing = await prisma.forumComment.findUnique({ where: { id } })
    if (!existing) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND')
    if (existing.authorId !== userId) throw new AppError('You can only delete your own comments', 403, 'FORBIDDEN')

    await prisma.forumComment.update({
      where: { id },
      data: { status: 'REMOVED' },
    })

    // Decrement comment count on post
    await prisma.forumPost.update({
      where: { id: existing.postId },
      data: { commentCount: { decrement: 1 } },
    })

    return res.json({ success: true })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/posts/:id/upvote - Toggle upvote
// ---------------------------------------------------------------------------
forumRouter.post(
  '/posts/:id/upvote',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id: postId } = req.params

    const post = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!post || post.status !== 'PUBLISHED') {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    const existing = await prisma.forumReaction.findFirst({
      where: { userId, postId, type: 'UPVOTE' },
    })

    let upvoted

    if (existing) {
      await prisma.forumReaction.delete({ where: { id: existing.id } })
      await prisma.forumPost.update({ where: { id: postId }, data: { upvoteCount: { decrement: 1 } } })
      upvoted = false
    } else {
      await prisma.forumReaction.create({ data: { userId, postId, type: 'UPVOTE' } })
      await prisma.forumPost.update({ where: { id: postId }, data: { upvoteCount: { increment: 1 } } })
      upvoted = true
    }

    const updatedPost = await prisma.forumPost.findUnique({ where: { id: postId }, select: { upvoteCount: true } })

    return res.json({ success: true, data: { upvoted, upvoteCount: updatedPost.upvoteCount } })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/comments/:id/upvote - Toggle comment upvote
// ---------------------------------------------------------------------------
forumRouter.post(
  '/comments/:id/upvote',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id: commentId } = req.params

    const comment = await prisma.forumComment.findUnique({ where: { id: commentId } })
    if (!comment || comment.status !== 'PUBLISHED') {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND')
    }

    const existing = await prisma.forumReaction.findFirst({
      where: { userId, commentId, type: 'UPVOTE' },
    })

    let upvoted

    if (existing) {
      await prisma.forumReaction.delete({ where: { id: existing.id } })
      await prisma.forumComment.update({ where: { id: commentId }, data: { upvoteCount: { decrement: 1 } } })
      upvoted = false
    } else {
      await prisma.forumReaction.create({ data: { userId, commentId, type: 'UPVOTE' } })
      await prisma.forumComment.update({ where: { id: commentId }, data: { upvoteCount: { increment: 1 } } })
      upvoted = true
    }

    const updatedComment = await prisma.forumComment.findUnique({ where: { id: commentId }, select: { upvoteCount: true } })

    return res.json({ success: true, data: { upvoted, upvoteCount: updatedComment.upvoteCount } })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/posts/:id/bookmark - Toggle bookmark
// ---------------------------------------------------------------------------
forumRouter.post(
  '/posts/:id/bookmark',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id: postId } = req.params

    const post = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!post || post.status !== 'PUBLISHED') {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    const existing = await prisma.forumBookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    })

    let bookmarked

    if (existing) {
      await prisma.forumBookmark.delete({ where: { id: existing.id } })
      bookmarked = false
    } else {
      await prisma.forumBookmark.create({ data: { userId, postId } })
      bookmarked = true
    }

    return res.json({ success: true, data: { bookmarked } })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/posts/:id/report - Report post
// ---------------------------------------------------------------------------
forumRouter.post(
  '/posts/:id/report',
  validate(reportSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id: postId } = req.params
    const { reason, description } = req.body

    const post = await prisma.forumPost.findUnique({ where: { id: postId } })
    if (!post || post.status !== 'PUBLISHED') {
      throw new AppError('Post not found', 404, 'POST_NOT_FOUND')
    }

    if (post.authorId === userId) {
      throw new AppError('You cannot report your own post', 400, 'CANNOT_REPORT_SELF')
    }

    const existingReport = await prisma.forumReport.findFirst({
      where: { reporterId: userId, postId, status: 'PENDING' },
    })
    if (existingReport) {
      throw new AppError('You have already reported this post', 400, 'ALREADY_REPORTED')
    }

    await prisma.forumReport.create({
      data: {
        reporterId: userId,
        postId,
        reason,
        description: description ? stripHtml(description) : null,
      },
    })

    return res.status(201).json({ success: true })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/comments/:id/report - Report comment
// ---------------------------------------------------------------------------
forumRouter.post(
  '/comments/:id/report',
  validate(reportSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id: commentId } = req.params
    const { reason, description } = req.body

    const comment = await prisma.forumComment.findUnique({ where: { id: commentId } })
    if (!comment || comment.status !== 'PUBLISHED') {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND')
    }

    if (comment.authorId === userId) {
      throw new AppError('You cannot report your own comment', 400, 'CANNOT_REPORT_SELF')
    }

    const existingReport = await prisma.forumReport.findFirst({
      where: { reporterId: userId, commentId, status: 'PENDING' },
    })
    if (existingReport) {
      throw new AppError('You have already reported this comment', 400, 'ALREADY_REPORTED')
    }

    await prisma.forumReport.create({
      data: {
        reporterId: userId,
        commentId,
        reason,
        description: description ? stripHtml(description) : null,
      },
    })

    return res.status(201).json({ success: true })
  }),
)

// ---------------------------------------------------------------------------
// Admin/Super Admin routes
// ---------------------------------------------------------------------------

// GET /api/forum/reports - List reports
forumRouter.get(
  '/reports',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const where = {}

    const [reports, total] = await Promise.all([
      prisma.forumReport.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true } },
          post: { select: { id: true, title: true, authorId: true }, include: { author: { select: { name: true } } } },
          comment: { select: { id: true, content: true, authorId: true }, include: { author: { select: { name: true } } } },
          resolvedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumReport.count({ where }),
    ])

    return res.json({
      success: true,
      data: {
        reports: reports.map(r => ({
          id: r.id,
          reason: r.reason,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          resolvedAt: r.resolvedAt?.toISOString() ?? null,
          reporter: r.reporter,
          post: r.post ? { id: r.post.id, title: r.post.title, authorName: r.post.author?.name } : null,
          comment: r.comment ? { id: r.comment.id, content: r.comment.content, authorName: r.comment.author?.name } : null,
          resolvedBy: r.resolvedBy,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

// PATCH /api/forum/reports/:id/resolve - Resolve/dismiss report
forumRouter.patch(
  '/reports/:id/resolve',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(resolveReportSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params
    const { action } = req.body

    const report = await prisma.forumReport.findUnique({ where: { id } })
    if (!report) throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND')

    const status = action === 'resolve' ? 'RESOLVED' : 'DISMISSED'

    await prisma.forumReport.update({
      where: { id },
      data: { status, resolvedAt: new Date(), resolvedById: userId },
    })

    // Notify reporter
    if (report.reporterId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: report.reporterId,
            tone: 'SUCCESS',
            title: 'Report Resolved',
            body: `Your report has been ${action === 'resolve' ? 'resolved' : 'dismissed'} by a moderator.`,
            details: { reportId: id, action },
          },
        })
      } catch {
        // Notification failure is non-critical
      }
    }

    return res.json({ success: true })
  }),
)

// PATCH /api/forum/posts/:id/moderate - Hide/restore post
forumRouter.patch(
  '/posts/:id/moderate',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(moderateSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params
    const { action } = req.body

    const post = await prisma.forumPost.findUnique({ where: { id } })
    if (!post) throw new AppError('Post not found', 404, 'POST_NOT_FOUND')

    const newStatus = action === 'hide' ? 'HIDDEN' : 'PUBLISHED'

    await prisma.forumPost.update({
      where: { id },
      data: { status: newStatus },
    })

    // Notify post author
    if (post.authorId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            tone: action === 'hide' ? 'WARNING' : 'SUCCESS',
            title: action === 'hide' ? 'Post Hidden' : 'Post Restored',
            body: action === 'hide'
              ? 'Your post has been hidden by a moderator for review.'
              : 'Your post has been restored by a moderator.',
            details: { postId: id, action },
          },
        })
      } catch {
        // Notification failure is non-critical
      }
    }

    return res.json({ success: true, data: { status: newStatus } })
  }),
)

// PATCH /api/forum/comments/:id/moderate - Remove/restore comment
forumRouter.patch(
  '/comments/:id/moderate',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(moderateCommentSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const { id } = req.params
    const { action } = req.body

    const comment = await prisma.forumComment.findUnique({ where: { id } })
    if (!comment) throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND')

    const newStatus = action === 'remove' ? 'REMOVED' : 'PUBLISHED'

    await prisma.forumComment.update({
      where: { id },
      data: { status: newStatus },
    })

    // Notify comment author
    if (comment.authorId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: comment.authorId,
            tone: action === 'remove' ? 'WARNING' : 'SUCCESS',
            title: action === 'remove' ? 'Comment Removed' : 'Comment Restored',
            body: action === 'remove'
              ? 'Your comment has been removed by a moderator for review.'
              : 'Your comment has been restored by a moderator.',
            details: { commentId: id, action },
          },
        })
      } catch {
        // Notification failure is non-critical
      }
    }

    return res.json({ success: true, data: { status: newStatus } })
  }),
)

// GET /api/forum/stats - Forum stats for admin dashboard
forumRouter.get(
  '/stats',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (_req, res) => {
    const [totalPosts, totalComments, pendingReports, totalReports] = await Promise.all([
      prisma.forumPost.count({ where: { status: 'PUBLISHED' } }),
      prisma.forumComment.count({ where: { status: 'PUBLISHED' } }),
      prisma.forumReport.count({ where: { status: 'PENDING' } }),
      prisma.forumReport.count(),
    ])

    return res.json({
      success: true,
      data: {
        totalPosts,
        totalComments,
        pendingReports,
        totalReports,
      },
    })
  }),
)

// ---------------------------------------------------------------------------
// GET /api/forum/my-status - Current user moderation status & active appeal
// ---------------------------------------------------------------------------
forumRouter.get(
  '/my-status',
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const banStatus = await checkUserBanStatus(userId)
    const activeAppeal = await prisma.forumModerationAppeal.findFirst({
      where: { userId, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      orderBy: { createdAt: 'desc' },
    })

    return res.json({
      success: true,
      data: {
        ...banStatus,
        activeAppeal: activeAppeal
          ? {
              id: activeAppeal.id,
              status: activeAppeal.status,
              appealMessage: activeAppeal.appealMessage,
              createdAt: activeAppeal.createdAt.toISOString(),
            }
          : null,
      },
    })
  }),
)

// ---------------------------------------------------------------------------
// POST /api/forum/appeals - Submit review appeal for forum ban
// ---------------------------------------------------------------------------
forumRouter.post(
  '/appeals',
  validate(appealSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id
    const banStatus = await checkUserBanStatus(userId)

    if (!banStatus.isBanned) {
      throw new AppError('You are not currently banned from the forum.', 400, 'NOT_BANNED')
    }

    const existingAppeal = await prisma.forumModerationAppeal.findFirst({
      where: { userId, status: { in: ['OPEN', 'UNDER_REVIEW'] } },
    })

    if (existingAppeal) {
      throw new AppError('You already have an appeal under review.', 400, 'APPEAL_EXISTS')
    }

    const appeal = await prisma.forumModerationAppeal.create({
      data: {
        userId,
        reasonForBan: banStatus.reason ?? 'Repeated guidelines violations',
        strikeCount: banStatus.strikes,
        bannedAt: banStatus.bannedAt ?? new Date(),
        banExpiresAt: banStatus.banExpiresAt,
        appealMessage: stripHtml(req.body.appealMessage),
        status: 'OPEN',
      },
    })

    await prisma.forumModerationAudit.create({
      data: {
        userId,
        action: 'APPEAL_CREATED',
        reason: 'User submitted a forum ban review appeal',
        severity: 'LOW',
      },
    })

    return res.status(201).json({ success: true, data: appeal })
  }),
)

// ---------------------------------------------------------------------------
// ADMIN & SUPER ADMIN MODERATION PANEL ENDPOINTS
// ---------------------------------------------------------------------------

// GET /api/forum/admin/users - List users with moderation data
forumRouter.get(
  '/admin/users',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [moderationUsers, total] = await Promise.all([
      prisma.forumUserModeration.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true, role: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumUserModeration.count(),
    ])

    return res.json({
      success: true,
      data: {
        users: moderationUsers.map(m => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          role: m.user.role?.name ?? 'STUDENT',
          avatarUrl: m.user.avatarUrl,
          strikes: m.strikes,
          isBanned: m.isBanned,
          bannedAt: m.bannedAt?.toISOString() ?? null,
          banExpiresAt: m.banExpiresAt?.toISOString() ?? null,
          reason: m.reason,
          updatedAt: m.updatedAt.toISOString(),
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

// GET /api/forum/admin/appeals - List review appeals
forumRouter.get(
  '/admin/appeals',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [appeals, total] = await Promise.all([
      prisma.forumModerationAppeal.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true, role: { select: { name: true } } } },
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumModerationAppeal.count(),
    ])

    return res.json({
      success: true,
      data: {
        appeals: appeals.map(a => ({
          id: a.id,
          userId: a.userId,
          userName: a.user.name,
          userEmail: a.user.email,
          userRole: a.user.role?.name ?? 'STUDENT',
          reasonForBan: a.reasonForBan,
          strikeCount: a.strikeCount,
          bannedAt: a.bannedAt.toISOString(),
          banExpiresAt: a.banExpiresAt?.toISOString() ?? null,
          appealMessage: a.appealMessage,
          status: a.status,
          reviewedBy: a.reviewedBy,
          reviewNotes: a.reviewNotes,
          createdAt: a.createdAt.toISOString(),
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)

// PATCH /api/forum/admin/appeals/:id - Approve or reject appeal
forumRouter.patch(
  '/admin/appeals/:id',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(reviewAppealSchema),
  asyncHandler(async (req, res) => {
    const moderatorId = req.user.id
    const { id } = req.params
    const { action, notes } = req.body

    const appeal = await prisma.forumModerationAppeal.findUnique({ where: { id } })
    if (!appeal) throw new AppError('Appeal not found', 404, 'APPEAL_NOT_FOUND')

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    await prisma.forumModerationAppeal.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedById: moderatorId,
        reviewNotes: notes ? stripHtml(notes) : null,
      },
    })

    if (action === 'approve') {
      // Lift ban
      await prisma.forumUserModeration.update({
        where: { userId: appeal.userId },
        data: { isBanned: false, banExpiresAt: null },
      })

      await prisma.forumModerationAudit.create({
        data: {
          userId: appeal.userId,
          moderatorId,
          action: 'APPEAL_APPROVED',
          reason: notes ? `Appeal approved: ${stripHtml(notes)}` : 'Appeal approved by moderator',
          severity: 'LOW',
        },
      })

      await prisma.forumModerationAudit.create({
        data: {
          userId: appeal.userId,
          moderatorId,
          action: 'UNBAN',
          reason: 'User unbanned via appeal approval',
          severity: 'LOW',
        },
      })

      // Notify user
      try {
        await prisma.notification.create({
          data: {
            userId: appeal.userId,
            tone: 'SUCCESS',
            title: 'Forum Access Restored',
            body: 'Your appeal has been reviewed and approved by a moderator. Your forum access has been restored.',
            details: { appealId: id, action: 'APPROVED' },
          },
        })
      } catch {
        // Notification failure is non-critical
      }
    } else {
      await prisma.forumModerationAudit.create({
        data: {
          userId: appeal.userId,
          moderatorId,
          action: 'APPEAL_REJECTED',
          reason: notes ? `Appeal rejected: ${stripHtml(notes)}` : 'Appeal rejected by moderator',
          severity: 'LOW',
        },
      })

      // Notify user
      try {
        await prisma.notification.create({
          data: {
            userId: appeal.userId,
            tone: 'WARNING',
            title: 'Forum Appeal Decision',
            body: 'Your appeal was reviewed and rejected by a moderator. Your forum suspension remains active.',
            details: { appealId: id, action: 'REJECTED', notes },
          },
        })
      } catch {
        // Notification failure is non-critical
      }
    }

    return res.json({ success: true, data: { status: newStatus } })
  }),
)

// POST /api/forum/admin/users/:userId/strike - Add or remove strike
forumRouter.post(
  '/admin/users/:userId/strike',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(adminStrikeSchema),
  asyncHandler(async (req, res) => {
    const moderatorId = req.user.id
    const { userId } = req.params
    const { action, reason } = req.body

    let modRecord = await prisma.forumUserModeration.findUnique({ where: { userId } })
    if (!modRecord) {
      modRecord = await prisma.forumUserModeration.create({ data: { userId, strikes: 0 } })
    }

    let newStrikes = modRecord.strikes
    if (action === 'add') {
      newStrikes = modRecord.strikes + 1
    } else if (action === 'remove') {
      newStrikes = Math.max(0, modRecord.strikes - 1)
    }

    const updated = await prisma.forumUserModeration.update({
      where: { userId },
      data: { strikes: newStrikes },
    })

    const auditAction = action === 'add' ? 'MANUAL_WARNING' : 'STRIKE_REMOVED'
    const auditReason = reason ? stripHtml(reason) : `${action === 'add' ? 'Manual strike added' : 'Strike removed'} by moderator`

    await prisma.forumModerationAudit.create({
      data: {
        userId,
        moderatorId,
        action: auditAction,
        reason: auditReason,
        severity: 'LOW',
      },
    })

    return res.json({ success: true, data: { strikes: updated.strikes } })
  }),
)

// POST /api/forum/admin/users/:userId/ban - Ban or unban user
forumRouter.post(
  '/admin/users/:userId/ban',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(adminBanSchema),
  asyncHandler(async (req, res) => {
    const moderatorId = req.user.id
    const { userId } = req.params
    const { action, reason, durationDays } = req.body

    let modRecord = await prisma.forumUserModeration.findUnique({ where: { userId } })
    if (!modRecord) {
      modRecord = await prisma.forumUserModeration.create({ data: { userId, strikes: 0 } })
    }

    if (action === 'ban') {
      const banExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      const banReason = reason ? stripHtml(reason) : `Manual ban by moderator (${durationDays} days)`

      await prisma.forumUserModeration.update({
        where: { userId },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          banExpiresAt,
          reason: banReason,
        },
      })

      await prisma.forumModerationAudit.create({
        data: {
          userId,
          moderatorId,
          action: 'MANUAL_BAN',
          reason: banReason,
          severity: 'HIGH',
        },
      })

      try {
        await prisma.notification.create({
          data: {
            userId,
            tone: 'WARNING',
            title: 'Forum Access Temporarily Suspended',
            body: `Your forum access has been manually suspended by a moderator for ${durationDays} days. Reason: ${banReason}`,
            details: { type: 'FORUM_BAN', banExpiresAt, reason: banReason },
          },
        })
      } catch {
        // Notification failure is non-critical
      }

      return res.json({ success: true, data: { isBanned: true, banExpiresAt } })
    } else {
      await prisma.forumUserModeration.update({
        where: { userId },
        data: {
          isBanned: false,
          banExpiresAt: null,
        },
      })

      await prisma.forumModerationAudit.create({
        data: {
          userId,
          moderatorId,
          action: 'UNBAN',
          reason: reason ? stripHtml(reason) : 'Manual unban by moderator',
          severity: 'LOW',
        },
      })

      try {
        await prisma.notification.create({
          data: {
            userId,
            tone: 'SUCCESS',
            title: 'Forum Access Restored',
            body: 'Your forum suspension has been lifted by a moderator. You can now post and comment again.',
            details: { type: 'FORUM_UNBAN' },
          },
        })
      } catch {
        // Notification failure is non-critical
      }

      return res.json({ success: true, data: { isBanned: false } })
    }
  }),
)

// GET /api/forum/admin/audit-logs - List moderation audit logs
forumRouter.get(
  '/admin/audit-logs',
  requireRoles('ADMIN', 'SUPER_ADMIN'),
  validate(paginationSchema),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const skip = (page - 1) * limit

    const [audits, total] = await Promise.all([
      prisma.forumModerationAudit.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          moderator: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumModerationAudit.count(),
    ])

    return res.json({
      success: true,
      data: {
        auditLogs: audits.map(a => ({
          id: a.id,
          userId: a.userId,
          userName: a.user.name,
          userEmail: a.user.email,
          moderatorName: a.moderator?.name ?? 'System',
          action: a.action,
          reason: a.reason,
          severity: a.severity,
          matchedTerms: a.matchedTerms,
          relatedPostId: a.relatedPostId,
          relatedCommentId: a.relatedCommentId,
          createdAt: a.createdAt.toISOString(),
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  }),
)
