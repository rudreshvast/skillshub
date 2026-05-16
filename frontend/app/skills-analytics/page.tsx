"use client";

import AppLayout from "@/app/components/layout/app-layout";
import ProtectedRoute from "@/app/components/protected-route";

export default function Page() {
  return (
    <AppLayout>
      <ProtectedRoute>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "#1c1917", marginBottom: "4px" }}>
            Skills Analytics
          </h1>
          <p style={{ fontSize: "13px", color: "#78716c" }}>
            Analyze skills distribution across your organization
          </p>
        </div>
      </ProtectedRoute>
    </AppLayout>
  );
}
