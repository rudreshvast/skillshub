"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import Toast from "@/app/components/toast";
import {
  updateAllocation,
  removeAllocation,
} from "@/app/lib/projects";
import { AllocationMember, AllocationUpdate } from "@/app/types/project";

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

interface AllocationEditModalProps {
  isOpen: boolean;
  allocation: AllocationMember;
  projectId: number;
  onClose: () => void;
  onSave: (updated: AllocationMember | null) => void;
}

export default function AllocationEditModal({
  isOpen,
  allocation,
  projectId,
  onClose,
  onSave,
}: AllocationEditModalProps) {
  const [allocationPercentage, setAllocationPercentage] = useState(
    allocation.allocation_percentage
  );
  const [roleInProject, setRoleInProject] = useState(allocation.role_in_project);
  const [customRole, setCustomRole] = useState(
    PROJECT_ROLES.includes(allocation.role_in_project)
      ? ""
      : allocation.role_in_project
  );
  const [endDate, setEndDate] = useState(allocation.end_date || "");
  const [notes, setNotes] = useState(allocation.notes || "");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [allocationError, setAllocationError] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  function isDirty(): boolean {
    const finalRole = customRole.trim() || roleInProject;
    return (
      allocationPercentage !== allocation.allocation_percentage ||
      finalRole !== allocation.role_in_project ||
      endDate !== (allocation.end_date || "") ||
      notes !== (allocation.notes || "")
    );
  }

  function handleRoleSelect(role: string) {
    if (role === "custom") {
      setRoleInProject("");
      setCustomRole("");
    } else {
      setRoleInProject(role);
      setCustomRole("");
    }
    setShowRoleDropdown(false);
  }

  function handleCustomRoleChange(value: string) {
    setCustomRole(value);
    if (value.trim()) {
      setRoleInProject("");
    }
  }

  function getFinalRole(): string {
    return customRole.trim() || roleInProject;
  }

  async function handleSaveChanges() {
    const finalRole = getFinalRole();
    if (!finalRole) {
      setToast({ type: "error", message: "Please select or enter a role" });
      return;
    }

    setLoading(true);
    try {
      const updates: AllocationUpdate = {};

      if (
        allocationPercentage !== allocation.allocation_percentage
      ) {
        updates.allocation_percentage = allocationPercentage;
      }

      if (finalRole !== allocation.role_in_project) {
        updates.role_in_project = finalRole;
      }

      if (endDate !== (allocation.end_date || "")) {
        updates.end_date = endDate || null;
      }

      if (notes !== (allocation.notes || "")) {
        updates.notes = notes || null;
      }

      const updated = await updateAllocation(
        projectId,
        allocation.id,
        updates
      );

      setToast({
        type: "success",
        message: "Allocation updated successfully",
      });

      setTimeout(() => {
        onSave(updated);
        onClose();
      }, 1000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to update allocation";
      if (detail.includes("allocation_would_exceed")) {
        const match = detail.match(/max available is (\d+)%/);
        const maxAvailable = match ? parseInt(match[1]) : 0;
        setAllocationError(
          `Total would be ${allocationPercentage + (100 - allocation.allocation_percentage)}%. Max available: ${maxAvailable}%`
        );
      } else {
        setToast({ type: "error", message: detail });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      await removeAllocation(projectId, allocation.id);
      setToast({
        type: "success",
        message: `${allocation.employee_name} removed from project`,
      });

      setTimeout(() => {
        onSave(null);
        setShowRemoveConfirm(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to remove allocation";
      setToast({ type: "error", message: detail });
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit allocation for {allocation.employee_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Employee Card */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-full ${getDeptColor(allocation.employee_department)} text-white flex items-center justify-center font-medium flex-shrink-0`}
              >
                {getInitials(allocation.employee_name)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {allocation.employee_name}
                </div>
                <div className="text-sm text-gray-600">
                  {allocation.employee_designation} •{" "}
                  {allocation.employee_department}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {allocation.employee_seniority}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 border-t border-gray-200 pt-3">
              Currently allocated: {allocation.allocation_percentage}% on this
              project
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
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
                    setAllocationError("");
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
                Adjust the time commitment
              </p>
              {allocationError && (
                <p className="text-red-500 text-sm mt-1">{allocationError}</p>
              )}
            </div>

            {/* Role in Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role in this project
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-900">
                    {customRole || roleInProject}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {PROJECT_ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm border-b border-gray-200 last:border-b-0 ${
                          roleInProject === role
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Or type a custom role..."
                value={customRole}
                onChange={(e) => handleCustomRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent mt-2"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set a date to mark this allocation as complete
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
              duration={2000}
            />
          )}

          {showRemoveConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Remove {allocation.employee_name} from project?
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemove}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between sticky bottom-0 bg-white">
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            Remove from project
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={loading || !isDirty()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
