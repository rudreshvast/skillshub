'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/app/components/protected-route';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import { ArticleListItem, ArticleDetail, ArticleTask } from '@/app/types/blog';

const SENIOR_DESIGNATIONS = ['CTO', 'Architect', 'Delivery Head', 'Principal', 'Tech Lead'];

export default function BlogModerationPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'all'>('pending');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const { data: pendingData } = useQuery({
    queryKey: ['blog-pending'],
    queryFn: () => api.get('/blog/pending', { headers }).then(r => r.data)
  });

  const { data: selectedArticle } = useQuery<ArticleDetail | null>({
    queryKey: ['article', selectedArticleId],
    queryFn: selectedArticleId ? () => api.get(`/blog/${selectedArticleId}`, { headers }).then(r => r.data) : () => Promise.resolve(null),
    enabled: !!selectedArticleId
  });

  const approveMutation = useMutation({
    mutationFn: () => api.post(`/blog/${selectedArticleId}/approve`, {}, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-pending'] });
      queryClient.invalidateQueries({ queryKey: ['article', selectedArticleId] });
      queryClient.invalidateQueries({ queryKey: ['blog-feed'] });
      setSelectedArticleId(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.post(`/blog/${selectedArticleId}/reject`, { feedback: rejectionFeedback || null }, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-pending'] });
      queryClient.invalidateQueries({ queryKey: ['article', selectedArticleId] });
      setSelectedArticleId(null);
      setShowRejectForm(false);
      setRejectionFeedback('');
    }
  });

  const toggleRecommendMutation = useMutation({
    mutationFn: (value: boolean) => api.post(`/blog/${selectedArticleId}/recommend`, null, { headers, params: { value } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', selectedArticleId] });
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: () => api.post(`/blog/${selectedArticleId}/tasks`, { description: newTaskDesc }, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', selectedArticleId] });
      setNewTaskDesc('');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => api.delete(`/blog/tasks/${taskId}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', selectedArticleId] });
    }
  });

  const canRecommend = user?.role === 'hr' || SENIOR_DESIGNATIONS.includes(user?.designation ?? '');

  // Get articles based on tab
  const getArticles = () => {
    const pending = pendingData?.items || [];
    if (activeTab === 'pending') return pending.filter((a: ArticleListItem) => a.status === 'pending_review');
    if (activeTab === 'published') return pending.filter((a: ArticleListItem) => a.status === 'published');
    return pending;
  };

  const articles = getArticles();
  const pendingCount = pendingData?.items?.filter((a: ArticleListItem) => a.status === 'pending_review').length || 0;

  const initials = (selectedArticle?.author_name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ProtectedRoute requiredPermission="hr_or_management">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Blog Moderation</h1>

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Left panel - Article list */}
          <div className="col-span-4 border border-[#EBEEF0] rounded-xl overflow-hidden flex flex-col bg-white">
            {/* Tabs */}
            <div className="flex border-b border-[#EBEEF0]">
              {(['pending', 'published', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedArticleId(null); }}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-teal-600 border-teal-600 bg-teal-50/30'
                      : 'text-slate-500 border-transparent hover:text-slate-600'
                  }`}
                >
                  {tab === 'pending' && `Pending (${pendingCount})`}
                  {tab === 'published' && 'Published'}
                  {tab === 'all' && 'All'}
                </button>
              ))}
            </div>

            {/* Article list */}
            <div className="overflow-y-auto flex-1">
              {articles.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">
                  No articles in this category
                </div>
              ) : (
                articles.map((article: ArticleListItem) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticleId(article.id)}
                    className={`w-full text-left px-4 py-3 border-b border-[#EBEEF0] hover:bg-slate-50 transition-colors ${
                      selectedArticleId === article.id ? 'bg-teal-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium text-slate-800 line-clamp-2 flex-1">{article.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0
                        ${article.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                          article.status === 'published' ? 'bg-teal-100 text-teal-700' :
                          'bg-slate-100 text-slate-600'}`}>
                        {article.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{article.author_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {article.author_designation}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel - Article detail */}
          <div className="col-span-8 border border-[#EBEEF0] rounded-xl overflow-hidden flex flex-col bg-white">
            {!selectedArticle ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-center">
                <p>Select an article to review</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#EBEEF0]">
                  <h2 className="text-lg font-semibold text-slate-800 mb-2">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{selectedArticle.author_name}</p>
                      <p className="text-xs text-slate-500">{selectedArticle.author_designation}</p>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full
                      ${selectedArticle.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                        selectedArticle.status === 'published' ? 'bg-teal-100 text-teal-700' :
                        'bg-slate-100 text-slate-600'}`}>
                      {selectedArticle.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 py-4">
                  <div
                    className="prose prose-sm max-w-none text-slate-700 mb-6"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  />

                  {/* Tasks */}
                  {(selectedArticle.tasks ?? []).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Tasks</h3>
                      <div className="space-y-2 mb-3">
                        {selectedArticle.tasks.map((task: ArticleTask) => (
                          <div key={task.id} className="flex items-start justify-between gap-2 p-2 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-700 flex-1">{task.description}</span>
                            <button
                              onClick={() => deleteTaskMutation.mutate(task.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTaskDesc}
                          onChange={e => setNewTaskDesc(e.target.value)}
                          placeholder="Add task..."
                          className="flex-1 text-sm border border-[#EBEEF0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newTaskDesc.trim()) {
                              addTaskMutation.mutate();
                            }
                          }}
                        />
                        <button
                          onClick={() => addTaskMutation.mutate()}
                          disabled={!newTaskDesc.trim() || addTaskMutation.isPending}
                          className="text-sm bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-[#EBEEF0] space-y-3">
                  {selectedArticle.status === 'pending_review' && (
                    <>
                      {!showRejectForm ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() => approveMutation.mutate()}
                            disabled={approveMutation.isPending}
                            className="flex-1 text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
                          >
                            Approve & Publish
                          </button>
                          <button
                            onClick={() => setShowRejectForm(true)}
                            className="text-sm px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            value={rejectionFeedback}
                            onChange={e => setRejectionFeedback(e.target.value)}
                            placeholder="Rejection feedback (optional)..."
                            className="w-full text-sm border border-[#EBEEF0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => rejectMutation.mutate()}
                              disabled={rejectMutation.isPending}
                              className="flex-1 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                              Send Rejection
                            </button>
                            <button
                              onClick={() => { setShowRejectForm(false); setRejectionFeedback(''); }}
                              className="text-sm px-4 py-2 border border-[#EBEEF0] text-slate-600 rounded-lg hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedArticle.status === 'published' && canRecommend && (
                    <button
                      onClick={() => toggleRecommendMutation.mutate(!selectedArticle.is_recommended)}
                      className={`w-full text-sm px-4 py-2 rounded-lg border transition-colors
                        ${selectedArticle.is_recommended
                          ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                          : 'text-slate-600 border-[#EBEEF0] hover:bg-slate-50'}`}
                    >
                      {selectedArticle.is_recommended ? '★ Mark Not Recommended' : '☆ Mark Recommended'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
