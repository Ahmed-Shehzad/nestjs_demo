/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { InjectUnitOfWork } from '../decorators/inject-unit-of-work.decorator';
import { PrismaService } from '../prisma.service';
import type { IUnitOfWork } from '../unit-of-work/unit-of-work.interface';
import { IBaseRepository } from './base-repository.interface';

/**
 * Base Repository Implementation
 *
 * Abstract base class that provides common CRUD operations using Prisma.
 * This implements the Repository pattern with transactional support through
 * the Unit of Work pattern.
 *
 * @template TEntity - The entity type
 * @template TId - The ID type (usually number or string)
 * @template TCreateInput - Input type for creating entities
 * @template TUpdateInput - Input type for updating entities
 * @template TFilterInput - Input type for filtering entities
 */
export abstract class BaseRepository<TEntity, TId, TCreateInput, TUpdateInput, TFilterInput = Record<string, any>>
  implements IBaseRepository<TEntity, TId, TCreateInput, TUpdateInput, TFilterInput>
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
    @InjectUnitOfWork() public readonly unitOfWork: IUnitOfWork,
  ) {}

  /**
   * Get the Prisma model delegate for the current entity
   * This can be either the main PrismaClient or a transaction client
   * Note: Using 'any' here is necessary for dynamic model access in Prisma
   */
  protected get model(): any {
    // Use transaction context if available, otherwise use main Prisma client
    const client = this.unitOfWork.isInTransaction() ? this.unitOfWork.getTransactionContext() : this.prisma;
    return client[this.modelName.toLowerCase()];
  }

  async findByIdAsync(id: TId): Promise<TEntity | null> {
    return (await this.model.findUnique({
      where: { id },
    })) as TEntity | null;
  }

  async findManyAsync(filter?: TFilterInput, skip?: number, take?: number): Promise<TEntity[]> {
    const queryOptions: any = {};

    if (filter) {
      queryOptions.where = filter;
    }

    if (skip !== undefined) {
      queryOptions.skip = skip;
    }

    if (take !== undefined) {
      queryOptions.take = take;
    }

    return await this.model.findMany(queryOptions);
  }

  async findFirstAsync(filter: TFilterInput): Promise<TEntity | null> {
    return await this.model.findFirst({
      where: filter,
    });
  }

  async createAsync(data: TCreateInput): Promise<TEntity> {
    return await this.model.create({
      data,
    });
  }

  async updateAsync(id: TId, data: TUpdateInput): Promise<TEntity> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async deleteAsync(id: TId): Promise<TEntity> {
    return await this.model.delete({
      where: { id },
    });
  }

  async countAsync(filter?: TFilterInput): Promise<number> {
    const queryOptions: any = {};

    if (filter) {
      queryOptions.where = filter;
    }

    return await this.model.count(queryOptions);
  }

  async existsAsync(id: TId): Promise<boolean> {
    const count = await this.model.count({
      where: { id },
    });
    return count > 0;
  }

  async createManyAsync(data: TCreateInput[]): Promise<number> {
    const result = await this.model.createMany({
      data,
    });
    return result.count;
  }

  async updateManyAsync(filter: TFilterInput, data: TUpdateInput): Promise<number> {
    const result = await this.model.updateMany({
      where: filter,
      data,
    });
    return result.count;
  }

  async deleteManyAsync(filter: TFilterInput): Promise<number> {
    const result = await this.model.deleteMany({
      where: filter,
    });
    return result.count;
  }

  /**
   * Check if currently operating within a transaction context
   * @returns boolean - True if in transaction, false otherwise
   */
  isInTransaction(): boolean {
    return this.unitOfWork.isInTransaction();
  }
}
