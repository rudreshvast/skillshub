"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"
import AppLayout from "@/app/components/layout/app-layout"
import ProtectedRoute from "@/app/components/protected-route"
import EmployeeCard from "@/app/components/hr/employee-card"
import EmployeeFilters, { FilterState } from "@/app/components/hr/employee-filters"
import api from "@/app/lib/api"
import { EmployeeListItem, EmployeeListResponse, FilterOptions } from "@/app/types/employee"

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
    <div className="flex gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-300 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
        <div className="h-3 bg-gray-300 rounded w-32" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-300 rounded w-20" />
      <div className="h-8 bg-gray-300 rounded w-full" />
    </div>
  </div>
)

const defaultFilters: FilterState = {
  search: "",
  department: "",
  location: "",
  seniority: "",
  work_mode: "",
  skill: "",
  profile_complete: "all",
}

export default function EmployeeDirectoryPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [employees, setEmployees] = useState<EmployeeListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get<FilterOptions>("/employees/filters/options")
        setFilterOptions(response.data)
      } catch (err: any) {
        console.error("Error fetching filter options:", err)
      }
    }
    fetchFilterOptions()
  }, [])

  // Fetch employees when filters or page changes
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: any = {
          page,
          page_size: pageSize,
        }

        if (filters.search) params.search = filters.search
        if (filters.department) params.department = filters.department
        if (filters.location) params.location = filters.location
        if (filters.work_mode) params.work_mode = filters.work_mode
        if (filters.seniority) params.seniority = filters.seniority
        if (filters.skill) params.skill = filters.skill
        if (filters.profile_complete !== "all") {
          params.profile_complete = filters.profile_complete === "complete"
        }

        const response = await api.get<EmployeeListResponse>("/employees", { params })
        setEmployees(response.data.employees)
        setTotal(response.data.total)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch employees")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [filters, page, pageSize])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }

  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, total)

  return (
    <AppLayout>
      <ProtectedRoute requiredRole="hr">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
            <span className="px-4 py-2 bg-teal-100 text-teal-800 text-sm font-medium rounded-lg">
              {total} employees
            </span>
          </div>
        </div>

        {/* Filters */}
        <EmployeeFilters filters={filters} onFilterChange={handleFilterChange} filterOptions={filterOptions} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : employees.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters</p>
              <button
                onClick={() => handleFilterChange(defaultFilters)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Employee Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {employees.map((employee) => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {startIndex}–{endIndex} of {total} employees
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            page === pageNum
                              ? "bg-teal-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </ProtectedRoute>
    </AppLayout>
  )
}
