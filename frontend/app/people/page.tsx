'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, AlertCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/components/ui/sheet'
import ProtectedRoute from '@/app/components/protected-route'
import { EmployeeCardComponent } from '@/app/components/people/employee-card'
import { PeopleFilters } from '@/app/components/people/people-filters'
import { PeopleListResponse, PeopleFilterOptions, ActiveFilters } from '@/app/types/people'
import api from '@/app/lib/api'
import { useAuthStore } from '@/app/context/auth'

export default function PeoplePage() {
  return (
    <ProtectedRoute>
      <PeoplePageContent />
    </ProtectedRoute>
  )
}

function PeoplePageContent() {
  const { token } = useAuthStore()
  const [page, setPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    department: '',
    designation: '',
    location: '',
    seniority: '',
    skill: '',
    search: '',
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('page_size', '20')
    if (activeFilters.department) params.append('department', activeFilters.department)
    if (activeFilters.designation) params.append('designation', activeFilters.designation)
    if (activeFilters.location) params.append('location', activeFilters.location)
    if (activeFilters.seniority) params.append('seniority', activeFilters.seniority)
    if (activeFilters.skill) params.append('skill', activeFilters.skill)
    if (activeFilters.search) params.append('search', activeFilters.search)
    return params.toString()
  }, [page, activeFilters])

  const { data: peopleData, isLoading, error } = useQuery<PeopleListResponse>({
    queryKey: ['people', activeFilters, page],
    queryFn: async () => {
      const response = await api.get(`/people?${buildQueryParams()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    },
    enabled: !!token,
  })

  const { data: filterOptions } = useQuery<PeopleFilterOptions>({
    queryKey: ['people-filters'],
    queryFn: async () => {
      const response = await api.get('/people/filters', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
  })

  const handleFilterChange = (filters: ActiveFilters) => {
    setActiveFilters(filters)
    setPage(1)
  }

  const handleClearFilters = () => {
    setActiveFilters({
      department: '',
      designation: '',
      location: '',
      seniority: '',
      skill: '',
      search: '',
    })
    setPage(1)
  }

  const totalPages = peopleData ? Math.ceil(peopleData.total / 20) : 0

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">People</h1>
          <p className="text-slate-600 mt-1">Browse your colleagues and their skills</p>
        </div>
        {peopleData && (
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {peopleData.total} employees
          </Badge>
        )}
      </div>

      {/* Mobile filters button */}
      <div className="flex md:hidden justify-between items-center gap-2">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            {filterOptions && (
              <div className="mt-6">
                <PeopleFilters
                  filters={filterOptions}
                  activeFilters={activeFilters}
                  onChange={handleFilterChange}
                  onClear={handleClearFilters}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar filters (desktop only) */}
        <div className="hidden md:block">
          {filterOptions && (
            <div className="sticky top-4">
              <PeopleFilters
                filters={filterOptions}
                activeFilters={activeFilters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error loading employees</p>
                <p className="text-sm text-red-700 mt-1">Please try again</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page)}
                className="text-red-600"
              >
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-gray-200 animate-pulse rounded-lg h-64 border border-[#EBEEF0]"
                />
              ))}
            </div>
          ) : !peopleData || peopleData.employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={48} className="text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No employees found</h3>
              <p className="text-slate-600 mt-1">Try adjusting your filters</p>
              {Object.values(activeFilters).some(f => f) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {peopleData.employees.map(employee => (
                  <EmployeeCardComponent key={employee.id} employee={employee} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EBEEF0]">
                <p className="text-sm text-slate-600">
                  Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, peopleData.total)} of{' '}
                  {peopleData.total} employees
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
