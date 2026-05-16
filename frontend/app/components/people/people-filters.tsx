'use client'

import { useState, useMemo } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { PeopleFilterOptions, ActiveFilters } from '@/app/types/people'

interface PeopleFiltersProps {
  filters: PeopleFilterOptions
  activeFilters: ActiveFilters
  onChange: (filters: ActiveFilters) => void
  onClear: () => void
}

interface CollapsibleSectionProps {
  title: string
  open: boolean
  onToggle: (open: boolean) => void
  children: React.ReactNode
}

function CollapsibleSection({ title, open, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border-b border-[#EBEEF0]">
      <button
        onClick={() => onToggle(!open)}
        className="w-full flex items-center justify-between py-3 px-0 hover:bg-gray-50 rounded transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

export function PeopleFilters({
  filters,
  activeFilters,
  onChange,
  onClear,
}: PeopleFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    department: true,
    designation: false,
    seniority: false,
    location: false,
    skills: false,
  })

  const [skillSearch, setSkillSearch] = useState('')

  const filteredSkills = useMemo(() => {
    if (!skillSearch) return filters.skills
    return filters.skills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))
  }, [filters.skills, skillSearch])

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const activeCount = Object.values(activeFilters).filter(v => v).length

  const handleSearchChange = (value: string) => {
    onChange({ ...activeFilters, search: value })
  }

  const handleDepartmentChange = (value: string) => {
    onChange({ ...activeFilters, department: value })
  }

  const handleDesignationChange = (value: string) => {
    onChange({ ...activeFilters, designation: value })
  }

  const handleSeniorityChange = (value: string) => {
    onChange({ ...activeFilters, seniority: value })
  }

  const handleLocationChange = (value: string) => {
    onChange({ ...activeFilters, location: value })
  }

  const handleSkillChange = (skill: string) => {
    onChange({ ...activeFilters, skill })
    setSkillSearch('')
  }

  const handleClearSkill = () => {
    onChange({ ...activeFilters, skill: '' })
    setSkillSearch('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Filters</h3>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      <CollapsibleSection
        title="Search"
        open={expandedSections.search}
        onToggle={() => toggleSection('search')}
      >
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Search by name…"
            value={activeFilters.search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </CollapsibleSection>

      {/* Department */}
      <CollapsibleSection
        title="Department"
        open={expandedSections.department}
        onToggle={() => toggleSection('department')}
      >
        <div className="flex flex-col gap-2">
          <Button
            variant={activeFilters.department === '' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleDepartmentChange('')}
            className="justify-start"
          >
            All
          </Button>
          {filters.departments.map(dept => (
            <Button
              key={dept}
              variant={activeFilters.department === dept ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDepartmentChange(dept)}
              className="justify-start"
            >
              {dept}
            </Button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Designation */}
      <CollapsibleSection
        title="Designation"
        open={expandedSections.designation}
        onToggle={() => toggleSection('designation')}
      >
        <div className="flex flex-col gap-2">
          <Button
            variant={activeFilters.designation === '' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleDesignationChange('')}
            className="justify-start"
          >
            All
          </Button>
          {filters.designations.map(des => (
            <Button
              key={des}
              variant={activeFilters.designation === des ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleDesignationChange(des)}
              className="justify-start text-xs"
            >
              {des}
            </Button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Seniority */}
      <CollapsibleSection
        title="Seniority"
        open={expandedSections.seniority}
        onToggle={() => toggleSection('seniority')}
      >
        <div className="flex flex-col gap-2">
          <Button
            variant={activeFilters.seniority === '' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSeniorityChange('')}
            className="justify-start"
          >
            All
          </Button>
          {['junior', 'mid', 'senior', 'lead', 'principal'].map(sen => (
            <Button
              key={sen}
              variant={activeFilters.seniority === sen ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSeniorityChange(sen)}
              className="justify-start capitalize"
            >
              {sen}
            </Button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Location */}
      <CollapsibleSection
        title="Location"
        open={expandedSections.location}
        onToggle={() => toggleSection('location')}
      >
        <div className="flex flex-col gap-2">
          <Button
            variant={activeFilters.location === '' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLocationChange('')}
            className="justify-start"
          >
            All
          </Button>
          {filters.locations.map(loc => (
            <Button
              key={loc}
              variant={activeFilters.location === loc ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLocationChange(loc)}
              className="justify-start"
            >
              {loc}
            </Button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Skills */}
      <CollapsibleSection
        title="Skills"
        open={expandedSections.skills}
        onToggle={() => toggleSection('skills')}
      >
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Input
              placeholder="Filter by skill…"
              value={skillSearch}
              onChange={e => setSkillSearch(e.target.value)}
              className="text-sm"
            />
          </div>
          {activeFilters.skill && (
            <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
              <span className="text-sm font-medium">{activeFilters.skill}</span>
              <button onClick={handleClearSkill} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          )}
          {filteredSkills.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-[#EBEEF0] rounded-md">
              {filteredSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillChange(skill)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Clear all button */}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-600 text-xs">
          Clear all filters
        </Button>
      )}
    </div>
  )
}
