'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Badge } from '@/app/components/ui/badge'
import { EmployeeCard } from '@/app/types/people'
import { SkillPill } from './skill-pill'

interface EmployeeCardComponentProps {
  employee: EmployeeCard
  onClick?: () => void
}

function getDepartmentColor(dept: string): string {
  const colors: Record<string, string> = {
    'Management': 'bg-blue-500',
    'Development': 'bg-purple-500',
    'Quality Assurance': 'bg-amber-500',
    'Design': 'bg-pink-500',
    'DevOps': 'bg-green-500',
  }
  return colors[dept] || 'bg-slate-500'
}

function getSeniorityColor(seniority: string): string {
  switch (seniority) {
    case 'principal':
    case 'lead':
      return 'bg-slate-700'
    case 'senior':
      return 'bg-teal-600'
    case 'mid':
      return 'bg-amber-500'
    case 'junior':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function EmployeeCardComponent({ employee, onClick }: EmployeeCardComponentProps) {
  const handleClick = () => {
    onClick?.()
  }

  return (
    <Link href={`/people/${employee.id}`} onClick={handleClick}>
      <div className="bg-white border border-[#EBEEF0] rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col gap-3">
        {/* Top row: Avatar + Name/Designation */}
        <div className="flex gap-3">
          <div
            className={`w-12 h-12 ${getDepartmentColor(employee.department)} rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm`}
          >
            {getInitials(employee.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{employee.name}</p>
            <p className="text-xs text-slate-600 truncate">{employee.designation}</p>
          </div>
        </div>

        {/* Meta chips row */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {employee.department}
          </Badge>
          <Badge
            className={`text-xs text-white ${getSeniorityColor(employee.seniority)}`}
            variant="secondary"
          >
            {employee.seniority}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <MapPin size={12} />
            <span>{employee.location}</span>
          </div>
          {employee.work_mode && (
            <span className="text-xs text-slate-500">{employee.work_mode}</span>
          )}
        </div>

        {/* Skills or pending banner */}
        {!employee.profile_complete ? (
          <div className="bg-amber-100 text-amber-700 text-xs px-2 py-1.5 rounded-md">
            Profile pending
          </div>
        ) : (
          employee.top_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {employee.top_skills.slice(0, 4).map((skill, idx) => (
                <SkillPill
                  key={idx}
                  skill={skill.skill_name}
                  proficiency={skill.proficiency}
                  size="sm"
                />
              ))}
            </div>
          )
        )}

        {/* Footer: Experience + Domain */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-[#EBEEF0]">
          <span>
            {employee.years_of_experience
              ? `${employee.years_of_experience} yrs exp`
              : 'No experience data'}
          </span>
          {employee.domain_expertise?.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {employee.domain_expertise[0]}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
