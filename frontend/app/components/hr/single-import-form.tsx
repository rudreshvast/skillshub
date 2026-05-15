"use client";

import { FormEvent, useState } from "react";
import api from "@/app/lib/api";
import Toast from "@/app/components/toast";

const DEPARTMENTS = ["Engineering", "Design", "Product", "DevOps", "QA", "Data", "Management"];
const WORK_MODES = ["Remote", "Hybrid", "Onsite"];
const SENIORITY_LEVELS = ["Junior", "Mid", "Senior", "Lead", "Principal"];

interface FormErrors {
  [key: string]: string;
}

export default function SingleImportForm() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    employee_id: "",
    email: "",
    dob: "",
    date_of_joining: "",
    designation: "",
    department: "",
    location: "",
    work_mode: "",
    seniority: "Mid",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      const response = await api.post("/employees/import/single", {
        name: formData.name,
        employee_id: formData.employee_id,
        email: formData.email,
        dob: formData.dob,
        date_of_joining: formData.date_of_joining,
        designation: formData.designation,
        department: formData.department,
        location: formData.location,
        work_mode: formData.work_mode.toLowerCase(),
        seniority: formData.seniority.toLowerCase(),
      });

      setSuccess(`Successfully added ${response.data.name}`);
      setFormData({
        name: "",
        employee_id: "",
        email: "",
        dob: "",
        date_of_joining: "",
        designation: "",
        department: "",
        location: "",
        work_mode: "",
        seniority: "Mid",
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        // Check if it's a validation error with field info
        if (typeof detail === "string") {
          if (detail.includes("Email")) {
            setErrors({ email: detail });
          } else if (detail.includes("Employee ID") || detail.includes("employee_id")) {
            setErrors({ employee_id: detail });
          } else {
            setErrors({ form: detail });
          }
        }
      } else {
        setErrors({ form: "Failed to add employee. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {success && <Toast type="success" message={success} onClose={() => setSuccess(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          {/* Employee ID */}
          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID *
            </label>
            <input
              type="text"
              id="employee_id"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.employee_id ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="EMP001"
            />
            {errors.employee_id && (
              <p className="text-red-500 text-sm mt-1">{errors.employee_id}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="john.doe@company.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date of Joining */}
          <div>
            <label htmlFor="date_of_joining" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Joining *
            </label>
            <input
              type="date"
              id="date_of_joining"
              name="date_of_joining"
              value={formData.date_of_joining}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Designation */}
          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
              Designation *
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Software Engineer"
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Bangalore"
            />
          </div>

          {/* Work Mode */}
          <div>
            <label htmlFor="work_mode" className="block text-sm font-medium text-gray-700 mb-2">
              Work Mode *
            </label>
            <select
              id="work_mode"
              name="work_mode"
              value={formData.work_mode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select work mode</option>
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Seniority */}
          <div>
            <label htmlFor="seniority" className="block text-sm font-medium text-gray-700 mb-2">
              Seniority Level
            </label>
            <select
              id="seniority"
              name="seniority"
              value={formData.seniority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SENIORITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Error */}
        {errors.form && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.form}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </div>
      </form>
    </>
  );
}
