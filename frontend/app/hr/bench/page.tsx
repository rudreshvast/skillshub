'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import ProtectedRoute from '@/components/protected-route';
import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { BenchPoolEmployee } from '@/types/projects';

const getDaysOnBenchColor = (days: number) => {
  if (days <= 7) return 'bg-green-100 text-green-800 border-green-300';
  if (days <= 30) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
};

export default function BenchPoolPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<BenchPoolEmployee | null>(null);
  const [showQuickAllocate, setShowQuickAllocate] = useState(false);

  const { data: benchPool = [], isLoading, error } = useQuery({
    queryKey: ['bench-pool'],
    queryFn: async () => {
      const response = await api.get('/projects/bench', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-active'],
    queryFn: async () => {
      const response = await api.get('/projects?status=active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  const allocateMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/projects/${data.projectId}/allocations`, {
        employee_id: data.employeeId,
        allocation_percentage: data.allocationPercentage,
        role_in_project: data.roleInProject,
        start_date: data.startDate,
        end_date: null,
        notes: data.notes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bench-pool'] });
      setShowQuickAllocate(false);
      setSelectedEmployee(null);
    },
  });

  if (!token) {
    return <div className="p-6 text-center text-slate-600">Please log in</div>;
  }

  return (
    <ProtectedRoute requiredPermission="hr">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Resource Bench</h1>
            <p className="text-slate-600 mt-1">
              {benchPool.length === 0
                ? 'All employees are currently allocated to projects'
                : `${benchPool.length} employee${benchPool.length !== 1 ? 's' : ''} available for allocation`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error instanceof Error ? error.message : 'Error loading bench pool'}</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-[#EBEEF0] p-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : benchPool.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EBEEF0] p-12 text-center">
              <Clock size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No employees on bench</p>
              <p className="text-sm text-slate-500 mt-1">All your team members are actively allocated</p>
            </div>
          ) : (
            <div className="space-y-3">
              {benchPool.map((employee) => (
                <div
                  key={employee.employee_id}
                  className="bg-white rounded-lg border border-[#EBEEF0] p-4 flex items-center justify-between hover:shadow-sm transition"
                >
                  <div className="flex-1">
                    <Link href={`/people/${employee.employee_id}`}>
                      <p className="font-medium text-teal-600 hover:text-teal-700 cursor-pointer">
                        {employee.name}
                      </p>
                    </Link>
                    <div className="flex gap-3 mt-1 text-sm text-slate-600">
                      <span>{employee.designation}</span>
                      <span>•</span>
                      <span>{employee.department}</span>
                      <span>•</span>
                      <span className="capitalize">{employee.seniority}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDaysOnBenchColor(employee.days_on_bench)}`}>
                      {employee.days_on_bench} days
                    </span>
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowQuickAllocate(true);
                      }}
                      className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition whitespace-nowrap"
                    >
                      Allocate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showQuickAllocate && selectedEmployee && (
          <QuickAllocateModal
            employee={selectedEmployee}
            projects={projects}
            onClose={() => {
              setShowQuickAllocate(false);
              setSelectedEmployee(null);
            }}
            onSubmit={(data) => allocateMutation.mutate({ ...data, employeeId: selectedEmployee.employee_id })}
            isLoading={allocateMutation.isPending}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function QuickAllocateModal({ employee, projects, onClose, onSubmit, isLoading }: any) {
  const [projectId, setProjectId] = useState('');
  const [roleInProject, setRoleInProject] = useState('');
  const [allocationPercentage, setAllocationPercentage] = useState(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !roleInProject) return;

    onSubmit({
      projectId: parseInt(projectId),
      roleInProject,
      allocationPercentage,
      startDate,
      notes: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Allocate {employee.name}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-[#EBEEF0] rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select a project...</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role in Project</label>
            <input
              type="text"
              value={roleInProject}
              onChange={(e) => setRoleInProject(e.target.value)}
              placeholder="e.g., Developer, Manager"
              className="w-full px-3 py-2 border border-[#EBEEF0] rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Allocation %: <span className="text-teal-600 font-bold">{allocationPercentage}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={allocationPercentage}
              onChange={(e) => setAllocationPercentage(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#EBEEF0] rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !projectId || !roleInProject}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Allocating...' : 'Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
