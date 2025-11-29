import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Cotisation } from '../cotisations/entities/cotisation.entity';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { EventImage } from '../events/entities/event-image.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../posts/entities/comment.entity';
import { PostTag } from '../posts/entities/post-tag.entity';
import { PostTagRelation } from '../posts/entities/post-tag-relation.entity';
import { Document } from '../documents/entities/document.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { GalleryImage } from '../gallery/entities/gallery-image.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        // Si DATABASE_URL est fournie, l'utiliser directement
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [
              User,
              Cotisation,
              Event,
              EventRegistration,
              EventImage,
              Post,
              Comment,
              PostTag,
              PostTagRelation,
              Document,
              ContactMessage,
              GalleryImage,
            ],
            synchronize: configService.get('NODE_ENV') !== 'production',
            logging: configService.get('NODE_ENV') === 'development',
            ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Sinon, utiliser les paramètres individuels
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME', 'asso_27degres'),
          entities: [
            User,
            Cotisation,
            Event,
            EventRegistration,
            EventImage,
            Post,
            Comment,
            PostTag,
            PostTagRelation,
            Document,
            ContactMessage,
            GalleryImage,
          ],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

