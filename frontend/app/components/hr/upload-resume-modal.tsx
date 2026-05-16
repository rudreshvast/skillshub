"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import ResumeDropzone from "@/app/components/employee/resume-dropzone";

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

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
  onSuccess: () => void;
}

export default function UploadResumeModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSuccess,
}: UploadResumeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSuccess = (profile: ExtractedProfile) => {
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload resume for {employeeName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <ResumeDropzone
            onSuccess={handleSuccess}
            targetEmployeeId={employeeId}
            uploadedByHr={true}
            employeeName={employeeName}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
