"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import api from "@/app/lib/api";
import Toast from "@/app/components/toast";

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  created: Array<{
    id: number;
    name: string;
    email: string;
    employee_id: string;
    designation: string;
  }>;
  errors: Array<{
    row: number;
    email: string;
    reason: string;
  }>;
}

export default function BulkImportUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const csvFile = acceptedFiles.find((f) => f.name.endsWith(".csv"));
      if (csvFile) {
        setSelectedFile(csvFile);
        setError(null);
        setResult(null);
      } else {
        setError("Please upload a CSV file");
      }
    },
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/employees/import/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employee_import_template.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setError("Failed to download template");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/employees/import/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to import employees");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!result?.errors.length) return;

    const csv = [
      "Row,Email,Reason",
      ...result.errors.map((e) => `${e.row},"${e.email}","${e.reason.replace(/"/g, '""')}"`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "import_errors.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 font-medium">
            {result.success} imported successfully{result.failed > 0 ? `, ${result.failed} failed` : ""}
          </p>
        </div>

        {/* Success Table */}
        {result.created.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Successfully Imported</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Employee ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Designation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.created.map((emp) => (
                    <tr key={emp.id}>
                      <td className="px-6 py-3 text-sm text-gray-900">{emp.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{emp.email}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{emp.employee_id}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{emp.designation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error Table */}
        {result.errors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Failed Imports</h3>
            <div className="overflow-x-auto border border-red-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-red-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-red-700">Row</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-red-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-red-700">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-200">
                  {result.errors.map((err, idx) => (
                    <tr key={idx} className="bg-red-50">
                      <td className="px-6 py-3 text-sm text-red-900">{err.row}</td>
                      <td className="px-6 py-3 text-sm text-red-900">{err.email}</td>
                      <td className="px-6 py-3 text-sm text-red-900">{err.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {result.errors.length > 0 && (
            <button
              onClick={handleDownloadErrorReport}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Download Error Report
            </button>
          )}
          <Link
            href="/hr/employees"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Go to Employee Directory
          </Link>
          <button
            onClick={() => {
              setResult(null);
              setSelectedFile(null);
            }}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Import More Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Template</h3>
        <p className="text-gray-600 mb-4">
          Download the template, fill it in with employee data, and upload below
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Download CSV Template
        </button>
      </div>

      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Upload CSV File</h3>

        {error && (
          <Toast type="error" message={error} onClose={() => setError(null)} />
        )}

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-2-8l-8.5-8.5a2 2 0 00-2.8 0L8 12"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-gray-900 font-medium">
                Drag and drop your CSV file here, or click to select
              </p>
              <p className="text-gray-600 text-sm">CSV files only</p>
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-900 text-sm">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </p>
          </div>
        )}
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!selectedFile || loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        )}
        {loading ? "Importing..." : "Import Employees"}
      </button>
    </div>
  );
}
