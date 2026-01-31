// src/modules/courses/course-unit.service.ts
import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

interface CreateCourseUnitInput {
    code: string;
    name: string;
    description?: string;
}

interface UpdateCourseUnitInput {
    code?: string;
    name?: string;
    description?: string;
}

interface CourseUnitQueryInput {
    page?: number;
    limit?: number;
    search?: string;
}

export class CourseUnitService {
    /**
     * Create a new course unit
     */
    async create(courseId: string, data: CreateCourseUnitInput, userId: string) {
        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundError('Course not found');
        }

        // Check for duplicate unit code within the course
        const existing = await prisma.courseUnit.findUnique({
            where: {
                courseId_code: {
                    courseId,
                    code: data.code.toUpperCase(),
                },
            },
        });

        if (existing) {
            throw new ConflictError('A unit with this code already exists in this course');
        }

        const unit = await prisma.$transaction(async (tx) => {
            const newUnit = await tx.courseUnit.create({
                data: {
                    courseId,
                    code: data.code.toUpperCase(),
                    name: data.name,
                    description: data.description,
                },
                include: {
                    course: true,
                },
            });

            await tx.auditLog.create({
                data: {
                    entity: 'CourseUnit',
                    entityId: newUnit.id,
                    action: 'CREATE',
                    performedById: userId,
                    meta: { courseId, code: newUnit.code, name: newUnit.name },
                },
            });

            return newUnit;
        });

        logger.info('Course unit created', { unitId: unit.id, courseId, code: unit.code });

        return unit;
    }

    /**
     * Get all units for a course
     */
    async findByCourse(courseId: string, query: CourseUnitQueryInput = {}) {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundError('Course not found');
        }

        const page = query.page || 1;
        const limit = query.limit || 50; // Usually not many units per course
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { courseId };

        if (query.search) {
            where.OR = [
                { code: { contains: query.search, mode: 'insensitive' } },
                { name: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [units, total] = await Promise.all([
            prisma.courseUnit.findMany({
                where: where as any,
                include: {
                    _count: { select: { resources: true } },
                },
                skip,
                take: limit,
                orderBy: { code: 'asc' },
            }),
            prisma.courseUnit.count({ where: where as any }),
        ]);

        return {
            data: units,
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
     * Get a single course unit
     */
    async findById(unitId: string) {
        const unit = await prisma.courseUnit.findUnique({
            where: { id: unitId },
            include: {
                course: true,
                resources: {
                    where: { isActive: true, approvalStatus: 'APPROVED' },
                    select: {
                        id: true,
                        title: true,
                        resourceType: true,
                        category: true,
                        coverImageUrl: true,
                        createdAt: true,
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!unit) {
            throw new NotFoundError('Course unit not found');
        }

        return unit;
    }

    /**
     * Update a course unit
     */
    async update(unitId: string, data: UpdateCourseUnitInput, userId: string) {
        const unit = await prisma.courseUnit.findUnique({
            where: { id: unitId },
        });

        if (!unit) {
            throw new NotFoundError('Course unit not found');
        }

        // Check for duplicate code if changing
        if (data.code && data.code !== unit.code) {
            const existing = await prisma.courseUnit.findUnique({
                where: {
                    courseId_code: {
                        courseId: unit.courseId,
                        code: data.code.toUpperCase(),
                    },
                },
            });

            if (existing) {
                throw new ConflictError('A unit with this code already exists in this course');
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            const updatedUnit = await tx.courseUnit.update({
                where: { id: unitId },
                data: {
                    ...(data.code && { code: data.code.toUpperCase() }),
                    ...(data.name && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                },
                include: { course: true },
            });

            await tx.auditLog.create({
                data: {
                    entity: 'CourseUnit',
                    entityId: unitId,
                    action: 'UPDATE',
                    performedById: userId,
                    meta: { changes: data },
                },
            });

            return updatedUnit;
        });

        logger.info('Course unit updated', { unitId });

        return updated;
    }

    /**
     * Delete a course unit
     */
    async delete(unitId: string, userId: string) {
        const unit = await prisma.courseUnit.findUnique({
            where: { id: unitId },
            include: { _count: { select: { resources: true } } },
        });

        if (!unit) {
            throw new NotFoundError('Course unit not found');
        }

        await prisma.$transaction(async (tx) => {
            // Unlink resources from this unit (don't delete them)
            await tx.resource.updateMany({
                where: { courseUnitId: unitId },
                data: { courseUnitId: null },
            });

            await tx.courseUnit.delete({
                where: { id: unitId },
            });

            await tx.auditLog.create({
                data: {
                    entity: 'CourseUnit',
                    entityId: unitId,
                    action: 'DELETE',
                    performedById: userId,
                    meta: { code: unit.code, name: unit.name },
                },
            });
        });

        logger.info('Course unit deleted', { unitId });

        return { message: 'Course unit deleted successfully' };
    }

    /**
     * Get resources for a specific course unit
     */
    async getResources(unitId: string, query: { page?: number; limit?: number } = {}) {
        const unit = await prisma.courseUnit.findUnique({
            where: { id: unitId },
        });

        if (!unit) {
            throw new NotFoundError('Course unit not found');
        }

        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const [resources, total] = await Promise.all([
            prisma.resource.findMany({
                where: {
                    courseUnitId: unitId,
                    isActive: true,
                    approvalStatus: 'APPROVED',
                },
                select: {
                    id: true,
                    title: true,
                    authors: true,
                    resourceType: true,
                    category: true,
                    coverImageUrl: true,
                    downloadCount: true,
                    createdAt: true,
                    uploadedBy: {
                        select: { id: true, name: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.resource.count({
                where: {
                    courseUnitId: unitId,
                    isActive: true,
                    approvalStatus: 'APPROVED',
                },
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
}

export const courseUnitService = new CourseUnitService();
