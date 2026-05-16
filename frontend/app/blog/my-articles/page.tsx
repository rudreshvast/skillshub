'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/app/components/protected-route';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import { ArticleListItem } from '@/app/types/blog';

export default function MyArticlesPage() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const { data: articles = [], isLoading } = useQuery<ArticleListItem[]>({
    queryKey: ['my-articles'],
    queryFn: () => api.get('/blog/my-articles', { headers }).then(r => r.data)
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700';
      case 'pending_review':
        return 'bg-amber-100 text-amber-700';
      case 'published':
        return 'bg-teal-100 text-teal-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Articles</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage and track your published articles</p>
          </div>
          <Link href="/blog/new">
            <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
              + Write Article
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 border border-[#EBEEF0] rounded-xl bg-slate-50">
            <p className="text-slate-400 text-lg mb-2">No articles yet</p>
            <p className="text-slate-500 text-sm mb-6">Start sharing your knowledge with your team</p>
            <Link href="/blog/new">
              <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
                Write Your First Article
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map(article => (
              <div key={article.id} className="border border-[#EBEEF0] rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{article.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{article.excerpt}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0 font-medium ${getStatusColor(article.status)}`}>
                    {getStatusLabel(article.status)}
                  </span>
                </div>

                {article.status === 'rejected' && article.rejection_feedback && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                    <p className="text-xs font-medium text-red-800 mb-1">Rejection Feedback</p>
                    <p className="text-sm text-red-700">{article.rejection_feedback}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {article.created_at && (
                      <span>Created {new Date(article.created_at).toLocaleDateString()}</span>
                    )}
                    {article.published_at && (
                      <span>Published {new Date(article.published_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {article.status === 'draft' && (
                      <Link href={`/blog/${article.id}/edit`}>
                        <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                          Continue Editing
                        </button>
                      </Link>
                    )}
                    {article.status === 'rejected' && (
                      <Link href={`/blog/${article.id}/edit`}>
                        <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                          Edit & Resubmit
                        </button>
                      </Link>
                    )}
                    {article.status === 'published' && (
                      <Link href={`/blog/${article.id}`}>
                        <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                          View
                        </button>
                      </Link>
                    )}
                    {article.status === 'pending_review' && (
                      <span className="text-xs text-slate-400">Awaiting review...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
