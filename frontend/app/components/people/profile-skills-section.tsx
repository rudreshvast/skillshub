'use client'

import { Sparkles } from 'lucide-react'
import { SkillSummary } from '@/app/types/people'
import { SkillPill } from './skill-pill'
import { Badge } from '@/app/components/ui/badge'

interface ProfileSkillsSectionProps {
  skills: SkillSummary[]
}

function getProficiencyDot(proficiency: string): string {
  switch (proficiency) {
    case 'expert':
      return '🟢'
    case 'intermediate':
      return '🟡'
    case 'novice':
      return '⚪'
    default:
      return '⚪'
  }
}

export function ProfileSkillsSection({ skills }: ProfileSkillsSectionProps) {
  if (!skills || skills.length === 0) {
    return null
  }

  const categories: Record<string, SkillSummary[]> = {}
  const inferredSkills: SkillSummary[] = []

  skills.forEach(skill => {
    if (skill.is_inferred) {
      inferredSkills.push(skill)
    } else {
      if (!categories[skill.category]) {
        categories[skill.category] = []
      }
      categories[skill.category].push(skill)
    }
  })

  const sortedCategories = [
    'language',
    'framework',
    'platform',
    'tool',
    'domain',
  ].filter(cat => categories[cat])

  return (
    <div className="flex flex-col gap-6">
      {/* Verified Skills by Category */}
      {sortedCategories.map(category => (
        <div key={category}>
          <h4 className="text-xs uppercase text-slate-600 font-semibold mb-2">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {categories[category]!.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <SkillPill
                  skill={skill.skill_name}
                  proficiency={skill.proficiency}
                  years={skill.years}
                  size="md"
                />
                <span className="text-sm">{getProficiencyDot(skill.proficiency)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Inferred Skills */}
      {inferredSkills.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-600" />
            <h4 className="text-sm font-semibold text-amber-900">AI Inferred Skills</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {inferredSkills.map((skill, idx) => (
              <div key={idx} className="relative">
                <SkillPill
                  skill={skill.skill_name}
                  proficiency={skill.proficiency}
                  size="md"
                  clickable={true}
                />
                {skill.confidence_score !== null && skill.confidence_score !== undefined && (
                  <Badge className="absolute -top-2 -right-2 bg-amber-500 text-xs px-1.5">
                    {Math.round(skill.confidence_score * 100)}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
