import { CoreModule } from '@/core/core.module';
import { BookmarkModule } from '@/features/bookmark/bookmark.module';
import { UserModule } from '@/features/user/user.module';
import { ProblemDetailsModule } from '@/problem-details/problem-details.module';
import { Module } from '@nestjs/common';
import { OpenApiModule } from './lib/openapi';

@Module({
  imports: [
    CoreModule, // Global core module with shared services (PrismaClient, UnitOfWork)
    ProblemDetailsModule, // Global problem details module for standardized error handling
    OpenApiModule.register({
      isGlobal: true,
      config: {
        title: 'NestJS WebAPI',
        description: 'A comprehensive NestJS API with Clean Architecture, CQRS, and DDD patterns',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
    }), // Global OpenAPI module for automatic API documentation
    UserModule, // User feature module (includes UserRepository)
    BookmarkModule, // Bookmark feature module (includes BookmarkRepository)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
