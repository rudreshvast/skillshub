'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Award, Briefcase } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import ProtectedRoute from '@/app/components/protected-route'
import { ProfileSkillsSection } from '@/app/components/people/profile-skills-section'
import { SkillPill } from '@/app/components/people/skill-pill'
import { EmployeePublicProfile } from '@/app/types/people'
import api from '@/app/lib/api'
import { useAuthStore } from '@/app/context/auth'

export default function EmployeeProfilePage() {
  return (
    <ProtectedRoute>
      <EmployeeProfileContent />
    </ProtectedRoute>
  )
}

function EmployeeProfileContent() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string

  const { data: employee, isLoading, error } = useQuery<EmployeePublicProfile>({
    queryKey: ['people', parseInt(employeeId)],
    queryFn: async () => {
      const response = await api.get(`/people/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    },
    enabled: !!token && !!employeeId,
  })

  if (isLoading) {
    return (
      <div className="py-6 space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-32" />
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 animate-pulse rounded w-64" />
          <div className="h-6 bg-gray-200 animate-pulse rounded w-96" />
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="py-6 space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/people')}
          className="gap-2 -ml-2"
        >
          <ArrowLeft size={16} />
          People
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900">Employee not found</h2>
          <p className="text-slate-600 mt-2">This employee profile could not be loaded.</p>
          <Button onClick={() => router.push('/people')} className="mt-4">
            Back to People
          </Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.id === employee.id

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/people')}
        className="gap-2 -ml-2"
      >
        <ArrowLeft size={16} />
        People
      </Button>

      {/* Profile Header Card */}
      <div className="bg-white border border-[#EBEEF0] rounded-lg p-6">
        <div className="flex gap-6">
          <div
            className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
          >
            {employee.name
              .split(' ')
              .slice(0, 2)
              .map(n => n[0])
              .join('')}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{employee.designation}</Badge>
              <Badge variant="outline">{employee.department}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-slate-600">
              {employee.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {employee.location}
                </span>
              )}
              {employee.work_mode && <span>·</span>}
              {employee.work_mode && <span className="capitalize">{employee.work_mode}</span>}
              <span>·</span>
              <Badge variant="secondary" className="capitalize">
                {employee.seniority}
              </Badge>
              {employee.date_of_joining && (
                <>
                  <span>·</span>
                  <span>
                    Joined{' '}
                    {new Date(employee.date_of_joining).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {!employee.profile_complete && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm text-amber-900">
              ⚠️ Profile pending review — skills may be incomplete
            </p>
          </div>
        )}

        {isOwnProfile && (
          <Button
            onClick={() => router.push('/employee/profile')}
            className="mt-4 gap-2"
          >
            Edit my profile
          </Button>
        )}
      </div>

      {/* About section */}
      {employee.summary && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">About</h2>
          <p className="text-slate-700 leading-relaxed">{employee.summary}</p>
          {employee.domain_expertise && employee.domain_expertise.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {employee.domain_expertise.map(domain => (
                <Badge key={domain} className="bg-amber-100 text-amber-800">
                  {domain}
                </Badge>
              ))}
            </div>
          )}
          {employee.years_of_experience && (
            <p className="text-sm text-slate-600 font-medium">
              {employee.years_of_experience} years of experience
            </p>
          )}
        </div>
      )}

      {/* Skills section */}
      {employee.skills && employee.skills.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Skills</h2>
            <Badge variant="secondary">{employee.skills.length}</Badge>
          </div>
          <ProfileSkillsSection skills={employee.skills} />
        </div>
      )}

      {/* Projects section */}
      {employee.projects && employee.projects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Projects</h2>
            <Badge variant="secondary">{employee.projects.length}</Badge>
          </div>
          <div className="space-y-3">
            {employee.projects.map((project, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#EBEEF0] rounded-lg p-4"
              >
                <h3 className="font-semibold text-base">{project.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-600">
                  {project.role && <Badge variant="outline">{project.role}</Badge>}
                  {project.domain && <Badge variant="outline">{project.domain}</Badge>}
                  {project.duration && <span>{project.duration}</span>}
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.technologies.map((tech, tidx) => (
                      <SkillPill key={tidx} skill={tech} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications section */}
      {employee.certifications && employee.certifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Certifications</h2>
          <div className="space-y-2">
            {employee.certifications.map((cert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-white border border-[#EBEEF0] rounded-lg"
              >
                <Award size={18} className="text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{cert.name}</p>
                  {cert.issuer && (
                    <p className="text-xs text-slate-600">{cert.issuer}</p>
                  )}
                  {cert.issued_on && (
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(cert.issued_on).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar colleagues CTA */}
      {user && ['hr', 'manager', 'lead'].includes(user.role?.toLowerCase() || '') && (
        <div className="bg-slate-50 border border-[#EBEEF0] rounded-lg p-4 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm">Find similar colleagues</h3>
            <p className="text-sm text-slate-600 mt-1">
              Discover employees with matching skills
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const topSkills = employee.skills
                ?.filter(s => !s.is_inferred)
                .slice(0, 3)
                .map(s => s.skill_name)
                .join(', ') || ''
              router.push(`/hr/search?q=${encodeURIComponent(topSkills)}`)
            }}
          >
            Search
          </Button>
        </div>
      )}
    </div>
  )
}
