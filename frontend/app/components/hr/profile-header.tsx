"use client"

import Link from "next/link"
import { EmployeeFullProfile } from "@/app/types/employee"

interface Props {
  employee: EmployeeFullProfile
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

const getDepartmentAvatarColor = (dept: string): string => {
  return departmentAvatarColors[dept] || "bg-slate-500"
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "–"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function ProfileHeader({ employee }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <Link href="/hr/employees" className="inline-block text-teal-600 hover:text-teal-700 text-sm font-medium mb-4">
        ← Directory
      </Link>

      <div className="flex items-start gap-6">
        <div
          className={`w-16 h-16 rounded-full ${getDepartmentAvatarColor(
            employee.department
          )} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0`}
        >
          {getInitials(employee.name)}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-lg text-gray-600">{employee.designation}</p>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">{employee.department}</span>
          </div>

          <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-4">
            <span>{employee.location}</span>
            <span className="capitalize">{employee.work_mode}</span>
            <span className="capitalize">{employee.seniority}</span>
            {employee.date_of_joining && <span>Joined {formatDate(employee.date_of_joining)}</span>}
          </div>

          {/* Profile Status Banner */}
          <div className="mt-4">
            {!employee.profile_complete ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
                Profile incomplete — resume not yet approved
              </div>
            ) : (
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                Profile complete
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
