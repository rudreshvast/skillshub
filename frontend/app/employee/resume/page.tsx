"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/protected-route";
import ResumeDropzone from "@/app/components/employee/resume-dropzone";
import ExtractedProfilePreview from "@/app/components/employee/extracted-profile-preview";
import api from "@/app/lib/api";

interface ExtractedProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  current_role?: string;
  seniority?: string;
  years_of_experience?: number;
  summary?: string;
  skills: Array<{
    name: string;
    category: string;
    proficiency: string;
    years?: number;
  }>;
  inferred_skills: Array<{
    name: string;
    inferred_from: string;
    confidence: number;
    category: string;
  }>;
  projects: Array<{
    name: string;
    role?: string;
    duration?: string;
    domain?: string;
    technologies?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    issued_on?: string;
  }>;
  domain_expertise?: string[];
}

export default function ResumePage() {
  const [profile, setProfile] = useState<ExtractedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/resume/my-profile");
        setProfile(response.data || null);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleReupload = () => {
    setProfile(null);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="employee">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="employee">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resume Upload
          </h1>
          <p className="text-gray-600 mb-8">
            Upload your resume for AI-powered profile extraction
          </p>

          {profile ? (
            <>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ Resume submitted — pending HR review
                </p>
              </div>

              <ExtractedProfilePreview profile={profile} />

              <div className="mt-8">
                <button
                  onClick={handleReupload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Re-upload Resume
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <ResumeDropzone
                onSuccess={(profile: ExtractedProfile) => setProfile(profile)}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
