import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private supabaseService: SupabaseService,
  ) {}

  async create(createPostDto: CreatePostDto, featuredImageFile?: Express.Multer.File): Promise<Post> {
    // Upload de l'image principale si fournie
    if (featuredImageFile) {
      const fileName = `post-${Date.now()}-${featuredImageFile.originalname}`;
      const { url } = await this.supabaseService.uploadFile(
        featuredImageFile.buffer,
        fileName,
        'posts',
      );
      createPostDto.featuredImage = url;
    }

    const post = this.postsRepository.create(createPostDto);
    return this.postsRepository.save(post);
  }

  async findAllAdmin(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      where: { status: 'published' },
      relations: ['author'],
      order: { publishDate: 'DESC' },
    });
  }

  async findRecent(limit?: number): Promise<Post[]> {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' })
      .orderBy('post.publishDate', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { slug },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    // Increment views
    post.views += 1;
    await this.postsRepository.save(post);
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, featuredImageFile?: Express.Multer.File): Promise<Post> {
    // Upload de la nouvelle image principale si fournie
    if (featuredImageFile) {
      const fileName = `post-${id}-${Date.now()}-${featuredImageFile.originalname}`;
      const { url } = await this.supabaseService.uploadFile(
        featuredImageFile.buffer,
        fileName,
        'posts',
      );
      updatePostDto.featuredImage = url;
    }

    await this.postsRepository.update(id, updatePostDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.postsRepository.delete(id);
  }

  async getComments(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { postId, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllComments(includeUnapproved: boolean = false): Promise<Comment[]> {
    const where: any = {};
    if (!includeUnapproved) {
      where.isApproved = true;
    }
    return this.commentsRepository.find({
      where,
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUnapprovedComments(): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { isApproved: false },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  async addComment(postId: number, userId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      postId,
      userId,
      isApproved: false, // Les commentaires nécessitent une approbation admin
    });
    return this.commentsRepository.save(comment);
  }

  async approveComment(commentId: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException(`Commentaire avec l'ID ${commentId} introuvable`);
    }
    comment.isApproved = true;
    return this.commentsRepository.save(comment);
  }

  async rejectComment(commentId: number): Promise<void> {
    const comment = await this.commentsRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException(`Commentaire avec l'ID ${commentId} introuvable`);
    }
    await this.commentsRepository.remove(comment);
  }

  async deleteComment(commentId: number): Promise<void> {
    const comment = await this.commentsRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException(`Commentaire avec l'ID ${commentId} introuvable`);
    }
    await this.commentsRepository.remove(comment);
  }
}

