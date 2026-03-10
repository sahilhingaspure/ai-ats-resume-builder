"use client";

import { Resume } from "@/types";

interface ResumePreviewProps {
  resume: Partial<Resume>;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  const { personalInfo, summary, experiences = [], skills = [], educations = [], projects = [] } = resume;

  return (
    <div className="bg-white text-black p-8 shadow-lg rounded-lg min-h-[800px] text-sm leading-relaxed">
      {/* Header / Personal Info */}
      {personalInfo && (
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">
            {personalInfo.name || "Your Name"}
          </h1>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-gray-600 text-xs">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary?.content && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-gray-700">{summary.content}</p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
            Experience
          </h2>
          {experiences.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">{exp.jobTitle}</span>
                  {exp.company && <span className="text-gray-600"> | {exp.company}</span>}
                </div>
                <span className="text-gray-500 text-xs">
                  {exp.startDate} – {exp.current ? "Present" : exp.endDate || ""}
                </span>
              </div>
              {exp.location && <p className="text-gray-500 text-xs">{exp.location}</p>}
              {exp.responsibilities?.length > 0 && (
                <ul className="list-disc list-inside mt-1 text-gray-700 space-y-0.5">
                  {exp.responsibilities.map((r, j) => (
                    <li key={j}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
            Education
          </h2>
          {educations.map((edu, i) => (
            <div key={i} className="mb-2 flex justify-between">
              <div>
                <span className="font-semibold">{edu.degree}</span>
                <span className="text-gray-600"> – {edu.university}</span>
                {edu.gpa && <span className="text-gray-500 text-xs ml-2">GPA: {edu.gpa}</span>}
              </div>
              <span className="text-gray-500 text-xs">{edu.graduationYear}</span>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{proj.name}</span>
                {proj.githubLink && (
                  <a href={proj.githubLink} className="text-blue-600 text-xs underline" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
              </div>
              <p className="text-gray-700 text-xs">{proj.description}</p>
              {proj.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {proj.technologies.map((t, j) => (
                    <span key={j} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!personalInfo && !summary?.content && experiences.length === 0 && skills.length === 0 && (
        <div className="flex items-center justify-center h-96 text-gray-400">
          <p>Fill in the form to see your resume preview</p>
        </div>
      )}
    </div>
  );
}
