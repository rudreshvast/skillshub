"use client"

import { useRouter } from "next/navigation"
import { MapPin, Monitor, Home, Users } from "lucide-react"
import { EmployeeListItem } from "@/app/types/employee"

interface Props {
  employee: EmployeeListItem
}

const departmentColors: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700 border-blue-300",
  Design: "bg-purple-100 text-purple-700 border-purple-300",
  DevOps: "bg-orange-100 text-orange-700 border-orange-300",
  Product: "bg-green-100 text-green-700 border-green-300",
  QA: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Data: "bg-teal-100 text-teal-700 border-teal-300",
  Management: "bg-gray-100 text-gray-700 border-gray-300",
}

const departmentAvatarColors: Record<string, string> = {
  Engineering: "bg-blue-500",
  Design: "bg-purple-500",
  DevOps: "bg-orange-500",
  Product: "bg-green-500",
  QA: "bg-yellow-500",
  Data: "bg-teal-500",
  Management: "bg-gray-500",
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const getDepartmentColor = (dept: string): string => {
  return departmentColors[dept] || "bg-slate-100 text-slate-700 border-slate-300"
}

const getDepartmentAvatarColor = (dept: string): string => {
  return departmentAvatarColors[dept] || "bg-slate-500"
}

export default function EmployeeCard({ employee }: Props) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/hr/employees/${employee.id}`)
  }

  const workModeIcon =
    employee.work_mode === "remote" ? (
      <Home className="w-4 h-4" />
    ) : (
      <Monitor className="w-4 h-4" />
    )

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Top Section - Avatar & Name */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full ${getDepartmentAvatarColor(
            employee.department
          )} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
        >
          {getInitials(employee.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{employee.name}</h3>
          <p className="text-sm text-gray-600 truncate">{employee.designation}</p>
        </div>
      </div>

      {/* Middle Section - Badges */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium border rounded ${getDepartmentColor(employee.department)}`}>
            {employee.department}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{employee.location}</span>
          </div>
          <div className="flex items-center gap-1">
            {workModeIcon}
            <span className="capitalize">{employee.work_mode}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium px-2 py-1 border border-gray-300 rounded text-gray-700 capitalize">
            {employee.seniority}
          </span>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-4">
        {employee.top_skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {employee.top_skills.slice(0, 4).map((skill, i) => (
              <span key={i} className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded-full">
                {skill}
              </span>
            ))}
            {employee.top_skills.length > 4 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{employee.top_skills.length - 4} more
              </span>
            )}
          </div>
        ) : !employee.profile_complete ? (
          <p className="text-xs text-amber-600">Profile pending</p>
        ) : (
          <p className="text-xs text-gray-500">No skills recorded</p>
        )}
      </div>

      {/* Bottom Section - Experience & CTA */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="text-xs text-gray-600">
          {employee.years_of_experience ? `${employee.years_of_experience} yrs exp` : "–"}
        </div>
        <span className="text-sm text-teal-600 font-medium hover:text-teal-700">View Profile →</span>
      </div>
    </div>
  )
}
