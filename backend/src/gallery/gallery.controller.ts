import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // Routes GET - Routes spécifiques AVANT les routes avec paramètres
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findAllAdmin() {
    return this.galleryService.findAllAdmin();
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Request() req) {
    // Permettre l'accès sans authentification pour les images publiques
    // Si authentifié, retourner aussi les images privées de l'utilisateur
    const userId = req.user?.id;
    return this.galleryService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    // Permettre l'accès sans authentification pour les images publiques
    const userId = req.user?.id;
    return this.galleryService.findOne(id, userId);
  }

  // Routes POST
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createGalleryImageDto: CreateGalleryImageDto,
    @Request() req,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }
    return this.galleryService.create(createGalleryImageDto, file, req.user.id);
  }

  // Routes PATCH
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGalleryImageDto: UpdateGalleryImageDto,
    @Request() req,
  ) {
    return this.galleryService.update(id, updateGalleryImageDto, req.user.id, req.user.role);
  }

  // Routes DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.galleryService.remove(id, req.user.id, req.user.role);
  }
}
