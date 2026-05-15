"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Award, ArrowRight } from "lucide-react"
import ProtectedRoute from "@/app/components/protected-route"
import ProfileHeader from "@/app/components/hr/profile-header"
import SkillsSection from "@/app/components/hr/skills-section"
import api from "@/app/lib/api"
import { EmployeeFullProfile } from "@/app/types/employee"

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const [employee, setEmployee] = useState<EmployeeFullProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<EmployeeFullProfile>(`/employees/${employeeId}`)
        setEmployee(response.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch employee")
      } finally {
        setLoading(false)
      }
    }

    if (employeeId) {
      fetchEmployee()
    }
  }, [employeeId])

  if (loading) {
    return (
      <ProtectedRoute requiredRole="hr">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 mt-4">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !employee) {
    return (
      <ProtectedRoute requiredRole="hr">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Employee not found"}</p>
            <button
              onClick={() => router.push("/hr/employees")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const handleSearchSimilar = () => {
    const topSkills = employee.skills
      .filter((s) => !s.is_inferred)
      .sort((a, b) => {
        const profOrder = { expert: 0, intermediate: 1, novice: 2 }
        return profOrder[a.proficiency as keyof typeof profOrder] - profOrder[b.proficiency as keyof typeof profOrder]
      })
      .slice(0, 3)
      .map((s) => s.skill_name)
      .join(",")

    router.push(`/hr/search?q=${encodeURIComponent(topSkills)}`)
  }

  const verifiedSkillsCount = employee.skills.filter((s) => !s.is_inferred).length
  const totalSkillsCount = employee.skills.length

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <ProfileHeader employee={employee} />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="lg:grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Section 1: About */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                {employee.summary ? (
                  <p className="text-gray-700 leading-relaxed mb-6">{employee.summary}</p>
                ) : (
                  <p className="text-gray-500 italic">No summary available</p>
                )}

                {employee.domain_expertise && employee.domain_expertise.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Domain Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {employee.domain_expertise.map((domain, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.years_of_experience && (
                  <p className="text-sm text-gray-600 mt-4">
                    <strong>{employee.years_of_experience}</strong> years of experience
                  </p>
                )}
              </div>

              {/* Section 2: Skills */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                <SkillsSection skills={employee.skills} />
              </div>

              {/* Section 3: Project History */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Project History</h2>
                {employee.projects.length === 0 ? (
                  <p className="text-gray-500">No project history recorded</p>
                ) : (
                  <div className="space-y-4">
                    {employee.projects.map((project) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          {project.domain && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {project.domain}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {project.role && <span>{project.role}</span>}
                          {project.role && project.duration && <span> · </span>}
                          {project.duration && <span>{project.duration}</span>}
                        </p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Certifications */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
                {employee.certifications.length === 0 ? (
                  <p className="text-gray-500">No certifications recorded</p>
                ) : (
                  <div className="space-y-3">
                    {employee.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                        <Award className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{cert.name}</p>
                          <p className="text-sm text-gray-600">
                            {cert.issuer && <span>{cert.issuer}</span>}
                            {cert.issuer && cert.issued_on && <span> · </span>}
                            {cert.issued_on && <span>{new Date(cert.issued_on).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                            })}</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 5: Work Info */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Work Information</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Employee ID</p>
                    <p className="text-gray-900 font-medium">{employee.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Date of Joining</p>
                    <p className="text-gray-900 font-medium">
                      {employee.date_of_joining
                        ? new Date(employee.date_of_joining).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "–"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Department</p>
                    <p className="text-gray-900 font-medium">{employee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{employee.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Work Mode</p>
                    <p className="text-gray-900 font-medium capitalize">{employee.work_mode}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Seniority</p>
                    <p className="text-gray-900 font-medium capitalize">{employee.seniority}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Skills</p>
                    <p className="text-2xl font-bold text-gray-900">{totalSkillsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Verified Skills</p>
                    <p className="text-2xl font-bold text-gray-900">{verifiedSkillsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{employee.projects.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Certifications</p>
                    <p className="text-2xl font-bold text-gray-900">{employee.certifications.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Years of Experience</p>
                    <p className="text-2xl font-bold text-gray-900">{employee.years_of_experience || "–"}</p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleSearchSimilar}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  Search similar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
