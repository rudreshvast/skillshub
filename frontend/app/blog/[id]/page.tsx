'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/app/components/protected-route';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import { ArticleDetail, ArticleTask } from '@/app/types/blog';

const SENIOR_DESIGNATIONS = ['CTO', 'Architect', 'Delivery Head', 'Principal', 'Tech Lead'];

export default function ArticleReaderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const { data: article, isLoading } = useQuery<ArticleDetail>({
    queryKey: ['article', id],
    queryFn: () => api.get(`/blog/${id}`, { headers }).then(r => r.data)
  });

  const toggleComplete = useMutation({
    mutationFn: (taskId: number) => api.post(`/blog/tasks/${taskId}/complete`, {}, { headers }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['article', id] })
  });

  const toggleRecommend = useMutation({
    mutationFn: (value: boolean) => api.post(`/blog/${id}/recommend`, null, { headers, params: { value } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['article', id] })
  });

  if (isLoading) return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />)}
      </div>
    </ProtectedRoute>
  );

  if (!article) return null;

  const isAuthor = user?.id === article.author_id;
  const canRecommend = user?.role === 'hr' || SENIOR_DESIGNATIONS.includes(user?.designation ?? '');
  const initials = (article.author_name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-700">← Blog</Link>
          <div className="flex gap-2">
            {canRecommend && (
              <button
                onClick={() => toggleRecommend.mutate(!article.is_recommended)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
                  ${article.is_recommended
                    ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                    : 'text-slate-500 border-[#EBEEF0] hover:bg-slate-50'}`}
              >
                {article.is_recommended ? '★ Recommended' : '☆ Mark Recommended'}
              </button>
            )}
            {isAuthor && (
              <Link href={`/blog/${id}/edit`}>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-[#EBEEF0] text-slate-500 hover:bg-slate-50">
                  Edit
                </button>
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">{article.title}</h1>

        <div className="flex flex-wrap gap-2 mb-5">
          {(article.tags ?? []).map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">{tag}</span>
          ))}
          {(article.department_tags ?? []).map(tag => (
            <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full border border-purple-100">{tag}</span>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#EBEEF0]">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
            {initials}
          </div>
          <div>
            {article.author_employee_id ? (
              <Link href={`/people/${article.author_employee_id}`} className="text-sm font-medium text-slate-800 hover:text-teal-600">
                {article.author_name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-slate-800">{article.author_name}</span>
            )}
            <div className="text-xs text-slate-400">
              {article.author_designation}
              {article.published_at && ` · ${new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
            </div>
          </div>
          {article.is_recommended && (
            <span className="ml-auto text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">★ Recommended</span>
          )}
        </div>

        <div
          className="prose prose-sm max-w-none text-slate-700 mb-10"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {(article.tasks ?? []).length > 0 && (
          <section className="border border-[#EBEEF0] rounded-xl p-5 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              📋 Action Items ({article.tasks.length})
            </h2>
            <div className="space-y-2">
              {article.tasks.map((task: ArticleTask) => (
                <div key={task.id} className="flex items-start gap-3">
                  <button
                    onClick={() => toggleComplete.mutate(task.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                      ${task.completed_by_me
                        ? 'bg-teal-500 border-teal-500 text-white'
                        : 'border-slate-300 hover:border-teal-400'}`}
                  >
                    {task.completed_by_me && <span className="text-xs">✓</span>}
                  </button>
                  <div className="flex-1">
                    <span className={`text-sm ${task.completed_by_me ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {task.description}
                    </span>
                    {task.completion_count > 0 && (
                      <span className="text-xs text-slate-400 ml-2">{task.completion_count} done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ProtectedRoute>
  );
}
