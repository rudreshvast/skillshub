"use client"

import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import { FilterOptions } from "@/app/types/employee"

export interface FilterState {
  search: string
  department: string
  location: string
  seniority: string
  work_mode: string
  skill: string
  profile_complete: "all" | "complete" | "incomplete"
}

interface Props {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  filterOptions: FilterOptions | null
}

const defaultFilters: FilterState = {
  search: "",
  department: "",
  location: "",
  seniority: "",
  work_mode: "",
  skill: "",
  profile_complete: "all",
}

const isDefaultFilter = (f: FilterState) => {
  return (
    f.search === "" &&
    f.department === "" &&
    f.location === "" &&
    f.seniority === "" &&
    f.work_mode === "" &&
    f.skill === "" &&
    f.profile_complete === "all"
  )
}

export default function EmployeeFilters({ filters, onFilterChange, filterOptions }: Props) {
  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput })
    }, 400)

    return () => clearTimeout(timer)
  }, [searchInput])

  const handleClearFilters = () => {
    setSearchInput("")
    onFilterChange(defaultFilters)
  }

  const handleSelectChange = (key: keyof Omit<FilterState, "search">, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  const hasActiveFilter = !isDefaultFilter(filters)

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-3">
      {/* Search Input */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-xs relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Dropdowns */}
        {filterOptions && (
          <>
            <select
              value={filters.department}
              onChange={(e) => handleSelectChange("department", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleSelectChange("location", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Locations</option>
              {filterOptions.locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <select
              value={filters.seniority}
              onChange={(e) => handleSelectChange("seniority", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Seniorities</option>
              {filterOptions.seniorities.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filters.work_mode}
              onChange={(e) => handleSelectChange("work_mode", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Work Modes</option>
              {filterOptions.work_modes.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Skill Input & Profile Status & Clear Button */}
      <div className="flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Filter by skill..."
          value={filters.skill}
          onChange={(e) => handleSelectChange("skill", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        {/* Profile Status Toggle */}
        <div className="flex gap-2">
          {(["all", "complete", "incomplete"] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleSelectChange("profile_complete", status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.profile_complete === status
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "all" && "All"}
              {status === "complete" && "Complete"}
              {status === "incomplete" && "Incomplete"}
            </button>
          ))}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilter && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
