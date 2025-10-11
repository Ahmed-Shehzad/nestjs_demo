import { CoreModule } from '@/core/core.module';
import { UserModule } from '@/features/user/user.module';
import { ProblemDetailsModule } from '@/problem-details/problem-details.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CoreModule, // Global core module with shared services (PrismaClient)
    ProblemDetailsModule, // Global problem details module for standardized error handling
    UserModule, // User feature module (includes MediatorModule)
    // BookmarkModule, // Bookmark feature module (includes MediatorModule) - Temporarily disabled
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
