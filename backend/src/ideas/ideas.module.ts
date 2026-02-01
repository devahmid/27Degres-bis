import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { Idea } from './entities/idea.entity';
import { IdeaVote } from './entities/idea-vote.entity';
import { IdeaComment } from './entities/idea-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Idea, IdeaVote, IdeaComment])],
  controllers: [IdeasController],
  providers: [IdeasService],
  exports: [IdeasService],
})
export class IdeasModule {}
