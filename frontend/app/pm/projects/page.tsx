"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/app/components/protected-route";
import { getProjects } from "@/app/lib/projects";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  on_hold: "bg-amber-100 text-amber-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage projects and team allocations
              </p>
            </div>
            <Link
              href="/pm/projects/new"
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus size={20} />
              New Project
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader size={32} className="text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <p className="font-medium text-red-900">Failed to load projects</p>
                <p className="text-red-700 text-sm">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start allocating team members.
              </p>
              <Link
                href="/pm/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                <Plus size={18} />
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/pm/projects/${project.id}`}
                  className="block bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors">
                        {project.name}
                      </h2>
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-4 text-sm text-gray-600">
                        {project.start_date && (
                          <span>Start: {project.start_date}</span>
                        )}
                        {project.end_date && (
                          <span>End: {project.end_date}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[project.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {project.status.replace("_", " ").charAt(0).toUpperCase() +
                          project.status.replace("_", " ").slice(1)}
                      </span>
                      <Link
                        href={`/pm/projects/${project.id}/edit`}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
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
