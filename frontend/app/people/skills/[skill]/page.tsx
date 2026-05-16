'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import ProtectedRoute from '@/app/components/protected-route'
import { SkillPill } from '@/app/components/people/skill-pill'
import { SkillBrowseResponse, SkillBrowseEntry } from '@/app/types/people'
import api from '@/app/lib/api'
import { useAuthStore } from '@/app/context/auth'

export default function SkillBrowsePage() {
  return (
    <ProtectedRoute>
      <SkillBrowseContent />
    </ProtectedRoute>
  )
}

function SkillBrowseContent() {
  const { token } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const skillParam = params.skill as string
  const decodedSkill = decodeURIComponent(skillParam)

  const { data: skillData, isLoading, error } = useQuery<SkillBrowseResponse>({
    queryKey: ['skill-browse', decodedSkill],
    queryFn: async () => {
      const response = await api.get(`/people/skills/${decodedSkill}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    },
    enabled: !!token && !!decodedSkill,
  })

  if (isLoading) {
    return (
      <div className="py-6 space-y-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-32" />
        <div className="h-10 bg-gray-200 animate-pulse rounded w-64" />
      </div>
    )
  }

  if (error || !skillData) {
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
          <h2 className="text-2xl font-bold text-slate-900">
            No employees found with skill "{decodedSkill}"
          </h2>
          <Button onClick={() => router.push('/people')} className="mt-4">
            Back to People
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6 max-w-3xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/people')}
        className="gap-2 -ml-2"
      >
        <ArrowLeft size={16} />
        People
      </Button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <SkillPill skill={skillData.skill_name} size="md" clickable={false} />
          <Badge variant="secondary" className="text-base px-3 py-1">
            {skillData.total} employees
          </Badge>
        </div>
      </div>

      {/* Expert section */}
      {skillData.expert.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-teal-700">Expert</h2>
            <Badge className="bg-teal-100 text-teal-700">{skillData.expert.length}</Badge>
          </div>
          <div className="space-y-2">
            {skillData.expert.map(entry => (
              <SkillBrowseRow key={entry.employee_id_num} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Intermediate section */}
      {skillData.intermediate.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-blue-700">Intermediate</h2>
            <Badge className="bg-blue-100 text-blue-700">{skillData.intermediate.length}</Badge>
          </div>
          <div className="space-y-2">
            {skillData.intermediate.map(entry => (
              <SkillBrowseRow key={entry.employee_id_num} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* Novice section */}
      {skillData.novice.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-700">Novice</h2>
            <Badge className="bg-gray-100 text-gray-700">{skillData.novice.length}</Badge>
          </div>
          <div className="space-y-2">
            {skillData.novice.map(entry => (
              <SkillBrowseRow key={entry.employee_id_num} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SkillBrowseRowProps {
  entry: SkillBrowseEntry
}

function SkillBrowseRow({ entry }: SkillBrowseRowProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/people/${entry.employee_id_num}`)}
      className="w-full bg-white border border-[#EBEEF0] rounded-lg p-3 hover:shadow-md transition-shadow text-left flex items-center gap-3"
    >
      <div
        className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
      >
        {entry.name
          .split(' ')
          .slice(0, 2)
          .map(n => n[0])
          .join('')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{entry.name}</p>
        <p className="text-xs text-slate-600 truncate">
          {entry.designation} · {entry.department}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {entry.location} · {entry.years} yrs
        </p>
      </div>
      <Badge className="capitalize flex-shrink-0">
        {entry.seniority}
      </Badge>
    </button>
  )
}
