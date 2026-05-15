"use client"

import { Info } from "lucide-react"
import { EmployeeSkill } from "@/app/types/employee"

interface Props {
  skills: EmployeeSkill[]
}

const CATEGORIES = ["language", "framework", "platform", "tool", "domain"]

const getProficiencyColor = (proficiency: string) => {
  switch (proficiency) {
    case "expert":
      return "bg-green-100 text-green-800"
    case "intermediate":
      return "bg-blue-100 text-blue-800"
    case "novice":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function SkillsSection({ skills }: Props) {
  const verifiedSkills = skills.filter((s) => !s.is_inferred)
  const inferredSkills = skills.filter((s) => s.is_inferred)

  const groupedSkills = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = verifiedSkills.filter((s) => s.category === category)
      return acc
    },
    {} as Record<string, EmployeeSkill[]>
  )

  if (skills.length === 0) {
    return <p className="text-gray-500 italic">No skills recorded yet</p>
  }

  return (
    <div className="space-y-8">
      {/* Verified Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verified Skills</h3>
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categorySkills = groupedSkills[category]
            if (categorySkills.length === 0) return null

            return (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-700 capitalize mb-3">{category}</h4>
                <div className="space-y-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                      <span className="font-medium text-gray-900">{skill.skill_name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getProficiencyColor(skill.proficiency)}`}>
                          {skill.proficiency}
                        </span>
                        {skill.years && <span className="text-gray-600">{skill.years}y</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Inferred Skills */}
      {inferredSkills.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI-inferred skills</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-amber-600 cursor-help" />
              <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                These skills were inferred from other skills on this profile
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {inferredSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between text-sm bg-white p-3 rounded border border-amber-100">
                <span className="font-medium text-gray-900">{skill.skill_name}</span>
                {skill.confidence_score && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    {Math.round(skill.confidence_score * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
