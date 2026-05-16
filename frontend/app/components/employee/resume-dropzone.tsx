"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
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

interface ResumeDropzoneProps {
  onSuccess: (profile: ExtractedProfile) => void;
  targetEmployeeId?: number;
  uploadedByHr?: boolean;
  employeeName?: string;
}

type UploadStage = "idle" | "uploading" | "extracting" | "analyzing" | "done";

export default function ResumeDropzone({
  onSuccess,
  targetEmployeeId,
  uploadedByHr,
  employeeName,
}: ResumeDropzoneProps) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length === 0) {
        setError("Please select a PDF file");
        return;
      }

      const file = acceptedFiles[0];

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are accepted");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        setStage("uploading");
        const endpoint = targetEmployeeId
          ? `/resume/upload/${targetEmployeeId}`
          : "/resume/upload";
        const response = await api.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setStage("done");
        onSuccess(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to upload resume");
        setStage("idle");
      }
    },
    [onSuccess, targetEmployeeId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const getStageMessage = (stage: UploadStage): string => {
    const baseMessages: Record<UploadStage, string> = {
      idle: "Drop your resume here or click to upload",
      uploading: uploadedByHr
        ? `Uploading on behalf of ${employeeName}...`
        : "Uploading...",
      extracting: "Extracting text...",
      analyzing: "AI is analyzing your resume...",
      done: "Done!",
    };
    return baseMessages[stage];
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        } ${stage !== "idle" ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} disabled={stage !== "idle"} />

        {stage === "idle" ? (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-12l6 6m0 0l-6 6m6-6H2"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              {getStageMessage(stage)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Supports PDF resumes and LinkedIn PDF exports
            </p>
            <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              <p className="text-lg font-medium text-gray-700">
                {getStageMessage(stage)}
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
