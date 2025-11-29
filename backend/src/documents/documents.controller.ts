import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    // Pour les utilisateurs authentifiés : retourner les documents généraux + ceux assignés à l'utilisateur
    const userId = req.user?.id;
    return this.documentsService.findAllForUser(userId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.documentsService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Request() req,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    return this.documentsService.create(createDocumentDto, file, req.user.id);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const signedUrl = await this.documentsService.getDownloadUrl(id);
    return { url: signedUrl };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.remove(id);
  }
}
