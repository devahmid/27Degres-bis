import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { IdeaVote } from './idea-vote.entity';
import { IdeaComment } from './idea-comment.entity';

@Entity('ideas')
export class Idea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'activity',
  })
  category: 'activity' | 'project' | 'improvement' | 'event';

  @Column({
    type: 'varchar',
    length: 50,
    default: 'idea',
  })
  status: 'idea' | 'discussion' | 'validated' | 'in_progress' | 'completed' | 'archived';

  @Column({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'estimated_budget', type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedBudget?: number;

  @Column({ type: 'int', default: 0 })
  votes: number;

  @Column({ type: 'int', default: 0 })
  commentsCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => IdeaVote, (vote) => vote.idea)
  ideaVotes: IdeaVote[];

  @OneToMany(() => IdeaComment, (comment) => comment.idea)
  ideaComments: IdeaComment[];
}
