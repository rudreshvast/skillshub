"use client";

import Link from "next/link";
import { MapPin, Briefcase, Quote } from "lucide-react";
import type { CandidateResult } from "@/app/types/search";

interface CandidateCardProps {
  candidate: CandidateResult;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-100";
  if (score >= 50) return "bg-amber-100";
  return "bg-red-100";
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return "text-green-700";
  if (score >= 50) return "text-amber-700";
  return "text-red-700";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="flex flex-col items-start gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getScoreColor(
              candidate.match_score
            )}`}
          >
            {getInitials(candidate.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
            <p className="text-sm text-gray-600">
              {candidate.seniority} {candidate.designation}
            </p>
            <p className="text-xs text-gray-500">{candidate.department}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            {candidate.location} · {candidate.work_mode}
          </div>
        </div>

        {/* Middle Column: Score & Skills */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${getScoreTextColor(
                candidate.match_score
              )}`}
            >
              {candidate.match_score.toFixed(0)}%
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              Skills: <span className="font-medium">{candidate.skill_score.toFixed(0)}</span>
            </div>
            <div>
              Seniority: <span className="font-medium">{candidate.seniority_score.toFixed(0)}</span>
            </div>
            <div>
              Domain: <span className="font-medium">{candidate.domain_score.toFixed(0)}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-1">
              {candidate.matched_skills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                >
                  {skill.skill_name}
                </span>
              ))}
              {candidate.matched_skills.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{candidate.matched_skills.length - 4} more
                </span>
              )}
            </div>

            {candidate.missing_required_skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {candidate.missing_required_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                  >
                    ✕ {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Domain */}
          {candidate.domain_expertise.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidate.domain_expertise.map((domain, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
                >
                  {domain}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Explanation & Action */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-2">
              <Quote className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 italic leading-snug">
                {candidate.explanation}
              </p>
            </div>
          </div>
          <Link
            href={`/hr/employees/${candidate.employee_id}`}
            className="px-4 py-2 border border-teal-300 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors text-center text-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CandidateCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-full space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
