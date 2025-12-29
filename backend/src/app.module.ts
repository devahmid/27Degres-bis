import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { PostsModule } from './posts/posts.module';
import { CotisationsModule } from './cotisations/cotisations.module';
import { DocumentsModule } from './documents/documents.module';
import { ContactModule } from './contact/contact.module';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';
import { GalleryModule } from './gallery/gallery.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EventsModule,
    PostsModule,
    CotisationsModule,
    DocumentsModule,
    ContactModule,
    StorageModule,
    GalleryModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

