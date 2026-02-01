import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Idea } from './entities/idea.entity';
import { IdeaVote } from './entities/idea-vote.entity';
import { IdeaComment } from './entities/idea-comment.entity';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class IdeasService {
  constructor(
    @InjectRepository(Idea)
    private ideasRepository: Repository<Idea>,
    @InjectRepository(IdeaVote)
    private votesRepository: Repository<IdeaVote>,
    @InjectRepository(IdeaComment)
    private commentsRepository: Repository<IdeaComment>,
  ) {}

  async create(createIdeaDto: CreateIdeaDto, userId: number): Promise<Idea> {
    const idea = this.ideasRepository.create({
      ...createIdeaDto,
      authorId: userId,
      category: createIdeaDto.category || 'activity',
    });
    return this.ideasRepository.save(idea);
  }

  async findAll(
    category?: string,
    status?: string,
    sortBy: 'popular' | 'recent' | 'comments' = 'popular',
  ): Promise<Idea[]> {
    const query = this.ideasRepository.createQueryBuilder('idea')
      .leftJoinAndSelect('idea.author', 'author')
      .leftJoinAndSelect('idea.ideaVotes', 'votes')
      .loadRelationCountAndMap('idea.votesCount', 'idea.ideaVotes')
      .loadRelationCountAndMap('idea.commentsCount', 'idea.ideaComments');

    if (category) {
      query.andWhere('idea.category = :category', { category });
    }

    if (status) {
      query.andWhere('idea.status = :status', { status });
    }

    switch (sortBy) {
      case 'popular':
        query.orderBy('idea.votes', 'DESC');
        break;
      case 'recent':
        query.orderBy('idea.createdAt', 'DESC');
        break;
      case 'comments':
        query.orderBy('idea.commentsCount', 'DESC');
        break;
    }

    return query.getMany();
  }

  async findOne(id: number, userId?: number): Promise<any> {
    const idea = await this.ideasRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!idea) {
      throw new NotFoundException(`Idée avec l'ID ${id} introuvable`);
    }

    // Charger les commentaires séparément pour avoir un meilleur contrôle
    const comments = await this.commentsRepository.find({
      where: { ideaId: id },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });

    // Vérifier si l'utilisateur a voté
    let userVote = null;
    if (userId) {
      const vote = await this.votesRepository.findOne({
        where: { ideaId: id, userId },
      });
      if (vote) {
        userVote = vote.isUpvote ? 'upvote' : 'downvote';
      }
    }

    // Compter les votes
    const votesCount = await this.votesRepository.count({
      where: { ideaId: id, isUpvote: true },
    });

    const downvotesCount = await this.votesRepository.count({
      where: { ideaId: id, isUpvote: false },
    });

    return {
      ...idea,
      votes: votesCount - downvotesCount,
      userVote,
      commentsCount: comments.length,
      ideaComments: comments,
    };
  }

  async update(id: number, updateIdeaDto: UpdateIdeaDto, userId: number, isAdmin: boolean): Promise<Idea> {
    const idea = await this.ideasRepository.findOne({ where: { id } });

    if (!idea) {
      throw new NotFoundException(`Idée avec l'ID ${id} introuvable`);
    }

    // Seul l'auteur ou un admin peut modifier
    if (idea.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette idée');
    }

    Object.assign(idea, updateIdeaDto);
    return this.ideasRepository.save(idea);
  }

  async remove(id: number, userId: number, isAdmin: boolean): Promise<void> {
    const idea = await this.ideasRepository.findOne({ where: { id } });

    if (!idea) {
      throw new NotFoundException(`Idée avec l'ID ${id} introuvable`);
    }

    // Seul l'auteur ou un admin peut supprimer
    if (idea.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette idée');
    }

    await this.ideasRepository.remove(idea);
  }

  async vote(ideaId: number, userId: number, isUpvote: boolean): Promise<any> {
    const idea = await this.ideasRepository.findOne({ where: { id: ideaId } });

    if (!idea) {
      throw new NotFoundException(`Idée avec l'ID ${ideaId} introuvable`);
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await this.votesRepository.findOne({
      where: { ideaId, userId },
    });

    if (existingVote) {
      // Si c'est le même vote, on le supprime (toggle)
      if (existingVote.isUpvote === isUpvote) {
        await this.votesRepository.remove(existingVote);
        await this.updateVoteCount(ideaId);
        return { voted: false, isUpvote: null };
      } else {
        // Sinon, on change le vote
        existingVote.isUpvote = isUpvote;
        await this.votesRepository.save(existingVote);
        await this.updateVoteCount(ideaId);
        return { voted: true, isUpvote };
      }
    } else {
      // Nouveau vote
      const vote = this.votesRepository.create({
        ideaId,
        userId,
        isUpvote,
      });
      await this.votesRepository.save(vote);
      await this.updateVoteCount(ideaId);
      return { voted: true, isUpvote };
    }
  }

  async addComment(ideaId: number, userId: number, createCommentDto: CreateCommentDto): Promise<IdeaComment> {
    const idea = await this.ideasRepository.findOne({ where: { id: ideaId } });

    if (!idea) {
      throw new NotFoundException(`Idée avec l'ID ${ideaId} introuvable`);
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      ideaId,
      authorId: userId,
    });

    const savedComment = await this.commentsRepository.save(comment);
    await this.updateCommentsCount(ideaId);

    return this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });
  }

  async removeComment(commentId: number, userId: number, isAdmin: boolean): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['idea'],
    });

    if (!comment) {
      throw new NotFoundException(`Commentaire avec l'ID ${commentId} introuvable`);
    }

    // Seul l'auteur ou un admin peut supprimer
    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce commentaire');
    }

    await this.commentsRepository.remove(comment);
    await this.updateCommentsCount(comment.ideaId);
  }

  private async updateVoteCount(ideaId: number): Promise<void> {
    const upvotes = await this.votesRepository.count({
      where: { ideaId, isUpvote: true },
    });
    const downvotes = await this.votesRepository.count({
      where: { ideaId, isUpvote: false },
    });
    const votes = upvotes - downvotes;

    await this.ideasRepository.update(ideaId, { votes });
  }

  private async updateCommentsCount(ideaId: number): Promise<void> {
    const count = await this.commentsRepository.count({
      where: { ideaId },
    });
    await this.ideasRepository.update(ideaId, { commentsCount: count });
  }
}
