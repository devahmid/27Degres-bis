import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryImage } from './entities/gallery-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryImage])],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
