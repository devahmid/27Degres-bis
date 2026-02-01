export interface Idea {
  id: number;
  title: string;
  description: string;
  category: 'activity' | 'project' | 'improvement' | 'event';
  status: 'idea' | 'discussion' | 'validated' | 'in_progress' | 'completed' | 'archived';
  authorId: number;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
  estimatedBudget?: number;
  votes: number;
  commentsCount: number;
  userVote?: 'upvote' | 'downvote' | null;
  ideaComments?: IdeaComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IdeaComment {
  id: number;
  content: string;
  ideaId: number;
  authorId: number;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
