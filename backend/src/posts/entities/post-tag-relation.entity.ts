import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';
import { PostTag } from './post-tag.entity';

@Entity('post_tag_relations')
export class PostTagRelation {
  @PrimaryColumn({ name: 'post_id' })
  postId: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @PrimaryColumn({ name: 'tag_id' })
  tagId: number;

  @ManyToOne(() => PostTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: PostTag;
}

