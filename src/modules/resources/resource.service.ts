import prisma from '../../config/database.js';
import { uploadBuffer, generateDownloadUrl as generateCloudinaryDownloadUrl, deleteFile, UploadResult } from '../../config/cloudinary.js';
import { uploadToS3, generateS3DownloadUrl, deleteFromS3, isS3Configured, S3UploadResult } from '../../config/s3.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import type { CreateResourceInput, UpdateResourceInput, ResourceQueryInput } from './resource.validators.js';

const CACHE_TTL = 300;

type AccessTypeValue = 'VIEW_ONLY' | 'DOWNLOADABLE' | 'CAMPUS_ONLY';
type ResourceCategoryValue = 'BOOK' | 'JOURNAL' | 'PAPER' | 'MAGAZINE' | 'THESIS' | 'OTHER';
type ResourceTypeValue = 'BOOK' | 'JOURNAL' | 'THESIS' | 'MAGAZINE' | 'MODULE_NOTES' | 'PAST_PAPER' | 'LECTURE_SLIDE' | 'LAB_MANUAL' | 'ASSIGNMENT' | 'OTHER';
type ApprovalStatusValue = 'PENDING' | 'APPROVED' | 'REJECTED';
type CampusLocationValue = 'MAIN_CAMPUS' | 'MARKET_PLAZA' | 'ONLINE';
type SortByField = 'createdAt' | 'title' | 'downloadCount' | 'viewCount';
type StorageTypeValue = 'CLOUDINARY' | 'S3';

// Extended input for campus-only resources
interface PhysicalLocationInput {
  physicalLocation?: string;
  shelfNumber?: string;
  availabilityNotes?: string;
  copies?: number;
  isbn?: string;
  issn?: string;
}

// Extended input for staff academic resources
interface AcademicResourceInput {
  resourceType?: ResourceTypeValue;
  courseUnitId?: string;
  campusLocation?: CampusLocationValue;
}

// PDF-related MIME types that should go to S3
const PDF_MIME_TYPES = [
  'application/pdf',
  'application/x-pdf',
];

// Document types that should go to S3 for better storage
const S3_ELIGIBLE_MIME_TYPES = [
  ...PDF_MIME_TYPES,
  'application/epub+zip',
  'application/x-mobipocket-ebook',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Determine storage type based on file MIME type
 */
const determineStorageType = (mimeType?: string): StorageTypeValue => {
  if (!mimeType) return 'CLOUDINARY';

  // If S3 is configured and file is eligible, use S3
  if (isS3Configured() && S3_ELIGIBLE_MIME_TYPES.includes(mimeType)) {
    return 'S3';
  }

  return 'CLOUDINARY';
};

export class ResourceService {
  /**
   * Create a new resource
   * - Admin uploads are auto-approved
   * - Staff uploads require admin approval (status = PENDING)
   */
  async create(
    data: CreateResourceInput & PhysicalLocationInput & AcademicResourceInput,
    file: Express.Multer.File | undefined,
    coverImage: Express.Multer.File | undefined,
    uploadedById: string,
    uploaderRole: 'ADMIN' | 'STAFF' = 'STAFF'
  ) {
    const accessType = (data.accessType || 'DOWNLOADABLE') as AccessTypeValue;

    // Validation for CAMPUS_ONLY resources
    if (accessType === 'CAMPUS_ONLY') {
      if (!data.physicalLocation) {
        throw new BadRequestError('Physical location is required for campus-only resources');
      }
      // CAMPUS_ONLY resources don't need a file
    } else {
      // For DOWNLOADABLE and VIEW_ONLY, file is typically required
      // But we allow metadata-only entries if needed
    }

    let cloudinaryResult: UploadResult | null = null;
    let s3Result: S3UploadResult | null = null;
    let coverResult: UploadResult | null = null;
    let storageType: StorageTypeValue = 'CLOUDINARY';

    // Handle main file upload (only if file is provided)
    if (file) {
      storageType = determineStorageType(file.mimetype);

      if (storageType === 'S3') {
        // Upload PDF/documents to S3
        s3Result = await uploadToS3(file.buffer, file.originalname, {
          folder: 'resources',
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedBy: uploadedById,
          },
        });
        logger.info('File uploaded to S3', { key: s3Result.key, size: s3Result.size });
      } else {
        // Upload images and other files to Cloudinary
        cloudinaryResult = await uploadBuffer(file.buffer, 'e-library/resources', {
          resource_type: 'auto',
          public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
        });
        logger.info('File uploaded to Cloudinary', { publicId: cloudinaryResult.publicId });
      }
    }

    // Cover images always go to Cloudinary
    if (coverImage) {
      coverResult = await uploadBuffer(coverImage.buffer, 'e-library/resources/covers', {
        resource_type: 'image',
        public_id: `${Date.now()}-cover-${coverImage.originalname.replace(/\.[^/.]+$/, '')}`,
      });
    }

    const resource = await prisma.$transaction(async (tx) => {
      const newResource = await tx.resource.create({
        data: {
          title: data.title,
          authors: data.authors,
          description: data.description,
          category: data.category as ResourceCategoryValue,
          department: data.department,
          publicationYear: data.publicationYear,
          accessType: accessType as any,
          tags: data.tags || [],
          uploadedById,
          storageType,
          cloudinaryId: cloudinaryResult?.publicId,
          cloudinaryUrl: cloudinaryResult?.secureUrl,
          s3Key: s3Result?.key,
          s3Bucket: s3Result?.bucket,
          coverImageId: coverResult?.publicId,
          coverImageUrl: coverResult?.secureUrl,
          fileType: file?.mimetype,
          fileSize: file?.size,
          // Physical location fields for CAMPUS_ONLY
          physicalLocation: data.physicalLocation,
          shelfNumber: data.shelfNumber,
          availabilityNotes: data.availabilityNotes,
          copies: data.copies,
          isbn: data.isbn,
          issn: data.issn,
          // Resource type and course unit (for staff academic materials)
          resourceType: (data.resourceType || 'OTHER') as ResourceTypeValue,
          courseUnitId: data.courseUnitId,
          // Campus location: ONLINE for digital resources, MAIN_CAMPUS/MARKET_PLAZA for physical
          campusLocation: data.campusLocation || 'ONLINE',
          // Approval workflow: Admin uploads auto-approved, Staff uploads need approval
          approvalStatus: uploaderRole === 'ADMIN' ? 'APPROVED' : 'PENDING',
          approvedById: uploaderRole === 'ADMIN' ? uploadedById : undefined,
          approvedAt: uploaderRole === 'ADMIN' ? new Date() : undefined,
        },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (data.courseIds && data.courseIds.length > 0) {
        await tx.courseResource.createMany({
          data: data.courseIds.map((courseId) => ({
            courseId,
            resourceId: newResource.id,
          })),
          skipDuplicates: true,
        });
      }

      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: newResource.id,
          action: 'CREATE',
          performedById: uploadedById,
          meta: { title: newResource.title, storageType, accessType },
        },
      });

      return newResource;
    });

    await this.invalidateCache();

    logger.info('Resource created', {
      resourceId: resource.id,
      title: resource.title,
      storageType,
      accessType,
    });

    return resource;
  }

  async findById(id: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    return resource;
  }

  /**
   * Find all resources with filtering
   * - Non-admin users only see APPROVED resources
   * - Admin users can see all resources or filter by approvalStatus
   */
  async findAll(query: ResourceQueryInput, isAdmin: boolean = false) {
    const rawPage = (query as any).page ?? 1;
    const rawLimit = (query as any).limit ?? 20;

    const page = Number.isFinite(Number(rawPage)) && Number(rawPage) > 0
      ? Math.floor(Number(rawPage))
      : 1;
    const limit = Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0
      ? Math.floor(Number(rawLimit))
      : 20;

    const { cursor, search, category, department, year, tag, author, accessType } = query;
    const approvalStatus = (query as any).approvalStatus;
    const resourceType = (query as any).resourceType;

    const sortBy = (query as any).sortBy ?? 'createdAt';
    const sortOrder = (query as any).sortOrder ?? 'desc';

    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Approval status filtering
    if (isAdmin && approvalStatus) {
      // Admin can filter by specific approval status
      where.approvalStatus = approvalStatus;
    } else if (!isAdmin) {
      // Non-admin users only see approved resources
      where.approvalStatus = 'APPROVED';
    }
    // If admin and no approvalStatus filter, show all

    if (category) where.category = category;
    if (resourceType) where.resourceType = resourceType;
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (year) where.publicationYear = year;
    if (tag) where.tags = { has: tag };
    if (author) where.authors = { has: author };
    if (accessType) where.accessType = accessType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {
      [sortBy as SortByField]: sortOrder,
    };

    if (cursor) {
      const [resources, total] = await Promise.all([
        prisma.resource.findMany({
          where: where as any,
          take: limit + 1,
          cursor: { id: cursor },
          skip: 1,
          orderBy: orderBy as any,
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
        }),
        prisma.resource.count({ where: where as any }),
      ]);

      const hasMore = resources.length > limit;
      const data = hasMore ? resources.slice(0, -1) : resources;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

      return {
        data,
        pagination: {
          nextCursor,
          hasMore,
          total,
        },
      };
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: where as any,
        take: limit,
        skip,
        orderBy: orderBy as any,
        include: {
          uploadedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.resource.count({ where: where as any }),
    ]);

    return {
      data: resources,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, data: UpdateResourceInput, userId: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    const { courseIds, ...updateData } = data;

    const updatedResource = await prisma.$transaction(async (tx) => {
      const updated = await tx.resource.update({
        where: { id },
        data: updateData as any,
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (courseIds !== undefined) {
        await tx.courseResource.deleteMany({
          where: { resourceId: id },
        });

        if (courseIds.length > 0) {
          await tx.courseResource.createMany({
            data: courseIds.map((courseId) => ({
              courseId,
              resourceId: id,
            })),
            skipDuplicates: true,
          });
        }
      }

      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: id,
          action: 'UPDATE',
          performedById: userId,
          meta: { changes: data },
        },
      });

      return updated;
    });

    await this.invalidateCache();

    logger.info('Resource updated', { resourceId: id });

    return updatedResource;
  }

  async delete(id: string, userId: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    await prisma.$transaction(async (tx) => {
      // Delete main file from appropriate storage
      if (resource.storageType === 'S3' && resource.s3Key) {
        try {
          await deleteFromS3(resource.s3Key);
          logger.info('File deleted from S3', { resourceId: id, s3Key: resource.s3Key });
        } catch (error) {
          logger.error('Failed to delete file from S3', { resourceId: id, error });
        }
      } else if (resource.cloudinaryId) {
        try {
          await deleteFile(resource.cloudinaryId, 'raw');
          logger.info('File deleted from Cloudinary', { resourceId: id });
        } catch (error) {
          logger.error('Failed to delete file from Cloudinary', { resourceId: id, error });
        }
      }

      // Cover images are always on Cloudinary
      if (resource.coverImageId) {
        try {
          await deleteFile(resource.coverImageId, 'image');
        } catch (error) {
          logger.error('Failed to delete cover image from Cloudinary', { resourceId: id, error });
        }
      }

      await tx.resource.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: id,
          action: 'DELETE',
          performedById: userId,
          meta: { title: resource.title, storageType: resource.storageType },
        },
      });
    });

    await this.invalidateCache();

    logger.info('Resource deleted', { resourceId: id, storageType: resource.storageType });

    return { message: 'Resource deleted successfully' };
  }

  async getDownloadUrl(resourceId: string, userId: string, ipAddress?: string, userAgent?: string) {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    // Handle CAMPUS_ONLY resources - return location info instead of file URL
    if (resource.accessType === 'CAMPUS_ONLY') {
      return {
        accessType: 'CAMPUS_ONLY',
        message: 'This resource is available for on-campus access only',
        physicalLocation: resource.physicalLocation,
        shelfNumber: resource.shelfNumber,
        availabilityNotes: resource.availabilityNotes,
        copies: resource.copies,
      };
    }

    // Check if resource has a file in either storage
    const hasFile = resource.storageType === 'S3'
      ? !!resource.s3Key
      : !!resource.cloudinaryId;

    if (!hasFile) {
      throw new BadRequestError('This resource does not have a downloadable file');
    }

    if (resource.accessType === 'VIEW_ONLY') {
      throw new ForbiddenError('This resource is view-only and cannot be downloaded');
    }

    await prisma.$transaction([
      prisma.downloadLog.create({
        data: {
          userId,
          resourceId,
          ipAddress,
          userAgent,
        },
      }),
      prisma.resource.update({
        where: { id: resourceId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    let signedUrl: string;
    const expiresIn = 3600;

    if (resource.storageType === 'S3' && resource.s3Key) {
      // Generate S3 pre-signed download URL
      signedUrl = await generateS3DownloadUrl(resource.s3Key, expiresIn, resource.title);
      logger.info('S3 download URL generated', { resourceId, userId, s3Key: resource.s3Key });
    } else if (resource.cloudinaryId) {
      // Generate Cloudinary download URL
      signedUrl = generateCloudinaryDownloadUrl(resource.cloudinaryId, {
        expiresInSeconds: expiresIn,
        resourceType: 'raw',
        filename: resource.title,
      });
      logger.info('Cloudinary download URL generated', { resourceId, userId });
    } else {
      throw new BadRequestError('This resource does not have a downloadable file');
    }

    return {
      accessType: 'DOWNLOADABLE',
      url: signedUrl,
      expiresIn,
      storageType: resource.storageType,
    };
  }

  async getPreviewUrl(resourceId: string, userId?: string) {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    // Check if resource has a file in either storage
    const hasFile = resource.storageType === 'S3'
      ? !!resource.s3Key
      : !!resource.cloudinaryId;

    if (!hasFile) {
      throw new BadRequestError('This resource does not have a file');
    }

    await prisma.resource.update({
      where: { id: resourceId },
      data: { viewCount: { increment: 1 } },
    });

    let previewUrl: string;
    const expiresIn = 1800;

    if (resource.storageType === 'S3' && resource.s3Key) {
      // Generate S3 pre-signed view URL (uses generateS3ViewUrl if needed, but download works too)
      const { generateS3ViewUrl } = await import('../../config/s3.js');
      previewUrl = await generateS3ViewUrl(resource.s3Key, expiresIn);
      logger.info('S3 preview URL generated', { resourceId, userId });
    } else if (resource.cloudinaryId) {
      // Generate Cloudinary preview URL
      previewUrl = generateCloudinaryDownloadUrl(resource.cloudinaryId, {
        expiresInSeconds: expiresIn,
        resourceType: 'raw',
      });
      logger.info('Cloudinary preview URL generated', { resourceId, userId });
    } else {
      throw new BadRequestError('This resource does not have a file');
    }

    return {
      url: previewUrl,
      expiresIn,
      storageType: resource.storageType,
    };
  }

  async getTrending(limit: number = 10) {
    const cacheKey = `trending:${limit}`;

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const resources = await prisma.resource.findMany({
      where: { isActive: true, approvalStatus: 'APPROVED' },
      orderBy: [
        { downloadCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        authors: true,
        category: true,
        department: true,
        downloadCount: true,
        viewCount: true,
        createdAt: true,
      },
    });

    if (isRedisConnected()) {
      await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(resources));
    }

    return resources;
  }

  async getLatest(limit: number = 10) {
    const cacheKey = `latest:${limit}`;

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const resources = await prisma.resource.findMany({
      where: { isActive: true, approvalStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        authors: true,
        category: true,
        department: true,
        createdAt: true,
      },
    });

    if (isRedisConnected()) {
      await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(resources));
    }

    return resources;
  }

  /**
   * Get pending resources for admin approval
   */
  async getPendingResources(query: { page?: number; limit?: number } = {}) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: {
          approvalStatus: 'PENDING',
          isActive: true,
        },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          courseUnit: {
            include: { course: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, // Oldest first
      }),
      prisma.resource.count({
        where: { approvalStatus: 'PENDING', isActive: true },
      }),
    ]);

    return {
      data: resources,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Approve a resource (admin only)
   */
  async approveResource(resourceId: string, adminId: string, note?: string) {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    if (resource.approvalStatus !== 'PENDING') {
      throw new BadRequestError(`Resource is already ${resource.approvalStatus.toLowerCase()}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const approvedResource = await tx.resource.update({
        where: { id: resourceId },
        data: {
          approvalStatus: 'APPROVED',
          approvedById: adminId,
          approvedAt: new Date(),
          approvalNote: note,
        },
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: resourceId,
          action: 'APPROVE',
          performedById: adminId,
          meta: { title: resource.title, note },
        },
      });

      // Notify the uploader
      await tx.notification.create({
        data: {
          userId: resource.uploadedById,
          type: 'success',
          title: 'Resource Approved',
          message: `Your resource "${resource.title}" has been approved and is now visible to all users.${note ? ` Note: ${note}` : ''}`,
          data: { resourceId, note } as any,
        },
      });

      return approvedResource;
    });

    await this.invalidateCache();

    logger.info('Resource approved', { resourceId, adminId });

    return updated;
  }

  /**
   * Reject a resource (admin only)
   */
  async rejectResource(resourceId: string, adminId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestError('Rejection reason is required');
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    if (resource.approvalStatus !== 'PENDING') {
      throw new BadRequestError(`Resource is already ${resource.approvalStatus.toLowerCase()}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const rejectedResource = await tx.resource.update({
        where: { id: resourceId },
        data: {
          approvalStatus: 'REJECTED',
          approvedById: adminId,
          approvedAt: new Date(),
          approvalNote: reason,
        },
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: resourceId,
          action: 'REJECT',
          performedById: adminId,
          meta: { title: resource.title, reason },
        },
      });

      // Notify the uploader
      await tx.notification.create({
        data: {
          userId: resource.uploadedById,
          type: 'warning',
          title: 'Resource Rejected',
          message: `Your resource "${resource.title}" was not approved. Reason: ${reason}`,
          data: { resourceId, reason } as any,
        },
      });

      return rejectedResource;
    });

    logger.info('Resource rejected', { resourceId, adminId, reason });

    return updated;
  }

  /**
   * Get approval statistics for admin dashboard
   */
  async getApprovalStats() {
    const [pending, approved, rejected, recentlyApproved] = await Promise.all([
      prisma.resource.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.resource.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.resource.count({ where: { approvalStatus: 'REJECTED' } }),
      prisma.resource.count({
        where: {
          approvalStatus: 'APPROVED',
          approvedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      pending,
      approved,
      rejected,
      recentlyApproved,
      totalStaffUploads: pending + approved + rejected,
    };
  }

  private async invalidateCache() {
    if (isRedisConnected()) {
      const keys = await getRedisClient().keys('trending:*');
      const latestKeys = await getRedisClient().keys('latest:*');
      const searchKeys = await getRedisClient().keys('search:*');
      const allKeys = [...keys, ...latestKeys, ...searchKeys];

      if (allKeys.length > 0) {
        await getRedisClient().del(...allKeys);
      }
    }
  }
}

export const resourceService = new ResourceService();
