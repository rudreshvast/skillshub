"use client";

import { useState, useMemo } from "react";
import { Loader, AlertCircle, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/app/components/protected-route";
import QuickAllocateModal from "@/app/components/pm/quick-allocate-modal";
import { searchEmployees } from "@/app/lib/projects";
import { EmployeeListItem } from "@/app/types/employee";
import { BenchEmployee } from "@/app/types/project";

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

function getAvailabilityBadgeColor(percent: number): string {
  if (percent === 0) return "bg-green-100 text-green-800";
  if (percent <= 25) return "bg-teal-100 text-teal-800";
  if (percent <= 50) return "bg-blue-100 text-blue-800";
  if (percent <= 75) return "bg-amber-100 text-amber-800";
  return "bg-orange-100 text-orange-800";
}

function getAvailabilityText(percent: number): string {
  const available = 100 - percent;
  return `${available}% available`;
}

export default function BenchPage() {
  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ["employees-bench"],
    queryFn: () => searchEmployees(""),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    seniority: "",
    minAvailable: 0,
  });
  const [sortBy, setSortBy] = useState("name");
  const [selectedEmployee, setSelectedEmployee] = useState<BenchEmployee | null>(
    null
  );

  const benchEmployees: BenchEmployee[] = useMemo(() => {
    if (!employees) return [];

    return employees
      .filter((emp: EmployeeListItem) => {
        const currentAlloc = emp.current_allocation_percentage ?? 0;
        return currentAlloc < 100;
      })
      .map((emp: EmployeeListItem) => ({
        id: emp.id,
        name: emp.name,
        designation: emp.designation,
        department: emp.department,
        location: emp.location,
        seniority: emp.seniority,
        current_allocation_percentage: emp.current_allocation_percentage ?? 0,
      }));
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let result = [...benchEmployees];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.designation.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (filters.department) {
      result = result.filter((emp) => emp.department === filters.department);
    }

    // Seniority filter
    if (filters.seniority) {
      result = result.filter((emp) => emp.seniority === filters.seniority);
    }

    // Availability filter
    if (filters.minAvailable > 0) {
      result = result.filter(
        (emp) =>
          100 - emp.current_allocation_percentage >= filters.minAvailable
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "availability":
          return (
            b.current_allocation_percentage - a.current_allocation_percentage
          );
        case "seniority":
          const seniorityOrder: Record<string, number> = {
            principal: 0,
            lead: 1,
            senior: 2,
            mid: 3,
            junior: 4,
          };
          return (
            (seniorityOrder[a.seniority] ?? 5) -
            (seniorityOrder[b.seniority] ?? 5)
          );
        default:
          return 0;
      }
    });

    return result;
  }, [benchEmployees, searchQuery, filters, sortBy]);

  const stats = useMemo(() => {
    return {
      total: benchEmployees.length,
      fullyAvailable: benchEmployees.filter(
        (e) => e.current_allocation_percentage === 0
      ).length,
      partiallyAvailable: benchEmployees.filter(
        (e) =>
          e.current_allocation_percentage > 0 &&
          e.current_allocation_percentage < 100
      ).length,
      byDept: benchEmployees.reduce(
        (acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      bySeniority: benchEmployees.reduce(
        (acc, emp) => {
          acc[emp.seniority] = (acc[emp.seniority] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }, [benchEmployees]);

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Bench Pool</h1>
            <p className="text-gray-600 text-sm mt-1">
              Available employees ready for allocation
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-600 text-sm font-medium">Total Available</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-600 text-sm font-medium">
                Fully Available
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.fullyAvailable}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-600 text-sm font-medium">
                Partially Available
              </p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {stats.partiallyAvailable}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-600 text-sm font-medium">
                By Department
              </p>
              <div className="mt-2 space-y-1">
                {Object.entries(stats.byDept)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([dept, count]) => (
                    <p key={dept} className="text-sm text-gray-700">
                      {dept}: <span className="font-medium">{count}</span>
                    </p>
                  ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>

                {/* Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, role, dept..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Department */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      setFilters({ ...filters, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">All departments</option>
                    {Object.keys(stats.byDept)
                      .sort()
                      .map((dept) => (
                        <option key={dept} value={dept}>
                          {dept} ({stats.byDept[dept]})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Seniority */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seniority
                  </label>
                  <select
                    value={filters.seniority}
                    onChange={(e) =>
                      setFilters({ ...filters, seniority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">All levels</option>
                    {["principal", "lead", "senior", "mid", "junior"].map(
                      (level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)} (
                          {stats.bySeniority[level] || 0})
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Min Availability */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Available
                  </label>
                  <select
                    value={filters.minAvailable}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minAvailable: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value={0}>Any availability</option>
                    <option value={25}>≥25%</option>
                    <option value={50}>≥50%</option>
                    <option value={75}>≥75%</option>
                    <option value={100}>100%</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="name">Name</option>
                    <option value="availability">Availability</option>
                    <option value="seniority">Seniority</option>
                  </select>
                </div>

                {/* Reset */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      department: "",
                      seniority: "",
                      minAvailable: 0,
                    });
                    setSortBy("name");
                  }}
                  className="w-full px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Employee List */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader
                    size={32}
                    className="text-gray-400 animate-spin"
                  />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">
                      Failed to load employees
                    </p>
                    <p className="text-red-700 text-sm">
                      {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                  </div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                  <Users size={32} className="text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No employees found
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benchEmployees.length === 0
                      ? "All employees are fully allocated"
                      : "Try adjusting your filters"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all p-4"
                    >
                      <div className="flex items-center justify-between">
                        {/* Employee Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-12 h-12 rounded-full ${getDeptColor(emp.department)} text-white flex items-center justify-center font-medium flex-shrink-0`}
                          >
                            {getInitials(emp.name)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {emp.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {emp.designation} • {emp.department}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {emp.seniority}
                              </span>
                              <span className="text-xs text-gray-500">
                                {emp.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Availability & Action */}
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityBadgeColor(emp.current_allocation_percentage)}`}
                            >
                              {getAvailabilityText(
                                emp.current_allocation_percentage
                              )}
                            </div>
                            {emp.current_allocation_percentage > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {emp.current_allocation_percentage}% allocated
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm whitespace-nowrap"
                          >
                            Quick Allocate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Allocate Modal */}
        {selectedEmployee && (
          <QuickAllocateModal
            isOpen={!!selectedEmployee}
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            onSuccess={() => {
              setSelectedEmployee(null);
              refetch();
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
