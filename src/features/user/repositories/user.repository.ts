import { InjectUnitOfWork } from '@/core/decorators/inject-unit-of-work.decorator';
import { PrismaService } from '@/core/prisma.service';
import { IBaseRepository } from '@/core/repositories';
import { BaseRepository } from '@/core/repositories/base-repository';
import type { IUnitOfWork } from '@/core/unit-of-work/unit-of-work.interface';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

/**
 * User Repository Interface
 *
 * Defines specific operations for User entity beyond the base CRUD operations
 */
export interface IUserRepository
  extends IBaseRepository<User, number, Prisma.UserCreateInput, Prisma.UserUpdateInput, Prisma.UserWhereInput> {
  findByEmailAsync(email: string): Promise<User | null>;
  findUsersWithBookmarksAsync(skip?: number, take?: number): Promise<User[]>;
  getUserBookmarkCountAsync(userId: number): Promise<number>;
}

/**
 * User Repository Implementation
 *
 * Provides data access operations for User entities with support for
 * transactions through the Unit of Work pattern
 */
@Injectable()
export class UserRepository
  extends BaseRepository<User, number, Prisma.UserCreateInput, Prisma.UserUpdateInput, Prisma.UserWhereInput>
  implements IUserRepository
{
  constructor(prisma: PrismaService, @InjectUnitOfWork() unitOfWork: IUnitOfWork) {
    super(prisma, 'user', unitOfWork);
  }

  /**
   * Find user by email address
   * @param email - User email address
   * @returns Promise<User | null>
   */
  async findByEmailAsync(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find users with their bookmarks included
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns Promise<User[]>
   */
  async findUsersWithBookmarksAsync(skip?: number, take?: number): Promise<User[]> {
    const queryOptions: Prisma.UserFindManyArgs = {
      include: {
        bookmarks: true,
      },
    };

    if (skip !== undefined) {
      queryOptions.skip = skip;
    }

    if (take !== undefined) {
      queryOptions.take = take;
    }

    return await this.prisma.user.findMany(queryOptions);
  }

  /**
   * Get the count of bookmarks for a specific user
   * @param userId - User identifier
   * @returns Promise<number>
   */
  async getUserBookmarkCountAsync(userId: number): Promise<number> {
    return await this.prisma.bookmark.count({
      where: { userId },
    });
  }

  /**
   * Override the base findByIdAsync to include bookmarks by default
   * @param id - User identifier
   * @returns Promise<User | null>
   */
  async findByIdWithBookmarksAsync(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        bookmarks: true,
      },
    });
  }
}
