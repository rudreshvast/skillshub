"use client";

import AppLayout from "@/app/components/layout/app-layout";
import ProtectedRoute from "@/app/components/protected-route";
import { CircleDot } from "lucide-react";

export default function DashboardPage() {
  const getProficiencyColor = (
    proficiency: "Expert" | "Intermediate" | "Novice"
  ) => {
    switch (proficiency) {
      case "Expert":
        return "#ecfdf5";
      case "Intermediate":
        return "#fffbeb";
      case "Novice":
        return "#f5f3f0";
    }
  };

  const getProficiencyDot = (
    proficiency: "Expert" | "Intermediate" | "Novice"
  ) => {
    switch (proficiency) {
      case "Expert":
        return "#10b981";
      case "Intermediate":
        return "#f59e0b";
      case "Novice":
        return "#a8a29e";
    }
  };

  const getProficiencyText = (
    proficiency: "Expert" | "Intermediate" | "Novice"
  ) => {
    switch (proficiency) {
      case "Expert":
        return "#065f46";
      case "Intermediate":
        return "#92400e";
      case "Novice":
        return "#5a524e";
    }
  };

  return (
    <AppLayout>
      <ProtectedRoute>
        <div>
          {/* Page Header */}
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "-0.02em",
                color: "#1c1917",
                marginBottom: "4px",
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: "13px", color: "#78716c" }}>
              Welcome to SkillsHub — your AI-powered skills intelligence platform
            </p>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {[
              {
                label: "Total Employees",
                value: "128",
                delta: "+12 this month",
              },
              {
                label: "Skills Mapped",
                value: "2,341",
                delta: "+340 this month",
              },
              {
                label: "Pending Reviews",
                value: "8",
                delta: "2 urgent",
              },
              {
                label: "Match Score Avg",
                value: "87%",
                delta: "+3% this month",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(28,25,23,0.08)",
                  backgroundColor: "#fffcf8",
                }}
              >
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#b8b0a6",
                    marginBottom: "12px",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#1c1917",
                    marginBottom: "8px",
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: "13px", color: "#78716c" }}>
                  {stat.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Matches section */}
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1c1917",
                marginBottom: "16px",
              }}
            >
              Recent Matches
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  name: "Sarah Johnson",
                  role: "Senior React Developer",
                  skills: [
                    { name: "React", proficiency: "Expert" as const },
                    {
                      name: "TypeScript",
                      proficiency: "Expert" as const,
                    },
                    {
                      name: "Node.js",
                      proficiency: "Intermediate" as const,
                    },
                  ],
                  score: 94,
                },
                {
                  name: "Michael Chen",
                  role: "Full Stack Engineer",
                  skills: [
                    { name: "Python", proficiency: "Expert" as const },
                    {
                      name: "PostgreSQL",
                      proficiency: "Expert" as const,
                    },
                    { name: "AWS", proficiency: "Intermediate" as const },
                  ],
                  score: 87,
                },
                {
                  name: "Emma Davis",
                  role: "Product Designer",
                  skills: [
                    { name: "UI/UX", proficiency: "Expert" as const },
                    { name: "Figma", proficiency: "Expert" as const },
                    {
                      name: "Design Systems",
                      proficiency: "Intermediate" as const,
                    },
                  ],
                  score: 91,
                },
              ].map((match) => (
                <div
                  key={match.name}
                  style={{
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(28,25,23,0.08)",
                    backgroundColor: "#fffcf8",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontWeight: "600",
                        fontSize: "12px",
                        color: "white",
                        backgroundColor: "#c2682a",
                      }}
                    >
                      {match.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#1c1917",
                          marginBottom: "4px",
                        }}
                      >
                        {match.name}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#78716c",
                          marginBottom: "12px",
                        }}
                      >
                        {match.role}
                      </p>

                      {/* Skills */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {match.skills.map((skill) => (
                          <div
                            key={skill.name}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "10px",
                              fontWeight: "600",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              backgroundColor: getProficiencyColor(skill.proficiency),
                            }}
                          >
                            <CircleDot
                              size={10}
                              style={{
                                color: getProficiencyDot(skill.proficiency),
                                flexShrink: 0,
                              }}
                              fill="currentColor"
                            />
                            <span
                              style={{
                                color: getProficiencyText(skill.proficiency),
                              }}
                            >
                              {skill.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match score */}
                  <div
                    style={{
                      color: "#0d9488",
                      fontWeight: "700",
                      fontSize: "16px",
                      marginLeft: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {match.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </AppLayout>
  );
}
