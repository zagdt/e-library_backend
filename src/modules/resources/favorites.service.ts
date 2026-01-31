import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';

interface FavoriteQueryInput {
    page?: number;
    limit?: number;
    category?: string;
}

export class FavoritesService {
    /**
     * Get user's favorites
     */
    async getUserFavorites(userId: string, query: FavoriteQueryInput) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
            userId,
        };

        if (query.category) {
            where.resource = {
                category: query.category,
            };
        }

        const [favorites, total] = await Promise.all([
            prisma.favorite.findMany({
                where: where as any,
                include: {
                    resource: {
                        select: {
                            id: true,
                            title: true,
                            authors: true,
                            category: true,
                            department: true,
                            coverImageUrl: true,
                            accessType: true,
                            downloadCount: true,
                            viewCount: true,
                            createdAt: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.favorite.count({ where: where as any }),
        ]);

        return {
            data: favorites.map(f => ({
                id: f.id,
                resourceId: f.resourceId,
                createdAt: f.createdAt,
                resource: f.resource,
            })),
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
     * Add a resource to user's favorites
     */
    async addFavorite(userId: string, resourceId: string) {
        // Check if resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            throw new NotFoundError('Resource not found');
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        if (existing) {
            throw new ConflictError('Resource already in favorites');
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId,
                resourceId,
            },
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
        });

        logger.info('Resource added to favorites', { userId, resourceId });

        return favorite;
    }

    /**
     * Remove a resource from user's favorites
     */
    async removeFavorite(userId: string, resourceId: string) {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        if (!favorite) {
            throw new NotFoundError('Favorite not found');
        }

        await prisma.favorite.delete({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        logger.info('Resource removed from favorites', { userId, resourceId });

        return { message: 'Removed from favorites' };
    }

    /**
     * Check if a resource is in user's favorites
     */
    async isFavorite(userId: string, resourceId: string): Promise<boolean> {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId,
                },
            },
        });

        return !!favorite;
    }

    /**
     * Get favorites count for a resource
     */
    async getResourceFavoritesCount(resourceId: string): Promise<number> {
        return prisma.favorite.count({
            where: { resourceId },
        });
    }
}

export const favoritesService = new FavoritesService();
