'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/app/components/protected-route';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import { ArticleListItem, BlogTags } from '@/app/types/blog';

function ArticleCard({ article, featured = false }: { article: ArticleListItem; featured?: boolean }) {
  const initials = (article.author_name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Link href={`/blog/${article.id}`}>
      <div className={`group border border-[#EBEEF0] rounded-xl p-5 hover:shadow-sm transition-shadow bg-white cursor-pointer h-full flex flex-col ${featured ? 'border-teal-200 bg-teal-50/30' : ''}`}>
        {article.is_recommended && (
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full w-fit mb-3 font-medium">
            ★ Recommended
          </span>
        )}
        <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors mb-2 line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-slate-500 line-clamp-3 flex-1 mb-3">{article.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
          {(article.tags ?? []).slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{tag}</span>
          ))}
          {(article.department_tags ?? []).slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#EBEEF0]">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
            {initials}
          </div>
          <div>
            <span className="text-xs font-medium text-slate-700">{article.author_name}</span>
            {article.author_designation && (
              <span className="text-xs text-slate-400 ml-1">· {article.author_designation}</span>
            )}
          </div>
          {article.published_at && (
            <span className="text-xs text-slate-400 ml-auto">
              {new Date(article.published_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BlogFeedPage() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeDeptTag, setActiveDeptTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: tagsData } = useQuery<BlogTags>({
    queryKey: ['blog-tags'],
    queryFn: () => api.get('/blog/tags', { headers }).then(r => r.data)
  });

  const { data, isLoading } = useQuery({
    queryKey: ['blog-feed', activeTag, activeDeptTag, search, page],
    queryFn: () => api.get('/blog', {
      headers,
      params: {
        tag: activeTag || undefined,
        department_tag: activeDeptTag || undefined,
        search: search || undefined,
        page,
        page_size: 18
      }
    }).then(r => r.data)
  });

  const articles: ArticleListItem[] = data?.items ?? [];
  const recommended = articles.filter(a => a.is_recommended);
  const rest = articles.filter(a => !a.is_recommended);

  const filterPill = (label: string, active: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap
        ${active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-[#EBEEF0] hover:border-slate-300'}`}
    >
      {label}
    </button>
  );

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tech Blog</h1>
            <p className="text-sm text-slate-500 mt-0.5">Knowledge shared by your colleagues</p>
          </div>
          <Link href="/blog/new">
            <button className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
              + Write Article
            </button>
          </Link>
        </div>

        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search articles..."
          className="w-full border border-[#EBEEF0] rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
        />

        <div className="space-y-2 mb-8">
          {(tagsData?.tech_tags?.length ?? 0) > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs text-slate-400 font-medium w-16 shrink-0">Tech</span>
              {filterPill('All', !activeTag, () => setActiveTag(null))}
              {tagsData!.tech_tags.map(tag =>
                filterPill(tag, activeTag === tag, () => { setActiveTag(activeTag === tag ? null : tag); setPage(1); })
              )}
            </div>
          )}
          {(tagsData?.department_tags?.length ?? 0) > 0 && (
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs text-slate-400 font-medium w-16 shrink-0">Dept</span>
              {filterPill('All', !activeDeptTag, () => setActiveDeptTag(null))}
              {tagsData!.department_tags.map(tag =>
                filterPill(tag, activeDeptTag === tag, () => { setActiveDeptTag(activeDeptTag === tag ? null : tag); setPage(1); })
              )}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {recommended.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base font-semibold text-slate-800">★ Recommended</span>
                  <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                    {recommended.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommended.map(a => <ArticleCard key={a.id} article={a} featured />)}
                </div>
                <hr className="mt-8 border-[#EBEEF0]" />
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-slate-800 mb-4">
                  {recommended.length > 0 ? 'More Articles' : 'All Articles'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              </section>
            )}

            {articles.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg mb-1">No articles found</p>
                <p className="text-sm">Try different filters or be the first to write one.</p>
              </div>
            )}

            {data?.total > data?.page_size && (
              <div className="flex justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm px-4 py-2 border border-[#EBEEF0] rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500 py-2">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={articles.length < data?.page_size}
                  className="text-sm px-4 py-2 border border-[#EBEEF0] rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
