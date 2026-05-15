"use client";

import { useState } from "react";

interface Skill {
  name: string;
  category: string;
  proficiency: string;
  years?: number;
  is_inferred?: boolean;
  confidence_score?: number;
}

interface SkillsEditorProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const CATEGORIES = [
  "language",
  "framework",
  "platform",
  "tool",
  "domain",
];

const PROFICIENCY_LEVELS = ["novice", "intermediate", "expert"];

export default function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  const explicitSkills = skills.filter((s) => !s.is_inferred);
  const inferredSkills = skills.filter((s) => s.is_inferred);

  const handleSkillChange = (
    index: number,
    field: keyof Skill,
    value: any
  ) => {
    const updated = [...explicitSkills];
    updated[index] = { ...updated[index], [field]: value };
    onChange([...updated, ...inferredSkills]);
  };

  const handleDeleteSkill = (index: number) => {
    const updated = explicitSkills.filter((_, i) => i !== index);
    onChange([...updated, ...inferredSkills]);
  };

  const handleAcceptInferred = (index: number) => {
    const skill = inferredSkills[index];
    const explicit = {
      ...skill,
      is_inferred: false,
      confidence_score: undefined,
    };
    const newInferred = inferredSkills.filter((_, i) => i !== index);
    onChange([...explicitSkills, explicit, ...newInferred]);
  };

  const handleDeleteInferred = (index: number) => {
    const newInferred = inferredSkills.filter((_, i) => i !== index);
    onChange([...explicitSkills, ...newInferred]);
  };

  const handleAddSkill = () => {
    const newSkill: Skill = {
      name: "",
      category: "language",
      proficiency: "intermediate",
      years: undefined,
    };
    onChange([...explicitSkills, newSkill, ...inferredSkills]);
  };

  return (
    <div className="space-y-4">
      {/* Explicit Skills */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Explicit Skills
        </h3>
        {explicitSkills.length === 0 ? (
          <p className="text-sm text-gray-500 mb-3">No explicit skills yet</p>
        ) : (
          <div className="space-y-2 mb-3">
            {explicitSkills.map((skill, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 gap-2 items-end bg-gray-50 p-3 rounded-lg"
              >
                <input
                  type="text"
                  placeholder="Skill name"
                  value={skill.name}
                  onChange={(e) =>
                    handleSkillChange(idx, "name", e.target.value)
                  }
                  className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={skill.category}
                  onChange={(e) =>
                    handleSkillChange(idx, "category", e.target.value)
                  }
                  className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={skill.proficiency}
                  onChange={(e) =>
                    handleSkillChange(idx, "proficiency", e.target.value)
                  }
                  className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Years"
                  value={skill.years ?? ""}
                  onChange={(e) =>
                    handleSkillChange(
                      idx,
                      "years",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleDeleteSkill(idx)}
                  className="col-span-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleAddSkill}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add skill
        </button>
      </div>

      {/* Inferred Skills */}
      {inferredSkills.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Inferred Skills (from resume context)
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            {inferredSkills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white p-3 rounded border border-amber-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {skill.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {skill.category} • {skill.proficiency}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    {Math.round((skill.confidence_score ?? 0) * 100)}%
                  </span>
                  <button
                    onClick={() => handleAcceptInferred(idx)}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeleteInferred(idx)}
                    className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
