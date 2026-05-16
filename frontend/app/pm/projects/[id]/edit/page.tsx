"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/app/components/protected-route";
import Toast from "@/app/components/toast";
import { getProject, updateProject } from "@/app/lib/projects";

const PROJECT_STATUSES = ["active", "on_hold", "completed"];

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    start_date: "",
    end_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "active",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
      });
    }
  }, [project]);

  function isDirty(): boolean {
    if (!project) return false;
    return (
      formData.name !== (project.name || "") ||
      formData.description !== (project.description || "") ||
      formData.status !== (project.status || "active") ||
      formData.start_date !== (project.start_date || "") ||
      formData.end_date !== (project.end_date || "")
    );
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isDirty()) {
      setToast({ type: "error", message: "No changes to save" });
      return;
    }

    setLoading(true);
    try {
      const updateData: Record<string, any> = {};

      if (formData.name !== project.name) updateData.name = formData.name;
      if (formData.description !== (project.description || ""))
        updateData.description = formData.description || null;
      if (formData.status !== project.status) updateData.status = formData.status;
      if (formData.start_date !== (project.start_date || ""))
        updateData.start_date = formData.start_date || null;
      if (formData.end_date !== (project.end_date || ""))
        updateData.end_date = formData.end_date || null;

      await updateProject(projectId, updateData);

      setToast({
        type: "success",
        message: `Project "${formData.name}" updated successfully`,
      });

      setTimeout(() => {
        router.push(`/pm/projects/${projectId}`);
      }, 1000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to update project";
      setToast({ type: "error", message: detail });
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="hr">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader size={32} className="text-gray-400 animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !project) {
    return (
      <ProtectedRoute requiredRole="hr">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div>
                <p className="font-medium text-red-900">Failed to load project</p>
                <p className="text-red-700 text-sm">
                  {error instanceof Error ? error.message : "Project not found"}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
              <p className="text-gray-600 text-sm mt-1">{project.name}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      setErrors({ ...errors, name: "" });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => {
                      setFormData({ ...formData, end_date: e.target.value });
                      if (errors.end_date) {
                        setErrors({ ...errors, end_date: "" });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                      errors.end_date ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Toast */}
              {toast && (
                <Toast
                  type={toast.type}
                  message={toast.message}
                  onClose={() => setToast(null)}
                  duration={3000}
                />
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isDirty()}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
