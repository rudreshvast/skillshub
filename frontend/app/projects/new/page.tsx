'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/app/components/protected-route';
import RichTextEditor from '@/app/components/rich-text-editor';

export default function CreateProjectPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [domain, setDomain] = useState('');
  const [techStack, setTechStack] = useState('');
  const [status, setStatus] = useState('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        description,
        client: client.trim() || null,
        domain: domain.trim() || null,
        tech_stack: techStack.split(',').map((t) => t.trim()).filter(Boolean),
        status,
        start_date: startDate || null,
        end_date: endDate || null,
      };

      const response = await api.post('/projects', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push(`/projects/${data.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to create project');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Project name and description are required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <ProtectedRoute requiredPermission="hr">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/projects" className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 mb-6">
            <ChevronLeft size={20} />
            Projects
          </Link>

          <div className="bg-white rounded-lg border border-[#EBEEF0] p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">New Project</h1>
            <p className="text-slate-600 mb-8">Create a new project and assign team members.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Mobile App Redesign"
                  className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Client & Domain */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Client</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Acme Inc."
                    className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. FinTech, Healthcare"
                    className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tech Stack</label>
                <input
                  type="text"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. React, Node.js, PostgreSQL (comma-separated)"
                  className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-400 mt-1">Separate technologies with commas</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe the project goals, scope, and approach..."
                  minHeight="200px"
                />
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-[#EBEEF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Link href="/projects">
                  <button
                    type="button"
                    className="px-6 py-2 border border-[#EBEEF0] text-slate-600 rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
