"use client";

import { useEffect, useState } from "react";
import SkillsEditor from "./skills-editor";
import ProjectsEditor from "./projects-editor";
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
    is_inferred: boolean;
    confidence_score?: number;
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
  extracted_data: ExtractedProfile;
}

interface ProfileEditorProps {
  profile: PendingProfile | null;
  onApprove: (pendingProfileId: number) => Promise<void>;
  onReject: (pendingProfileId: number) => Promise<void>;
}

const scrollbarStyles = `
  .scrollbar-styled::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-styled::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  .scrollbar-styled::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  .scrollbar-styled::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const SENIORITY_LEVELS = ["junior", "mid", "senior", "lead", "principal"];

export default function ProfileEditor({
  profile,
  onApprove,
  onReject,
}: ProfileEditorProps) {
  const [editedData, setEditedData] = useState<ExtractedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditedData({ ...profile.extracted_data });
    }
  }, [profile]);

  if (!profile || !editedData) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <p className="text-gray-500">Select a profile to review</p>
      </div>
    );
  }

  const handleBasicInfoChange = (field: string, value: any) => {
    setEditedData({
      ...editedData,
      [field]: value,
    });
  };

  const handleSkillsChange = (skills: any[]) => {
    setEditedData({
      ...editedData,
      skills: skills.filter((s) => !s.is_inferred),
      inferred_skills: skills.filter((s) => s.is_inferred),
    });
  };

  const handleProjectsChange = (projects: any[]) => {
    setEditedData({
      ...editedData,
      projects,
    });
  };

  const handleCertificationChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...editedData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setEditedData({
      ...editedData,
      certifications: updated,
    });
  };

  const handleAddCertification = () => {
    const newCert = { name: "", issuer: "", issued_on: "" };
    setEditedData({
      ...editedData,
      certifications: [...editedData.certifications, newCert],
    });
  };

  const handleDeleteCertification = (index: number) => {
    const updated = editedData.certifications.filter((_, i) => i !== index);
    setEditedData({
      ...editedData,
      certifications: updated,
    });
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(profile.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(profile.id);
      setShowRejectConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="flex flex-col h-full bg-white">
        <div className="overflow-y-auto p-6">
        {/* Basic Info Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editedData.name || ""}
                onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Role
              </label>
              <input
                type="text"
                value={editedData.current_role || ""}
                onChange={(e) =>
                  handleBasicInfoChange("current_role", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editedData.location || ""}
                onChange={(e) =>
                  handleBasicInfoChange("location", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seniority
              </label>
              <select
                value={editedData.seniority || "mid"}
                onChange={(e) =>
                  handleBasicInfoChange("seniority", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SENIORITY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                value={editedData.years_of_experience ?? ""}
                onChange={(e) =>
                  handleBasicInfoChange(
                    "years_of_experience",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={editedData.summary || ""}
              onChange={(e) =>
                handleBasicInfoChange("summary", e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
          <SkillsEditor
            skills={[
              ...editedData.skills,
              ...editedData.inferred_skills.map((s) => ({
                ...s,
                is_inferred: true,
                confidence_score: s.confidence,
              })),
            ]}
            onChange={handleSkillsChange}
          />
        </div>

        {/* Projects Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Projects
          </h3>
          <ProjectsEditor
            projects={editedData.projects}
            onChange={handleProjectsChange}
          />
        </div>

        {/* Certifications Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Certifications
          </h3>
          {editedData.certifications.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">No certifications yet</p>
          ) : (
            <div className="space-y-3 mb-3">
              {editedData.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 items-end bg-white p-3 rounded-lg border border-gray-200"
                >
                  <input
                    type="text"
                    placeholder="Certification name"
                    value={cert.name}
                    onChange={(e) =>
                      handleCertificationChange(idx, "name", e.target.value)
                    }
                    className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Issuer"
                    value={cert.issuer || ""}
                    onChange={(e) =>
                      handleCertificationChange(idx, "issuer", e.target.value)
                    }
                    className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={cert.issued_on || ""}
                    onChange={(e) =>
                      handleCertificationChange(idx, "issued_on", e.target.value)
                    }
                    className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleDeleteCertification(idx)}
                    className="col-span-1 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={handleAddCertification}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add certification
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="border-t border-gray-200 bg-white p-4 flex gap-3 sticky bottom-0">
        <button
          onClick={() => setShowRejectConfirm(true)}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reject
        </button>
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          Approve & Save
        </button>
      </div>

      {/* Reject Confirmation Dialog */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reject Profile?
            </h3>
            <p className="text-gray-600 mb-6">
              This profile will be rejected and the employee will be notified.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
