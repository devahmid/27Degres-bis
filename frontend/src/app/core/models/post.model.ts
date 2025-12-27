export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category?: string;
  authorId: number;
  author?: {
    firstName: string;
    lastName: string;
  };
  publishDate?: Date;
  status: 'draft' | 'published';
  views: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  user?: {
    firstName: string;
    lastName: string;
  };
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}









