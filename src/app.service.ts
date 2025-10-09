import { Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';

@Injectable()
export class AppService {
  getHello() {
    const user: User = {
      id: 1,
      email: 'user@example.com',
      hash: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bookmark: Bookmark = {
      id: 1,
      userId: user.id,
      title: 'Example Bookmark',
      description: 'An example bookmark',
      createdAt: new Date(),
      updatedAt: new Date(),
      link: 'https://example.com',
    };

    return { user: user, bookmark: bookmark };
  }
}
