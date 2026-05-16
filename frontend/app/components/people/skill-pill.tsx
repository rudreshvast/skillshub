'use client'

import Link from 'next/link'
import { SkillSummary } from '@/app/types/people'

interface SkillPillProps {
  skill: string
  proficiency?: 'novice' | 'intermediate' | 'expert'
  years?: number
  clickable?: boolean
  size?: 'sm' | 'md'
}

export function SkillPill({
  skill,
  proficiency,
  years,
  clickable = true,
  size = 'sm',
}: SkillPillProps) {
  const bgColor = {
    expert: 'bg-teal-100 text-teal-700',
    intermediate: 'bg-blue-100 text-blue-700',
    novice: 'bg-gray-100 text-gray-700',
    undefined: 'bg-gray-100 text-gray-700',
  }[proficiency || 'undefined']

  const padding = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'

  const skillText =
    size === 'md' && years ? `${skill} · ${years} yrs` : skill

  const content = (
    <span className={`${bgColor} ${padding} rounded-full inline-block font-medium whitespace-nowrap`}>
      {skillText}
    </span>
  )

  if (!clickable) {
    return content
  }

  const encodedSkill = encodeURIComponent(skill)
  return (
    <Link href={`/people/skills/${encodedSkill}`} className="hover:opacity-80 transition-opacity">
      {content}
    </Link>
  )
}
