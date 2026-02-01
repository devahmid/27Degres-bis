import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Idea } from './idea.entity';
import { User } from '../../users/entities/user.entity';

@Entity('idea_votes')
@Unique(['ideaId', 'userId'])
export class IdeaVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idea_id' })
  ideaId: number;

  @ManyToOne(() => Idea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idea_id' })
  idea: Idea;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'boolean', default: true })
  isUpvote: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
