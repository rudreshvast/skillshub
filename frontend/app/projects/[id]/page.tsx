'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ExternalLink, Users, Trash2, AlertCircle } from 'lucide-react';
import { ProjectDetail, AllocationMember, Innovation, Shortcoming } from '@/types/projects';
import KnowledgeBaseModal from '@/app/components/projects/knowledge-base-modal';
import { SkillPill } from '@/app/components/people/skill-pill';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [innovationModal, setInnovationModal] = useState<{
    open: boolean; editing: Innovation | null
  }>({ open: false, editing: null });
  const [shortcomingModal, setShortcomingModal] = useState<{
    open: boolean; editing: Shortcoming | null
  }>({ open: false, editing: null });

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data as ProjectDetail;
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      window.location.href = '/projects';
    },
  });

  const saveInnovation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      innovationModal.editing
        ? api.put(`/projects/${projectId}/innovations/${innovationModal.editing.id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : api.post(`/projects/${projectId}/innovations`, data, {
            headers: { Authorization: `Bearer ${token}` },
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setInnovationModal({ open: false, editing: null });
    },
  });

  const deleteInnovation = useMutation({
    mutationFn: (innovId: number) =>
      api.delete(`/projects/${projectId}/innovations/${innovId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  const saveShortcoming = useMutation({
    mutationFn: (data: { title: string; content: string; linked_skill?: string }) =>
      shortcomingModal.editing
        ? api.put(`/projects/${projectId}/shortcomings/${shortcomingModal.editing.id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : api.post(`/projects/${projectId}/shortcomings`, data, {
            headers: { Authorization: `Bearer ${token}` },
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setShortcomingModal({ open: false, editing: null });
    },
  });

  const deleteShortcoming = useMutation({
    mutationFn: (scId: number) =>
      api.delete(`/projects/${projectId}/shortcomings/${scId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
  });

  const isHROrManagement = user?.role === 'hr';

  const getLinkIcon = (key: string) => {
    switch (key) {
      case 'github':
        return '⚡';
      case 'jira':
        return '📋';
      case 'confluence':
        return '📝';
      default:
        return '🔗';
    }
  };

  if (!token) {
    return <div className="p-6 text-center text-slate-600">Please log in to view project details</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-[#EBEEF0] p-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error loading project</p>
              <p className="text-sm text-red-700 mt-1">{error instanceof Error ? error.message : 'Project not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/projects" className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 mb-6">
          <ChevronLeft size={20} />
          Projects
        </Link>

        <div className="bg-white rounded-lg border border-[#EBEEF0] p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900">{project.name}</h1>
              {project.client && <p className="text-lg text-slate-600 mt-2">{project.client}</p>}
            </div>
            {isHROrManagement && (
              <div className="flex gap-2 ml-4">
                <Link href={`/projects/${projectId}/edit`}>
                  <button className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition">
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap mb-6 pt-4 border-t border-[#EBEEF0]">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
              project.status === 'active' ? 'bg-teal-100 text-teal-800 border-teal-300' :
              project.status === 'completed' ? 'bg-gray-100 text-gray-800 border-gray-300' :
              'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>

            {project.domain && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded border border-slate-200">
                {project.domain}
              </span>
            )}

            {project.start_date && (
              <span className="text-sm text-slate-600">
                {new Date(project.start_date).toLocaleDateString()}
                {project.end_date && ` → ${new Date(project.end_date).toLocaleDateString()}`}
                {!project.end_date && ' → Ongoing'}
              </span>
            )}
          </div>

          {project.links && Object.entries(project.links).length > 0 && (
            <div className="flex gap-4 pt-4 border-t border-[#EBEEF0]">
              {Object.entries(project.links).map(([key, value]) => (
                <a
                  key={key}
                  href={value as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 transition"
                >
                  <span>{getLinkIcon(key)}</span>
                  <span className="capitalize">{key}</span>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>
          )}
        </div>

        {project.description && (
          <div className="bg-white rounded-lg border border-[#EBEEF0] p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </div>
        )}

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="bg-white rounded-lg border border-[#EBEEF0] p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <Link key={tech} href={`/people/skills/${encodeURIComponent(tech)}`}>
                  <span className="px-3 py-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition cursor-pointer">
                    {tech}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-[#EBEEF0] p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users size={24} className="text-slate-600" />
              <h2 className="text-xl font-bold text-slate-900">Current Team ({project.current_team.length})</h2>
            </div>
            {isHROrManagement && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm"
              >
                + Add Member
              </button>
            )}
          </div>

          {project.current_team.length === 0 ? (
            <p className="text-slate-500 py-4">No team members currently assigned</p>
          ) : (
            <div className="space-y-3">
              {project.current_team.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-[#EBEEF0] rounded-lg">
                  <div className="flex-1">
                    <Link href={`/people/${member.employee_id}`}>
                      <p className="font-medium text-teal-600 hover:text-teal-700 cursor-pointer">{member.employee_name}</p>
                    </Link>
                    <div className="flex gap-3 mt-1 text-sm text-slate-600">
                      <span>{member.role_in_project}</span>
                      <span>•</span>
                      <span>{member.employee_designation}</span>
                      <span>•</span>
                      <span>{member.employee_department}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`px-3 py-1 rounded text-sm font-medium ${
                      member.allocation_percentage >= 50 ? 'bg-green-100 text-green-800' :
                      member.allocation_percentage >= 25 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.allocation_percentage}%
                    </div>
                    {member.start_date && (
                      <p className="text-xs text-slate-500 mt-1">
                        Since {new Date(member.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {project.past_team && project.past_team.length > 0 && (
          <details className="bg-white rounded-lg border border-[#EBEEF0]">
            <summary className="cursor-pointer p-8 flex items-center justify-between hover:bg-slate-50 transition">
              <h2 className="text-xl font-bold text-slate-900">Past Team ({project.past_team.length})</h2>
              <span className="text-slate-500">▼</span>
            </summary>
            <div className="border-t border-[#EBEEF0] p-8 space-y-3">
              {project.past_team.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-[#EBEEF0] rounded-lg opacity-75">
                  <div className="flex-1">
                    <Link href={`/people/${member.employee_id}`}>
                      <p className="font-medium text-slate-600 hover:text-slate-700 cursor-pointer">{member.employee_name}</p>
                    </Link>
                    <div className="flex gap-3 mt-1 text-sm text-slate-500">
                      <span>{member.role_in_project}</span>
                      <span>•</span>
                      <span>{member.employee_designation}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4 text-xs text-slate-500">
                    {member.start_date && member.end_date && (
                      <p>
                        {new Date(member.start_date).toLocaleDateString()} - {new Date(member.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* ── Innovations ────────────────────────────────── */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h2 className="text-lg font-semibold text-slate-800">Innovations</h2>
              <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                {project.innovations?.length ?? 0}
              </span>
            </div>
            {isHROrManagement && (
              <button
                onClick={() => setInnovationModal({ open: true, editing: null })}
                className="text-sm text-teal-600 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50"
              >
                + Add Innovation
              </button>
            )}
          </div>

          {project.innovations?.length === 0 && (
            <p className="text-sm text-slate-400 italic">No innovations recorded yet.</p>
          )}

          <div className="space-y-4">
            {project.innovations?.map((innov: Innovation) => (
              <div key={innov.id} className="border border-[#EBEEF0] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-semibold text-slate-800">{innov.title}</h3>
                  {isHROrManagement && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setInnovationModal({ open: true, editing: innov })}
                        className="text-xs text-slate-500 hover:text-teal-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this innovation?'))
                            deleteInnovation.mutate(innov.id);
                        }}
                        className="text-xs text-slate-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className="prose prose-sm max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: innov.content }}
                />
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#EBEEF0]">
                  <span className="text-xs text-slate-400">by {innov.created_by_name}</span>
                  {innov.created_at && (
                    <span className="text-xs text-slate-300">
                      · {new Date(innov.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Shortcomings ────────────────────────────────── */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <h2 className="text-lg font-semibold text-slate-800">Shortcomings</h2>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                {project.shortcomings?.length ?? 0}
              </span>
            </div>
            {isHROrManagement && (
              <button
                onClick={() => setShortcomingModal({ open: true, editing: null })}
                className="text-sm text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50"
              >
                + Add Shortcoming
              </button>
            )}
          </div>

          {project.shortcomings?.length === 0 && (
            <p className="text-sm text-slate-400 italic">No shortcomings recorded yet.</p>
          )}

          <div className="space-y-4">
            {project.shortcomings?.map((sc: Shortcoming) => (
              <div key={sc.id} className="border border-[#EBEEF0] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-slate-800">{sc.title}</h3>
                    {sc.linked_skill && <SkillPill skill={sc.linked_skill} clickable size="sm" />}
                  </div>
                  {isHROrManagement && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setShortcomingModal({ open: true, editing: sc })}
                        className="text-xs text-slate-500 hover:text-amber-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this shortcoming?'))
                            deleteShortcoming.mutate(sc.id);
                        }}
                        className="text-xs text-slate-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className="prose prose-sm max-w-none text-slate-600"
                  dangerouslySetInnerHTML={{ __html: sc.content }}
                />
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#EBEEF0]">
                  <span className="text-xs text-slate-400">by {sc.created_by_name}</span>
                  {sc.created_at && (
                    <span className="text-xs text-slate-300">
                      · {new Date(sc.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modals */}
      <KnowledgeBaseModal
        isOpen={innovationModal.open}
        onClose={() => setInnovationModal({ open: false, editing: null })}
        onSave={(data) => saveInnovation.mutate(data)}
        mode="innovation"
        initialData={innovationModal.editing}
        isSaving={saveInnovation.isPending}
      />

      <KnowledgeBaseModal
        isOpen={shortcomingModal.open}
        onClose={() => setShortcomingModal({ open: false, editing: null })}
        onSave={(data) => saveShortcoming.mutate(data)}
        mode="shortcoming"
        initialData={shortcomingModal.editing}
        isSaving={saveShortcoming.isPending}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Project?</h3>
            <p className="text-slate-600 mb-6">This action cannot be undone. All allocations will be removed.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
