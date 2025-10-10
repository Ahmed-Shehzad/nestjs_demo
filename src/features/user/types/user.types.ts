/**
 * User domain types
 */

export interface UserCreatedResult {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
}
