import { CoreModule } from '@/core/core.module';
import { UserModule } from '@/features/user/user.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CoreModule, // Global core module with shared services (PrismaClient)
    UserModule, // User feature module (includes MediatorModule)
    // BookmarkModule, // Bookmark feature module (includes MediatorModule) - Temporarily disabled
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
