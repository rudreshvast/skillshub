"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/protected-route";
import QueueList from "@/app/components/hr/queue-list";
import ProfileEditor from "@/app/components/hr/profile-editor";
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

interface PendingProfile {
  id: number;
  employee_id: number;
  extracted_data: ExtractedProfile;
  original_pdf_path: string;
  status: string;
  uploaded_at: string;
  reviewed_at?: string;
  employee_name: string;
  designation: string;
  department: string;
}

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<PendingProfile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await api.get("/resume/review-queue");
      setQueue(response.data);
      if (response.data.length > 0 && !selectedId) {
        setSelectedId(response.data[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  const selectedProfile = queue.find((p) => p.id === selectedId) || null;

  const handleApprove = async (pendingProfileId: number) => {
    const profile = queue.find((p) => p.id === pendingProfileId);
    if (!profile) return;

    try {
      await api.post(`/resume/review-queue/${pendingProfileId}/approve`, {
        extracted_data: profile.extracted_data,
      });

      // Refresh queue
      await fetchQueue();
      setSelectedId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to approve profile");
    }
  };

  const handleReject = async (pendingProfileId: number) => {
    try {
      await api.post(`/resume/review-queue/${pendingProfileId}/reject`);

      // Refresh queue
      await fetchQueue();
      setSelectedId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to reject profile");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="hr">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resume Review Queue
          </h1>
          <p className="text-gray-600 mb-6">
            Review and approve employee resume profiles
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {queue.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No pending profiles in review queue</p>
            </div>
          ) : (
            <div
              style={{ gridTemplateColumns: "35% 65%", gap: "1rem" }}
              className="grid border border-gray-200 rounded-lg overflow-hidden bg-white"
            >
              <QueueList
                items={queue}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <ProfileEditor
                profile={selectedProfile}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
