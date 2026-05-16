export interface ArticleListItem {
  id: number;
  title: string;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  is_recommended: boolean;
  tags?: string[];
  department_tags?: string[];
  author_id: number;
  author_name?: string;
  author_designation?: string;
  author_department?: string;
  author_employee_id?: number;
  excerpt?: string;
  created_at?: string;
  published_at?: string;
}

export interface ArticleTask {
  id: number;
  article_id: number;
  description: string;
  created_by: number;
  completion_count: number;
  completed_by_me: boolean;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  rejection_feedback?: string;
  updated_at?: string;
  tasks: ArticleTask[];
}

export interface BlogFeedResponse {
  items: ArticleListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface BlogTags {
  tech_tags: string[];
  department_tags: string[];
}
