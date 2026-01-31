import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import type { CreateCourseInput, UpdateCourseInput, CourseQueryInput, CourseResourcesQueryInput } from './course.validators.js';

export class CourseService {
  async create(data: CreateCourseInput, userId: string) {
    const existing = await prisma.course.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictError('A course with this code already exists');
    }

    const course = await prisma.$transaction(async (tx) => {
      const newCourse = await tx.course.create({
        data: {
          code: data.code.toUpperCase(),
          name: data.name,
          department: data.department,
        },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Course',
          entityId: newCourse.id,
          action: 'CREATE',
          performedById: userId,
          meta: { code: newCourse.code, name: newCourse.name },
        },
      });

      return newCourse;
    });

    logger.info('Course created', { courseId: course.id, code: course.code });

    return course;
  }

  async findById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        resources: {
          include: {
            resource: {
              select: {
                id: true,
                title: true,
                authors: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return {
      ...course,
      resources: course.resources.map(r => r.resource),
    };
  }

  async findAll(query: CourseQueryInput) {
    const rawPage = (query as any).page ?? 1;
    const rawLimit = (query as any).limit ?? 20;

    const page = Number.isFinite(Number(rawPage)) && Number(rawPage) > 0
      ? Math.floor(Number(rawPage))
      : 1;
    const limit = Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0
      ? Math.floor(Number(rawLimit))
      : 20;

    const { department, search } = query;

    const where: Record<string, unknown> = {};

    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: where as any,
        take: limit,
        skip,
        orderBy: { code: 'asc' },
        include: {
          _count: {
            select: { resources: true },
          },
        },
      }),
      prisma.course.count({ where: where as any }),
    ]);

    return {
      data: courses,
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

  async update(id: string, data: UpdateCourseInput, userId: string) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (data.code && data.code !== course.code) {
      const existing = await prisma.course.findUnique({
        where: { code: data.code.toUpperCase() },
      });

      if (existing) {
        throw new ConflictError('A course with this code already exists');
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.code) updatePayload.code = data.code.toUpperCase();
    if (data.name) updatePayload.name = data.name;
    if (data.department) updatePayload.department = data.department;

    const updatedCourse = await prisma.$transaction(async (tx) => {
      const updated = await tx.course.update({
        where: { id },
        data: updatePayload,
      });

      await tx.auditLog.create({
        data: {
          entity: 'Course',
          entityId: id,
          action: 'UPDATE',
          performedById: userId,
          meta: { changes: data },
        },
      });

      return updated;
    });

    logger.info('Course updated', { courseId: id });

    return updatedCourse;
  }

  async delete(id: string, userId: string) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.course.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Course',
          entityId: id,
          action: 'DELETE',
          performedById: userId,
          meta: { code: course.code, name: course.name },
        },
      });
    });

    logger.info('Course deleted', { courseId: id });

    return { message: 'Course deleted successfully' };
  }

  async getDepartments() {
    const departments = await prisma.course.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });

    return departments.map(d => d.department);
  }

  async getResources(courseId: string, query: CourseResourcesQueryInput) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const where: any = {
      courseId,
    };

    if (query.search || query.category) {
      where.resource = {};
      if (query.search) {
        where.resource.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      if (query.category) {
        where.resource.category = query.category;
      }
    }

    const [resources, total] = await Promise.all([
      prisma.courseResource.findMany({
        where,
        include: {
          resource: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.courseResource.count({ where }),
    ]);

    return {
      data: resources.map(r => r.resource),
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

export const courseService = new CourseService();
