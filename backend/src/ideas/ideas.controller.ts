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
  ParseIntPipe,
} from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createIdeaDto: CreateIdeaDto, @Request() req) {
    return this.ideasService.create(createIdeaDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: 'popular' | 'recent' | 'comments',
  ) {
    return this.ideasService.findAll(category, status, sortBy || 'popular');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.id;
    return this.ideasService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIdeaDto: UpdateIdeaDto,
    @Request() req,
  ) {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'bureau';
    return this.ideasService.update(id, updateIdeaDto, req.user.id, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'bureau';
    return this.ideasService.remove(id, req.user.id, isAdmin);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  vote(
    @Param('id', ParseIntPipe) id: number,
    @Body('isUpvote') isUpvote: boolean,
    @Request() req,
  ) {
    return this.ideasService.vote(id, req.user.id, isUpvote);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.ideasService.addComment(id, req.user.id, createCommentDto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  removeComment(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'bureau';
    return this.ideasService.removeComment(id, req.user.id, isAdmin);
  }
}
