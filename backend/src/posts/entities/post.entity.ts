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
import { Comment } from './comment.entity';
import { PostTagRelation } from './post-tag-relation.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true, length: 300 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'featured_image', nullable: true, length: 500 })
  featuredImage?: string;

  @Column({ nullable: true, length: 100 })
  category?: string;

  @Column({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'publish_date', type: 'timestamp', nullable: true })
  publishDate?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status: 'draft' | 'published';

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostTagRelation, (relation) => relation.post)
  tagRelations: PostTagRelation[];
}

