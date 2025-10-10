import { User } from '@prisma/client';
/**
 * GetUsersByFilterDto
 * Response DTO for GetUsersByFilterQuery
 * Generated on: 2025-10-10T17:23:10.905Z
 * Feature: User
 */
export class GetUsersByFilterDto {
  constructor(public users: User[]) {} // Example: public readonly name: string, // Example: public readonly id: number, // Add DTO properties here
}
