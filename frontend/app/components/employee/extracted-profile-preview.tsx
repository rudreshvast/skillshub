"use client";

interface ExtractedSkill {
  name: string;
  category: string;
  proficiency: string;
  years?: number;
}

interface InferredSkill {
  name: string;
  inferred_from: string;
  confidence: number;
  category: string;
}

interface ExtractedProject {
  name: string;
  role?: string;
  duration?: string;
  domain?: string;
  technologies?: string[];
}

interface ExtractedCertification {
  name: string;
  issuer?: string;
  issued_on?: string;
}

interface ExtractedProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  current_role?: string;
  seniority?: string;
  years_of_experience?: number;
  summary?: string;
  skills: ExtractedSkill[];
  inferred_skills: InferredSkill[];
  projects: ExtractedProject[];
  certifications: ExtractedCertification[];
  domain_expertise?: string[];
}

interface ExtractedProfilePreviewProps {
  profile: ExtractedProfile;
}

const categoryColors: Record<string, string> = {
  language: "bg-blue-100 text-blue-800",
  framework: "bg-green-100 text-green-800",
  platform: "bg-purple-100 text-purple-800",
  tool: "bg-yellow-100 text-yellow-800",
  domain: "bg-pink-100 text-pink-800",
};

export default function ExtractedProfilePreview({
  profile,
}: ExtractedProfilePreviewProps) {
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {profile.name && (
            <div>
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="text-gray-900">{profile.name}</p>
            </div>
          )}
          {profile.email && (
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
          )}
          {profile.current_role && (
            <div>
              <p className="text-sm font-medium text-gray-700">Current Role</p>
              <p className="text-gray-900">{profile.current_role}</p>
            </div>
          )}
          {profile.location && (
            <div>
              <p className="text-sm font-medium text-gray-700">Location</p>
              <p className="text-gray-900">{profile.location}</p>
            </div>
          )}
          {profile.years_of_experience !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-700">
                Years of Experience
              </p>
              <p className="text-gray-900">{profile.years_of_experience}</p>
            </div>
          )}
          {profile.seniority && (
            <div>
              <p className="text-sm font-medium text-gray-700">Seniority</p>
              <p className="text-gray-900 capitalize">{profile.seniority}</p>
            </div>
          )}
        </div>

        {profile.summary && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Summary</p>
            <p className="text-gray-600 mt-1">{profile.summary}</p>
          </div>
        )}
      </div>

      {/* Skills */}
      {((profile?.skills?.length ?? 0) > 0 || (profile?.inferred_skills?.length ?? 0) > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>

          {(profile?.skills?.length ?? 0) > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Explicit Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                      skill?.category ?? ""
                    )}`}
                  >
                    {skill?.name}
                    {skill?.years && (
                      <span className="ml-1 text-xs opacity-75">
                        ({skill.years}y)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile?.inferred_skills?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Inferred Skills (from context)
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                {profile?.inferred_skills?.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {skill?.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {skill?.inferred_from}
                      </p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {Math.round((skill?.confidence ?? 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {(profile?.projects?.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects</h2>
          <div className="space-y-3">
            {profile?.projects?.map((project, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <p className="font-medium text-gray-900">{project?.name}</p>
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  {project?.role && <p>Role: {project.role}</p>}
                  {project?.duration && <p>Duration: {project.duration}</p>}
                  {project?.domain && <p>Domain: {project.domain}</p>}
                  {(project?.technologies?.length ?? 0) > 0 && (
                    <p>Tech: {project?.technologies?.join(", ")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {(profile?.certifications?.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Certifications
          </h2>
          <div className="space-y-2">
            {profile?.certifications?.map((cert, idx) => (
              <div key={idx} className="border-l-4 border-teal-500 pl-4">
                <p className="font-medium text-gray-900">{cert?.name}</p>
                {cert?.issuer && (
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                )}
                {cert?.issued_on && (
                  <p className="text-xs text-gray-500">{cert.issued_on}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domain Expertise */}
      {(profile?.domain_expertise?.length ?? 0) > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Domain Expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile?.domain_expertise?.map((domain, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
