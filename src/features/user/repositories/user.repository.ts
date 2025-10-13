import { PrismaService } from '@/core/prisma.service';
import { IBaseRepository } from '@/core/repositories';
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
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdAsync(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findManyAsync(filter: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({ where: filter });
  }

  async findFirstAsync(filter: Prisma.UserWhereInput): Promise<User | null> {
    return this.prisma.user.findFirst({ where: filter });
  }

  async createAsync(input: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: input });
  }

  async updateAsync(id: number, input: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: input });
  }

  async deleteAsync(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async countAsync(filter: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where: filter });
  }

  async findByEmailAsync(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUsersWithBookmarksAsync(skip = 0, take = 10): Promise<User[]> {
    return this.prisma.user.findMany({ skip, take, include: { bookmarks: true } });
  }

  async existsAsync(id: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user !== null;
  }

  async createManyAsync(data: Prisma.UserCreateInput[]): Promise<number> {
    const result = await this.prisma.user.createMany({ data });
    return result.count;
  }

  async updateManyAsync(filter: Prisma.UserWhereInput, input: Prisma.UserUpdateInput): Promise<number> {
    const result = await this.prisma.user.updateMany({ where: filter, data: input });
    return result.count;
  }

  async deleteManyAsync(filter: Prisma.UserWhereInput): Promise<number> {
    const result = await this.prisma.user.deleteMany({ where: filter });
    return result.count;
  }

  async getUserBookmarkCountAsync(userId: number): Promise<number> {
    return this.prisma.bookmark.count({ where: { userId } });
  }
}
