'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/app/context/auth';
import api from '@/app/lib/api';
import ProtectedRoute from '@/components/protected-route';
import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, Briefcase } from 'lucide-react';

interface MyAllocation {
  id: number;
  project_id: number;
  project_name: string;
  project_status: string;
  role_in_project: string;
  allocation_percentage: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export default function AllocationsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');

  const { data: allocations = [], isLoading, error } = useQuery({
    queryKey: ['my-allocations'],
    queryFn: async () => {
      const response = await api.get('/projects/my-allocations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
  });

  const today = new Date();
  const currentAllocations = allocations.filter(
    (a: MyAllocation) => !a.end_date || new Date(a.end_date) >= today
  );
  const pastAllocations = allocations.filter(
    (a: MyAllocation) => a.end_date && new Date(a.end_date) < today
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'paused':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getAllocationColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 25) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (!token) {
    return <div className="p-6 text-center text-slate-600">Please log in</div>;
  }

  return (
    <ProtectedRoute requiredRole="employee">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Project Allocations</h1>
            <p className="text-slate-600 mt-1">
              {allocations.length === 0
                ? 'You are not currently assigned to any projects'
                : `You are assigned to ${currentAllocations.length} project${currentAllocations.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error instanceof Error ? error.message : 'Error loading allocations'}</p>
            </div>
          )}

          <div className="bg-white rounded-lg border border-[#EBEEF0] mb-6 inline-flex">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'current'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current ({currentAllocations.length})
            </button>
            <div className="border-r border-[#EBEEF0]"></div>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'past'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past ({pastAllocations.length})
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-[#EBEEF0] p-6 animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : activeTab === 'current' ? (
            currentAllocations.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#EBEEF0] p-12 text-center">
                <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium">No active allocations</p>
                <p className="text-sm text-slate-500 mt-1">You are not currently assigned to any projects</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentAllocations.map((alloc: MyAllocation) => (
                  <Link key={alloc.id} href={`/projects/${alloc.project_id}`}>
                    <div className="bg-white rounded-lg border border-[#EBEEF0] p-6 hover:shadow-md transition cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-teal-600 hover:text-teal-700">
                            {alloc.project_name}
                          </h3>
                          <p className="text-slate-600 mt-1">{alloc.role_in_project}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(alloc.project_status)}`}>
                            {alloc.project_status.charAt(0).toUpperCase() + alloc.project_status.slice(1)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getAllocationColor(alloc.allocation_percentage)}`}>
                            {alloc.allocation_percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 pt-4 border-t border-[#EBEEF0]">
                        {alloc.start_date && (
                          <span>
                            Since {new Date(alloc.start_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                        {alloc.notes && (
                          <span className="text-slate-500 italic">
                            {alloc.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : pastAllocations.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EBEEF0] p-12 text-center">
              <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No past allocations</p>
              <p className="text-sm text-slate-500 mt-1">You haven't completed any project allocations yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAllocations.map((alloc: MyAllocation) => (
                <Link key={alloc.id} href={`/projects/${alloc.project_id}`}>
                  <div className="bg-white rounded-lg border border-[#EBEEF0] p-6 hover:shadow-md transition cursor-pointer opacity-75">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-600">
                          {alloc.project_name}
                        </h3>
                        <p className="text-slate-500 mt-1">{alloc.role_in_project}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-300 whitespace-nowrap ml-4">
                        Completed
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 pt-4 border-t border-[#EBEEF0]">
                      {alloc.start_date && alloc.end_date && (
                        <span>
                          {new Date(alloc.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })} - {new Date(alloc.end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
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
    </ProtectedRoute>
  );
}
