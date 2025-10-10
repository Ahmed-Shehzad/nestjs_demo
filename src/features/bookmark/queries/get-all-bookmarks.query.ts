import { IQuery } from '@/mediator/types/request';
import { GetAllBookmarksDto } from './get-all-bookmarks.dto';

/**
 * GetAllBookmarksQuery
 * Generated on: 2025-10-10T17:23:18.555Z
 * Feature: Bookmark
 */
export class GetAllBookmarksQuery implements IQuery<GetAllBookmarksDto> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly baseUrl: string = '/api/bookmarks',
  ) {}
}
