'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '@/app/components/protected-route';
import RichTextEditor from '@/app/components/rich-text-editor';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import { ArticleDetail } from '@/app/types/blog';

const DEPT_SUGGESTIONS = ['Engineering', 'Design', 'Product', 'QA', 'DevOps', 'Data', 'HR', 'Sales'];
const TECH_SUGGESTIONS = ['React', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker',
  'Kubernetes', 'AWS', 'TypeScript', 'GraphQL', 'Redis', 'Node.js'];

function TagInput({ label, value, onChange, suggestions, placeholder }: {
  label: string; value: string[]; onChange: (v: string[]) => void;
  suggestions: string[]; placeholder: string;
}) {
  const [input, setInput] = useState('');
  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const add = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full border border-[#EBEEF0]">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}
              className="text-slate-400 hover:text-red-500 ml-1">×</button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input); } }}
          placeholder={placeholder}
          className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        {input && filtered.length > 0 && (
          <div className="absolute z-10 bg-white border border-[#EBEEF0] rounded-lg shadow mt-1 w-full max-h-40 overflow-y-auto">
            {filtered.map(s => (
              <button key={s} type="button" onClick={() => add(s)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1">Press Enter to add. Click suggestions to select.</p>
    </div>
  );
}

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [deptTags, setDeptTags] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('unsaved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const { data: article, isLoading } = useQuery<ArticleDetail>({
    queryKey: ['article', id],
    queryFn: () => api.get(`/blog/${id}`, { headers }).then(r => r.data)
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setTags(article.tags ?? []);
      setDeptTags(article.department_tags ?? []);
    }
  }, [article]);

  const saveDraft = useCallback(async (data: object) => {
    setSaveStatus('saving');
    try {
      await api.put(`/blog/${id}`, data, { headers });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
    }
  }, [id, token]);

  useEffect(() => {
    if (!title && !content) return;
    const timer = setTimeout(() => {
      saveDraft({ title, content, tags, department_tags: deptTags });
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, tags, deptTags, saveDraft]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await api.put(`/blog/${id}`, { title, content, tags, department_tags: deptTags }, { headers });
      await api.post(`/blog/${id}/submit`, {}, { headers });
      router.push('/blog');
    } catch {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />)}
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">← Back</button>
          <span className="text-xs text-slate-400">
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Draft saved' : ''}
          </span>
        </div>

        {article?.status === 'rejected' && article?.rejection_feedback && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Rejection Feedback</p>
            <p className="text-sm text-red-700">{article.rejection_feedback}</p>
          </div>
        )}

        <div className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Article title..."
            className="w-full text-3xl font-bold text-slate-800 border-none outline-none placeholder-slate-300 bg-transparent"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-[#EBEEF0]">
            <TagInput
              label="Technology Tags"
              value={tags}
              onChange={setTags}
              suggestions={TECH_SUGGESTIONS}
              placeholder="e.g. React, Python..."
            />
            <TagInput
              label="Department Tags"
              value={deptTags}
              onChange={setDeptTags}
              suggestions={DEPT_SUGGESTIONS}
              placeholder="e.g. Engineering, Design..."
            />
          </div>

          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your article here... use the toolbar for formatting, images, and links."
            minHeight="400px"
          />

          <div className="flex items-center justify-between pt-4 border-t border-[#EBEEF0]">
            <button
              type="button"
              onClick={() => saveDraft({ title, content, tags, department_tags: deptTags })}
              className="text-sm text-slate-500 border border-[#EBEEF0] px-4 py-2 rounded-lg hover:bg-slate-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className="text-sm bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Resubmit for Review'}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
