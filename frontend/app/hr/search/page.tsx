"use client";

import { useState } from "react";
import AppLayout from "@/app/components/layout/app-layout";
import ProtectedRoute from "@/app/components/protected-route";
import SearchBar from "@/app/components/hr/search-bar";
import ParsedQueryDisplay from "@/app/components/hr/parsed-query-display";
import CandidateCard, { CandidateCardSkeleton } from "@/app/components/hr/candidate-card";
import api from "@/app/lib/api";
import type { SearchResponse } from "@/app/types/search";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.post<SearchResponse>("/search/query", { query });
      setResults(response.data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail || "Failed to search employees. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <ProtectedRoute requiredRole="hr">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Employee Search
            </h1>
            <p className="text-gray-600">
              Use natural language to find the right talent for your team
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <SearchBar onSearch={handleSearch} isLoading={loading} />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Parsed Query Display */}
          {results && (
            <ParsedQueryDisplay
              parsedQuery={results.parsed_query}
              searchNote={results.search_note}
            />
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-4">
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
              <CandidateCardSkeleton />
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {results.total_found} candidates found
                <span className="text-gray-600 font-normal text-sm ml-2">
                  Ranked by match score
                </span>
              </h2>

              {results.candidates.length > 0 ? (
                <div className="space-y-4">
                  {results.candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.employee_id}
                      candidate={candidate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No candidates found
                  </h3>
                  <p className="text-gray-600">Try broader search terms</p>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!results && !loading && !error && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Enter a natural language query to find employees
              </p>
            </div>
          )}
          </div>
        </div>
      </ProtectedRoute>
    </AppLayout>
  );
}
