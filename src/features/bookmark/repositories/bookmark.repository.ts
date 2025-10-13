import { PrismaService } from '@/core/prisma.service';
import { Injectable } from '@nestjs/common';
import { Bookmark, Prisma } from '@prisma/client';

/**
 * Bookmark Repository Interface
 *
 * Defines specific operations for Bookmark entity beyond the base CRUD operations
 */
export interface IBookmarkRepository {
  findByUserIdAsync(userId: number, skip?: number, take?: number): Promise<Bookmark[]>;
  findBookmarksWithUserAsync(skip?: number, take?: number): Promise<Bookmark[]>;
  countByUserIdAsync(userId: number): Promise<number>;
  deleteByUserIdAsync(userId: number): Promise<number>;
}

/**
 * Bookmark Repository Implementation
 *
 * Provides data access operations for Bookmark entities with support for
 * transactions through the Unit of Work pattern
 */
@Injectable()
@Injectable()
export class BookmarkRepository implements IBookmarkRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find bookmarks by user ID
   * @param userId - User identifier
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns Promise<Bookmark[]>
   */
  async findByUserIdAsync(userId: number, skip?: number, take?: number): Promise<Bookmark[]> {
    const queryOptions: Prisma.BookmarkFindManyArgs = {
      where: { userId },
    };

    if (skip !== undefined) {
      queryOptions.skip = skip;
    }

    if (take !== undefined) {
      queryOptions.take = take;
    }

    return await this.prisma.bookmark.findMany(queryOptions);
  }

  /**
   * Find bookmarks with their associated user information
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns Promise<Bookmark[]>
   */
  async findBookmarksWithUserAsync(skip?: number, take?: number): Promise<Bookmark[]> {
    const queryOptions: Prisma.BookmarkFindManyArgs = {
      include: {
        user: true,
      },
    };

    if (skip !== undefined) {
      queryOptions.skip = skip;
    }

    if (take !== undefined) {
      queryOptions.take = take;
    }

    return await this.prisma.bookmark.findMany(queryOptions);
  }

  /**
   * Count bookmarks for a specific user
   * @param userId - User identifier
   * @returns Promise<number>
   */
  async countByUserIdAsync(userId: number): Promise<number> {
    return await this.prisma.bookmark.count({
      where: { userId },
    });
  }

  /**
   * Delete all bookmarks for a specific user
   * @param userId - User identifier
   * @returns Promise<number> - Number of deleted bookmarks
   */
  async deleteByUserIdAsync(userId: number): Promise<number> {
    const result = await this.prisma.bookmark.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  /**
   * Override the base findByIdAsync to include user information
   * @param id - Bookmark identifier
   * @returns Promise<Bookmark | null>
   */
  async findByIdWithUserAsync(id: number): Promise<Bookmark | null> {
    return await this.prisma.bookmark.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }
}
