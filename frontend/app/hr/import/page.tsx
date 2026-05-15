"use client";

import { useState } from "react";
import ProtectedRoute from "@/app/components/protected-route";
import SingleImportForm from "@/app/components/hr/single-import-form";
import BulkImportUpload from "@/app/components/hr/bulk-import-upload";

export default function EmployeeImportPage() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  return (
    <ProtectedRoute requiredRole="hr">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Import</h1>
          <p className="text-gray-600 mb-8">
            Add employees to the system individually or in bulk using CSV
          </p>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("single")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "single"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Add Single Employee
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "bulk"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Bulk Import
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {activeTab === "single" && <SingleImportForm />}
            {activeTab === "bulk" && <BulkImportUpload />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
