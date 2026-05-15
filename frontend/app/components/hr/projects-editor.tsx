"use client";

import { useState } from "react";

interface Project {
  name: string;
  role?: string;
  duration?: string;
  domain?: string;
  technologies?: string[];
}

interface ProjectsEditorProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export default function ProjectsEditor({
  projects,
  onChange,
}: ProjectsEditorProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  const handleProjectChange = (
    index: number,
    field: keyof Project,
    value: any
  ) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDeleteProject = (index: number) => {
    const updated = projects.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddProject = () => {
    const newProject: Project = {
      name: "",
      role: "",
      duration: "",
      domain: "",
      technologies: [],
    };
    onChange([...projects, newProject]);
    setExpanded(new Set([...expanded, projects.length]));
  };

  return (
    <div className="space-y-3">
      {projects.length === 0 ? (
        <p className="text-sm text-gray-500 mb-3">No projects yet</p>
      ) : (
        projects.map((project, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg bg-gray-50">
            <button
              onClick={() => toggleExpand(idx)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100"
            >
              <p className="font-medium text-gray-900">
                {project.name || "Untitled Project"}
              </p>
              <span
                className={`text-gray-600 transition-transform ${
                  expanded.has(idx) ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {expanded.has(idx) && (
              <div className="border-t border-gray-200 px-4 py-3 bg-white space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) =>
                      handleProjectChange(idx, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={project.role || ""}
                    onChange={(e) =>
                      handleProjectChange(idx, "role", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={project.duration || ""}
                    onChange={(e) =>
                      handleProjectChange(idx, "duration", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={project.domain || ""}
                    onChange={(e) =>
                      handleProjectChange(idx, "domain", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technologies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(project.technologies || []).join(", ")}
                    onChange={(e) =>
                      handleProjectChange(
                        idx,
                        "technologies",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => handleDeleteProject(idx)}
                  className="w-full text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <button
        onClick={handleAddProject}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Add project
      </button>
    </div>
  );
}
