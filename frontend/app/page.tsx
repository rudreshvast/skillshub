"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import ProtectedRoute from "@/app/components/protected-route";
import { useAuthStore } from "@/app/context/auth";

function HomeContent() {
  const router = useRouter();
  const { user, logout, loadFromStorage } = useAuthStore();
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFromStorage();
    api.get("/")
      .then((res) => {
        setMessage(res.data.message);
      });
  }, [loadFromStorage]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return <div>Loading user info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SkillsHub</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{message}</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Name:</span>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email:</span>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Role:</span>
                <p className="text-gray-900 capitalize">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === "hr"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {user.role}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Status:</span>
                <p className="text-gray-900">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>

          {user.role === "hr" && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">HR Dashboard</h3>
              <p className="text-gray-600">Welcome! You have HR access to all features.</p>
            </div>
          )}

          {user.role === "employee" && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Dashboard</h3>
              <p className="text-gray-600">Welcome! You have standard employee access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}