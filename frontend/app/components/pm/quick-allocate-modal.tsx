"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, Loader } from "lucide-react";
import Toast from "@/app/components/toast";
import { addAllocation, getProjects } from "@/app/lib/projects";
import { BenchEmployee } from "@/app/types/project";
import { ProjectListItem } from "@/app/types/project";

const PROJECT_ROLES = [
  "Team Lead",
  "Tech Lead",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "QA Engineer",
  "UI/UX Designer",
  "Data Engineer",
  "Database Admin",
  "Architect",
];

const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: "bg-blue-500",
  Design: "bg-purple-500",
  Data: "bg-indigo-500",
  HR: "bg-pink-500",
  Sales: "bg-green-500",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDeptColor(dept: string): string {
  return DEPARTMENT_COLORS[dept] || "bg-gray-500";
}

interface QuickAllocateModalProps {
  isOpen: boolean;
  employee: BenchEmployee;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickAllocateModal({
  isOpen,
  employee,
  onClose,
  onSuccess,
}: QuickAllocateModalProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [allocationPercentage, setAllocationPercentage] = useState(100);
  const [roleInProject, setRoleInProject] = useState(employee.designation);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchProjects();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  async function fetchProjects() {
    try {
      setProjectsLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setToast({ type: "error", message: "Failed to load projects" });
    } finally {
      setProjectsLoading(false);
    }
  }

  async function handleAllocate() {
    if (!selectedProjectId) {
      setToast({ type: "error", message: "Please select a project" });
      return;
    }

    if (!roleInProject.trim()) {
      setToast({ type: "error", message: "Please enter a role" });
      return;
    }

    setLoading(true);
    try {
      await addAllocation(selectedProjectId as number, {
        employee_id: employee.id,
        allocation_percentage: allocationPercentage,
        role_in_project: roleInProject,
        start_date: startDate || undefined,
      });

      const project = projects.find((p) => p.id === selectedProjectId);
      setToast({
        type: "success",
        message: `${employee.name} allocated to ${project?.name || "project"}`,
      });

      setTimeout(() => {
        onSuccess();
        setSelectedProjectId("");
        setAllocationPercentage(100);
        setRoleInProject(employee.designation);
        setStartDate(new Date().toISOString().split("T")[0]);
        onClose();
      }, 1000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to allocate employee";
      setToast({ type: "error", message: detail });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Allocate {employee.name} to a project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Employee Card */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${getDeptColor(employee.department)} text-white flex items-center justify-center font-medium flex-shrink-0`}
              >
                {getInitials(employee.name)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{employee.name}</div>
                <div className="text-sm text-gray-600">
                  {employee.designation} • {employee.department} •{" "}
                  {employee.seniority}
                </div>
              </div>
            </div>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose project
            </label>
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(false)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-900">
                  {selectedProjectId
                    ? projects.find((p) => p.id === selectedProjectId)?.name ||
                      "Select project..."
                    : "Select project..."}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {projectsLoading ? (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 flex items-center justify-center">
                  <Loader size={18} className="animate-spin text-gray-400" />
                </div>
              ) : projects.length === 0 ? (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 text-center text-sm text-gray-500">
                  No projects available
                </div>
              ) : (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm border-b border-gray-200 last:border-b-0 ${
                        selectedProjectId === project.id
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {project.name} ({project.status})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Allocation Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allocation percentage
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setAllocationPercentage((p) => Math.max(1, p - 1))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={allocationPercentage}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setAllocationPercentage(Math.min(100, Math.max(1, val)));
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
              />
              <button
                onClick={() =>
                  setAllocationPercentage((p) => Math.min(100, p + 1))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {allocationPercentage}% of their time on this project
            </p>
          </div>

          {/* Role in Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role in this project
            </label>
            <select
              value={
                PROJECT_ROLES.includes(roleInProject) ? roleInProject : "custom"
              }
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setShowRoleDropdown(true);
                } else {
                  setRoleInProject(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select role...</option>
              {PROJECT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
              <option value="custom">Custom role...</option>
            </select>

            {!PROJECT_ROLES.includes(roleInProject) && (
              <input
                type="text"
                placeholder="Enter custom role..."
                value={roleInProject}
                onChange={(e) => setRoleInProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent mt-2"
              />
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
              duration={2000}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAllocate}
            disabled={loading || !selectedProjectId}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            Allocate
          </button>
        </div>
      </div>
    </div>
  );
}
