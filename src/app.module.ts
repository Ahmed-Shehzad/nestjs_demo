import { CoreModule } from '@/core/core.module';
import { BookmarkModule } from '@/features/bookmark/bookmark.module';
import { UserModule } from '@/features/user/user.module';
import { ProblemDetailsModule } from '@/problem-details/problem-details.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CoreModule, // Global core module with shared services (PrismaClient, UnitOfWork)
    ProblemDetailsModule, // Global problem details module for standardized error handling
    UserModule, // User feature module (includes UserRepository)
    BookmarkModule, // Bookmark feature module (includes BookmarkRepository)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
