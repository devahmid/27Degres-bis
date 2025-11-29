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
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  @UseInterceptors(FileInterceptor('featuredImage'))
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFile() featuredImage?: Express.Multer.File,
  ) {
    return this.postsService.create(
      {
        ...createPostDto,
        authorId: req.user.id,
      },
      featuredImage,
    );
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findAllAdmin() {
    return this.postsService.findAllAdmin();
  }

  // Routes pour la gestion des commentaires (admin) - DOIVENT être avant les routes avec paramètres
  @Get('admin/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  getAllComments(@Query('unapproved') unapproved?: string) {
    if (unapproved === 'true') {
      return this.postsService.getUnapprovedComments();
    }
    return this.postsService.getAllComments(true);
  }

  @Patch('comments/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  approveComment(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.approveComment(id);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deleteComment(id);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('recent')
  findRecent(@Query('limit') limit?: number) {
    return this.postsService.findRecent(limit ? +limit : undefined);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':idOrSlug/comments')
  async getComments(@Param('idOrSlug') idOrSlug: string) {
    // Vérifier si c'est un nombre (ID) ou un slug
    const id = parseInt(idOrSlug, 10);
    if (!isNaN(id)) {
      return this.postsService.getComments(id);
    } else {
      // C'est un slug
      const post = await this.postsService.findBySlug(idOrSlug);
      return this.postsService.getComments(post.id);
    }
  }

  @Post(':idOrSlug/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(@Param('idOrSlug') idOrSlug: string, @Request() req, @Body() createCommentDto: CreateCommentDto) {
    // Vérifier si c'est un nombre (ID) ou un slug
    const id = parseInt(idOrSlug, 10);
    if (!isNaN(id)) {
      return this.postsService.addComment(id, req.user.id, createCommentDto);
    } else {
      // C'est un slug
      const post = await this.postsService.findBySlug(idOrSlug);
      return this.postsService.addComment(post.id, req.user.id, createCommentDto);
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  @UseInterceptors(FileInterceptor('featuredImage'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() featuredImage?: Express.Multer.File,
  ) {
    return this.postsService.update(id, updatePostDto, featuredImage);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}

