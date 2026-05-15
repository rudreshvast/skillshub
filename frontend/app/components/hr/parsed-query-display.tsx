"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ParsedQuery } from "@/app/types/search";

interface ParsedQueryDisplayProps {
  parsedQuery: ParsedQuery;
  searchNote: string | null;
}

export default function ParsedQueryDisplay({
  parsedQuery,
  searchNote,
}: ParsedQueryDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  const hasFilters =
    parsedQuery.required_skills.length > 0 ||
    parsedQuery.preferred_skills.length > 0 ||
    parsedQuery.required_seniority ||
    parsedQuery.domain_preference ||
    parsedQuery.min_years_experience;

  if (!hasFilters) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
        AI understood your query as:
      </button>

      {expanded && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {parsedQuery.required_skills.map((skill, idx) => (
              <span
                key={`req-${idx}`}
                className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}

            {parsedQuery.preferred_skills.map((skill, idx) => (
              <span
                key={`pref-${idx}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}

            {parsedQuery.required_seniority && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {parsedQuery.required_seniority}
              </span>
            )}

            {parsedQuery.domain_preference && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                {parsedQuery.domain_preference}
              </span>
            )}

            {parsedQuery.min_years_experience && (
              <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">
                {parsedQuery.min_years_experience}+ years
              </span>
            )}
          </div>
        </div>
      )}

      {searchNote && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">{searchNote}</p>
        </div>
      )}
    </div>
  );
}
