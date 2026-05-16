"use client";

import { useEffect, useState, useRef } from "react";
import { X, Search, Loader, ChevronDown } from "lucide-react";
import Toast from "@/app/components/toast";
import { searchEmployees, addAllocation } from "@/app/lib/projects";
import { EmployeeListItem } from "@/app/types/employee";
import { AllocationMember } from "@/app/types/project";

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

function getAllocationBadgeColor(percent: number): string {
  if (percent === 0) return "bg-green-100 text-green-800";
  if (percent < 80) return "bg-blue-100 text-blue-800";
  if (percent < 100) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function getAllocationText(percent: number): string {
  if (percent === 0) return "Available";
  return `${percent}% allocated`;
}

interface MemberPickerModalProps {
  isOpen: boolean;
  projectId: number;
  excludeEmployeeIds?: number[];
  onClose: () => void;
  onSuccess: (member: AllocationMember) => void;
}

export default function MemberPickerModal({
  isOpen,
  projectId,
  excludeEmployeeIds = [],
  onClose,
  onSuccess,
}: MemberPickerModalProps) {
  const [step, setStep] = useState<"search" | "form">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [allocationPercentage, setAllocationPercentage] = useState(50);
  const [roleInProject, setRoleInProject] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [allocationError, setAllocationError] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!searchQuery.trim()) {
      setEmployees([]);
      return;
    }

    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchEmployees(searchQuery);
        const filtered = results.filter(
          (emp) => !excludeEmployeeIds.includes(emp.id)
        );
        setEmployees(filtered);
      } catch (err) {
        console.error("Search error:", err);
        setToast({ type: "error", message: "Failed to search employees" });
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, excludeEmployeeIds]);

  function handleSelectEmployee(emp: EmployeeListItem) {
    setSelectedEmployee(emp);
    setStep("form");
    setRoleInProject("");
    setCustomRole("");
    setAllocationPercentage(50);
    setAllocationError("");
    setRoleError("");
  }

  function handleBackToSearch() {
    setStep("search");
    setSelectedEmployee(null);
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
    setRoleError("");
  }

  function handleCustomRoleChange(value: string) {
    setCustomRole(value);
    if (value.trim()) {
      setRoleInProject("");
    }
    setRoleError("");
  }

  function getFinalRole(): string {
    return customRole.trim() || roleInProject;
  }

  async function handleAddMember() {
    const finalRole = getFinalRole();
    if (!finalRole) {
      setRoleError("Please select or enter a role");
      return;
    }

    if (allocationPercentage < 1 || allocationPercentage > 100) {
      setAllocationError("Allocation must be between 1 and 100%");
      return;
    }

    if (!selectedEmployee) return;

    const maxAvailable =
      100 - (selectedEmployee.current_allocation_percentage ?? 0);
    if (allocationPercentage > maxAvailable) {
      setAllocationError(
        `Employee can only be allocated ${maxAvailable}% more (currently ${selectedEmployee.current_allocation_percentage}%)`
      );
      return;
    }

    setLoading(true);
    try {
      const newMember = await addAllocation(projectId, {
        employee_id: selectedEmployee.id,
        allocation_percentage: allocationPercentage,
        role_in_project: finalRole,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        notes: notes || undefined,
      });

      setToast({
        type: "success",
        message: `${selectedEmployee.name} (${allocationPercentage}%) added to project — ${finalRole}`,
      });

      setTimeout(() => {
        onSuccess(newMember);
        setStep("search");
        setSelectedEmployee(null);
        setSearchQuery("");
        setAllocationPercentage(50);
        setRoleInProject("");
        setCustomRole("");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
        setNotes("");
        onClose();
      }, 1000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to add allocation";
      if (detail.includes("allocation_would_exceed")) {
        const match = detail.match(/max available is (\d+)%/);
        const maxAvailable = match ? parseInt(match[1]) : 0;
        setAllocationError(
          `Total would be ${allocationPercentage + (selectedEmployee.current_allocation_percentage ?? 0)}%. Max available: ${maxAvailable}%`
        );
      } else {
        setToast({ type: "error", message: detail });
      }
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
            {step === "search"
              ? "Add team member to project"
              : `Allocation details for ${selectedEmployee?.name}`}
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
          {step === "search" ? (
            <>
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name, designation, or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {searching && (
                    <Loader
                      size={18}
                      className="absolute right-3 top-3 text-gray-400 animate-spin"
                    />
                  )}
                </div>
              </div>

              {/* Results List */}
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                {employees.length === 0 && searchQuery.trim() ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No employees found
                  </div>
                ) : employees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Start typing to search...
                  </div>
                ) : (
                  employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors flex items-center gap-3"
                    >
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full ${getDeptColor(emp.department)} text-white flex items-center justify-center font-medium text-sm flex-shrink-0`}
                      >
                        {getInitials(emp.name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {emp.name}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {emp.designation} • {emp.department} • {emp.location}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {emp.seniority}
                        </div>
                      </div>

                      {/* Allocation Badge */}
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${getAllocationBadgeColor(emp.current_allocation_percentage ?? 0)}`}
                      >
                        {getAllocationText(emp.current_allocation_percentage ?? 0)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : selectedEmployee ? (
            <>
              {/* Selected Employee Card */}
              <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${getDeptColor(selectedEmployee.department)} text-white flex items-center justify-center font-medium flex-shrink-0`}
                  >
                    {getInitials(selectedEmployee.name)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {selectedEmployee.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedEmployee.designation} • {selectedEmployee.department}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Currently allocated:{" "}
                      {selectedEmployee.current_allocation_percentage ?? 0}%
                    </div>
                  </div>
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
                    Employee will be {allocationPercentage}% allocated to this
                    project
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
                        {customRole || roleInProject || "Select role..."}
                      </span>
                      <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {showRoleDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {PROJECT_ROLES.map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleSelect(role)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 border-b border-gray-200 last:border-b-0"
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
                  <p className="text-xs text-gray-500 mt-1">
                    e.g., Backend Developer, Team Lead
                  </p>
                  {roleError && (
                    <p className="text-red-500 text-sm mt-1">{roleError}</p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    When does this allocation start?
                  </p>
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
                    Leave empty if ongoing
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
                    placeholder="Any additional context about this allocation?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          ) : null}

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
        <div className="border-t border-gray-200 p-4 flex justify-between sticky bottom-0 bg-white">
          {step === "form" && (
            <button
              onClick={handleBackToSearch}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {step === "form" && (
            <button
              onClick={handleAddMember}
              disabled={loading || !selectedEmployee}
              className="ml-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              Add Member
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
