'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import Link from 'next/link';
import { Plus, AlertCircle, RotateCcw } from 'lucide-react';
import { ProjectCard } from '@/types/projects';

const STATUS_OPTIONS = ['All', 'active', 'completed', 'paused'] as const;
const STATUS_LABELS = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
};

const STATUS_COLORS = {
  active: 'bg-[#DFFCF0] text-[#216E4E] border-[#216E4E]',
  completed: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  paused: 'bg-[#FFF7D6] text-[#974F0C] border-[#974F0C]',
};

export default function ProjectsPage() {
  const { token, user } = useAuthStore();
  const [status, setStatus] = useState<string | null>(null);
  const [domain, setDomain] = useState('');

  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects', { status, domain }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (domain) params.append('domain', domain);
      const response = await api.get(`/projects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  const isHROrManagement = user?.role === 'hr';

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (status && p.status !== status) return false;
      if (domain && !p.domain?.toLowerCase().includes(domain.toLowerCase())) return false;
      return true;
    });
  }, [projects, status, domain]);

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-800">Projects</h1>
              <p className="text-neutral-500 mt-1 text-sm">Manage and explore active projects</p>
            </div>
            {isHROrManagement && (
              <Link href="/projects/new">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white rounded-sm hover:bg-[#003FAA] transition font-medium text-sm">
                  <Plus size={18} />
                  New Project
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-neutral-0 border border-neutral-300 rounded-sm p-4 mb-6 shadow-sm">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
              <select
                value={status || 'all'}
                onChange={(e) => setStatus(e.target.value === 'all' ? null : e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-neutral-800 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-0 text-sm"
              >
                <option value="all">All Projects</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Domain</label>
              <input
                type="text"
                placeholder="Search domain..."
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-neutral-800 bg-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-0 text-sm"
              />
            </div>

            {(status || domain) && (
              <button
                onClick={() => {
                  setStatus(null);
                  setDomain('');
                }}
                className="inline-flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-800 transition text-sm font-medium"
              >
                <RotateCcw size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-[#FFECEB] border border-[#AE2A19] rounded-sm flex gap-3 shadow-sm">
            <AlertCircle size={20} className="text-[#AE2A19] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-[#5D1F1A]">Error loading projects</p>
              <p className="text-sm text-[#AE2A19] mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm text-[#AE2A19] hover:text-[#5D1F1A] font-medium underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-neutral-0 border border-neutral-300 rounded-sm p-6 animate-pulse shadow-sm">
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-full"></div>
                  <div className="h-4 bg-neutral-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-neutral-0 border border-neutral-300 rounded-sm shadow-sm">
            <div className="text-neutral-400 mb-3 text-6xl">📁</div>
            <p className="text-neutral-700 font-medium text-lg">No projects found</p>
            <p className="text-neutral-500 text-sm mt-1">
              {status || domain ? 'Try adjusting your filters' : 'Get started by creating a new project'}
            </p>
            {status || domain ? (
              <button
                onClick={() => {
                  setStatus(null);
                  setDomain('');
                }}
                className="mt-4 text-[#0052CC] hover:text-[#003FAA] font-medium text-sm"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-neutral-0 border border-neutral-300 rounded-sm p-5 hover:border-neutral-400 hover:shadow-md transition cursor-pointer h-full shadow-sm flex flex-col">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-neutral-800 text-base leading-snug truncate">{project.name}</h3>
                      {project.client && <p className="text-xs text-neutral-500 mt-1 truncate">{project.client}</p>}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-sm text-xs font-medium border whitespace-nowrap flex-shrink-0 ${STATUS_COLORS[project.status]}`}
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>

                  {project.domain && (
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-sm border border-neutral-200 font-medium">
                        {project.domain}
                      </span>
                    </div>
                  )}

                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="mb-4 flex-1">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, 3).map((tech) => (
                          <span key={tech} className="px-2 py-1 bg-[#DEEBFF] text-[#0052CC] text-xs rounded-sm border border-[#579DFF] font-medium">
                            {tech}
                          </span>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <span className="px-2 py-1 text-neutral-600 text-xs font-medium">
                            +{project.tech_stack.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-neutral-600 pt-4 mt-auto border-t border-neutral-200">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-800 font-medium">{project.team_size}</span>
                      <span>team member{project.team_size !== 1 ? 's' : ''}</span>
                    </div>
                    {project.start_date && (
                      <span className="text-neutral-500">
                        {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
