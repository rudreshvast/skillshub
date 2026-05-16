"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/context/auth";
import { isHROrManagement, canManageProjects, canPostRecommended } from "@/app/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "hr" | "employee";
  requiredPermission?: "hr_or_management" | "project_access" | "recommended_author";
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { token, user, loadFromStorage } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    queueMicrotask(() => setIsLoading(false));
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredPermission) {
    let hasPermission = false;

    if (requiredPermission === "hr_or_management") {
      hasPermission = isHROrManagement(user);
    } else if (requiredPermission === "project_access") {
      hasPermission = canManageProjects(user);
    } else if (requiredPermission === "recommended_author") {
      hasPermission = canPostRecommended(user);
    }

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You do not have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
