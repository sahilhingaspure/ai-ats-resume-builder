"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { resumeAPI, aiAPI } from "@/lib/api";
import { PersonalInfo, Experience, Skill, Education, Project, SkillCategory } from "@/types";
import ResumePreview from "@/components/resume/ResumePreview";

const STEPS = ["Personal Info", "Summary", "Experience", "Skills", "Education", "Projects", "Review"];

const emptyExperience: Experience = {
  jobTitle: "", company: "", location: "", startDate: "", endDate: "",
  current: false, responsibilities: [""], order: 0,
};
const emptySkill: Skill = { name: "", category: "OTHER" as SkillCategory, order: 0 };
const emptyEducation: Education = { degree: "", university: "", graduationYear: "", gpa: "", order: 0 };
const emptyProject: Project = { name: "", description: "", technologies: [""], order: 0, githubLink: "" };

export default function BuilderPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [title, setTitle] = useState("My Resume");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "", email: "", phone: "", linkedin: "", portfolio: "", location: "",
  });
  const [summaryContent, setSummaryContent] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([{ ...emptyExperience }]);
  const [skills, setSkills] = useState<Skill[]>([{ ...emptySkill }]);
  const [educations, setEducations] = useState<Education[]>([{ ...emptyEducation }]);
  const [projects, setProjects] = useState<Project[]>([{ ...emptyProject }]);

  if (authLoading) return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  if (!user || !token) { router.push("/login"); return null; }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // ── AI helpers ──
  const generateAISummary = async () => {
    if (!token) return;
    setAiLoading(true);
    try {
      const skillNames = skills.filter(s => s.name).map(s => s.name);
      const expStr = experiences.filter(e => e.jobTitle).map(e => `${e.jobTitle} at ${e.company}`).join(", ");
      const role = experiences[0]?.jobTitle || personalInfo.name || "Professional";
      const { summary } = await aiAPI.generateSummary(token, {
        role,
        experience: expStr || role,
        skills: skillNames.length > 0 ? skillNames : [role],
      });
      setSummaryContent(summary);
    } catch (e: any) {
      alert(e.message || "Failed to generate summary");
    } finally {
      setAiLoading(false);
    }
  };

  const enhanceBullet = async (expIdx: number, bulletIdx: number) => {
    if (!token) return;
    const bullet = experiences[expIdx].responsibilities[bulletIdx];
    if (!bullet.trim()) return;
    setAiLoading(true);
    try {
      const { enhanced } = await aiAPI.enhanceBullet(token, {
        bulletPoint: bullet,
        role: experiences[expIdx].jobTitle,
        company: experiences[expIdx].company,
      });
      const updated = [...experiences];
      updated[expIdx] = {
        ...updated[expIdx],
        responsibilities: updated[expIdx].responsibilities.map((r, i) => i === bulletIdx ? enhanced : r),
      };
      setExperiences(updated);
    } catch (e: any) {
      alert(e.message || "Failed to enhance bullet");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Save ──
  const saveResume = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const data = {
        title,
        personalInfo,
        summary: summaryContent ? { content: summaryContent } : undefined,
        experiences: experiences.filter(e => e.jobTitle).map((e, i) => ({ ...e, order: i })),
        skills: skills.filter(s => s.name).map((s, i) => ({ ...s, order: i })),
        educations: educations.filter(e => e.degree).map((e, i) => ({ ...e, order: i })),
        projects: projects.filter(p => p.name).map((p, i) => ({ ...p, order: i })),
      };
      const { resume } = await resumeAPI.create(token, data);
      router.push(`/dashboard`);
    } catch (e: any) {
      alert(e.message || "Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  // ── Experience helpers ──
  const updateExp = (idx: number, field: string, value: any) => {
    const updated = [...experiences];
    updated[idx] = { ...updated[idx], [field]: value };
    setExperiences(updated);
  };
  const addResponsibility = (idx: number) => {
    const updated = [...experiences];
    updated[idx] = { ...updated[idx], responsibilities: [...updated[idx].responsibilities, ""] };
    setExperiences(updated);
  };
  const updateResponsibility = (expIdx: number, bulletIdx: number, value: string) => {
    const updated = [...experiences];
    updated[expIdx] = {
      ...updated[expIdx],
      responsibilities: updated[expIdx].responsibilities.map((r, i) => i === bulletIdx ? value : r),
    };
    setExperiences(updated);
  };
  const removeResponsibility = (expIdx: number, bulletIdx: number) => {
    const updated = [...experiences];
    updated[expIdx] = {
      ...updated[expIdx],
      responsibilities: updated[expIdx].responsibilities.filter((_, i) => i !== bulletIdx),
    };
    setExperiences(updated);
  };

  // ── Skill helpers ──
  const updateSkill = (idx: number, field: string, value: any) => {
    const updated = [...skills];
    updated[idx] = { ...updated[idx], [field]: value };
    setSkills(updated);
  };

  // ── Education helpers ──
  const updateEdu = (idx: number, field: string, value: any) => {
    const updated = [...educations];
    updated[idx] = { ...updated[idx], [field]: value };
    setEducations(updated);
  };

  // ── Project helpers ──
  const updateProject = (idx: number, field: string, value: any) => {
    const updated = [...projects];
    updated[idx] = { ...updated[idx], [field]: value };
    setProjects(updated);
  };
  const updateTech = (projIdx: number, techIdx: number, value: string) => {
    const updated = [...projects];
    updated[projIdx] = {
      ...updated[projIdx],
      technologies: updated[projIdx].technologies.map((t, i) => i === techIdx ? value : t),
    };
    setProjects(updated);
  };

  const resumeData = {
    title,
    personalInfo,
    summary: summaryContent ? { content: summaryContent } : undefined,
    experiences, skills, educations, projects,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="bg-dots fixed inset-0 pointer-events-none opacity-30" />
      <div className="fixed top-20 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 -right-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Title */}
        <div className="mb-6 animate-slide-up">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b border-violet-500/30 focus:border-violet-400 outline-none pb-1 w-full max-w-md text-white placeholder:text-violet-300/40"
            placeholder="Resume Title"
          />
        </div>

        {/* Steps indicator */}
        <div className="flex gap-1 mb-8 overflow-x-auto animate-slide-up delay-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                i === step
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25"
                  : i < step
                  ? "bg-violet-500/20 text-violet-300 border border-violet-400/30"
                  : "bg-white/5 text-violet-300/50 border border-white/10"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass rounded-2xl p-6 animate-slide-up delay-2">
            {/* Step 0: Personal Info */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>👤</span> Personal Information</h3>
                <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Full Name *" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
                <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Email *" type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Phone" value={personalInfo.phone || ""} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Location" value={personalInfo.location || ""} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} />
                <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="LinkedIn URL" value={personalInfo.linkedin || ""} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} />
                <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Portfolio URL" value={personalInfo.portfolio || ""} onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })} />
              </div>
            )}

            {/* Step 1: Summary */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>📝</span> Professional Summary</h3>
                  <button onClick={generateAISummary} disabled={aiLoading} className="text-sm bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-4 py-1.5 rounded-xl disabled:opacity-50 shadow-lg shadow-violet-500/25 transition-all">
                    {aiLoading ? "Generating..." : "AI Generate"}
                  </button>
                </div>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[200px] resize-y text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Write a professional summary or click AI Generate..."
                  value={summaryContent}
                  onChange={(e) => setSummaryContent(e.target.value)}
                />
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>💼</span> Experience</h3>
                  <button onClick={() => setExperiences([...experiences, { ...emptyExperience }])} className="text-sm bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-violet-500/25">
                    + Add
                  </button>
                </div>
                {experiences.map((exp, idx) => (
                  <div key={idx} className="border border-white/10 bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm text-violet-300">Experience #{idx + 1}</span>
                      {experiences.length > 1 && (
                        <button onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                      )}
                    </div>
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Job Title *" value={exp.jobTitle} onChange={(e) => updateExp(idx, "jobTitle", e.target.value)} />
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Company *" value={exp.company} onChange={(e) => updateExp(idx, "company", e.target.value)} />
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Location" value={exp.location || ""} onChange={(e) => updateExp(idx, "location", e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExp(idx, "startDate", e.target.value)} />
                      <input className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="End Date" value={exp.endDate || ""} onChange={(e) => updateExp(idx, "endDate", e.target.value)} disabled={exp.current} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-violet-200/80">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(idx, "current", e.target.checked)} className="accent-violet-500" />
                      Currently working here
                    </label>
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-violet-200/80">Responsibilities</span>
                      {exp.responsibilities.map((r, bi) => (
                        <div key={bi} className="flex gap-2">
                          <input className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Responsibility..." value={r} onChange={(e) => updateResponsibility(idx, bi, e.target.value)} />
                          <button onClick={() => enhanceBullet(idx, bi)} disabled={aiLoading} className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 rounded-xl disabled:opacity-50 hover:bg-blue-500/30 transition-colors" title="AI Enhance">AI</button>
                          {exp.responsibilities.length > 1 && (
                            <button onClick={() => removeResponsibility(idx, bi)} className="text-red-400 text-xs px-2 hover:text-red-300">X</button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addResponsibility(idx)} className="text-xs text-violet-400 hover:text-violet-300">+ Add Responsibility</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>🎯</span> Skills</h3>
                  <button onClick={() => setSkills([...skills, { ...emptySkill }])} className="text-sm bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-violet-500/25">
                    + Add
                  </button>
                </div>
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Skill name" value={skill.name} onChange={(e) => updateSkill(idx, "name", e.target.value)} />
                    <select className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50" value={skill.category} onChange={(e) => updateSkill(idx, "category", e.target.value)}>
                      <option value="LANGUAGE" className="bg-slate-900">Language</option>
                      <option value="FRAMEWORK" className="bg-slate-900">Framework</option>
                      <option value="TOOL" className="bg-slate-900">Tool</option>
                      <option value="CLOUD" className="bg-slate-900">Cloud</option>
                      <option value="DATABASE" className="bg-slate-900">Database</option>
                      <option value="SOFT_SKILL" className="bg-slate-900">Soft Skill</option>
                      <option value="OTHER" className="bg-slate-900">Other</option>
                    </select>
                    {skills.length > 1 && (
                      <button onClick={() => setSkills(skills.filter((_, i) => i !== idx))} className="text-red-400 text-xs hover:text-red-300">X</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Education */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>🎓</span> Education</h3>
                  <button onClick={() => setEducations([...educations, { ...emptyEducation }])} className="text-sm bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-violet-500/25">
                    + Add
                  </button>
                </div>
                {educations.map((edu, idx) => (
                  <div key={idx} className="border border-white/10 bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm text-violet-300">Education #{idx + 1}</span>
                      {educations.length > 1 && (
                        <button onClick={() => setEducations(educations.filter((_, i) => i !== idx))} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                      )}
                    </div>
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Degree *" value={edu.degree} onChange={(e) => updateEdu(idx, "degree", e.target.value)} />
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="University *" value={edu.university} onChange={(e) => updateEdu(idx, "university", e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Graduation Year" value={edu.graduationYear} onChange={(e) => updateEdu(idx, "graduationYear", e.target.value)} />
                      <input className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="GPA (optional)" value={edu.gpa || ""} onChange={(e) => updateEdu(idx, "gpa", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 5: Projects */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>🚀</span> Projects</h3>
                  <button onClick={() => setProjects([...projects, { ...emptyProject }])} className="text-sm bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-1.5 rounded-xl shadow-lg shadow-violet-500/25">
                    + Add
                  </button>
                </div>
                {projects.map((proj, idx) => (
                  <div key={idx} className="border border-white/10 bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm text-violet-300">Project #{idx + 1}</span>
                      {projects.length > 1 && (
                        <button onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                      )}
                    </div>
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Project Name *" value={proj.name} onChange={(e) => updateProject(idx, "name", e.target.value)} />
                    <textarea className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[80px] text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Description" value={proj.description} onChange={(e) => updateProject(idx, "description", e.target.value)} />
                    <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="GitHub Link" value={proj.githubLink || ""} onChange={(e) => updateProject(idx, "githubLink", e.target.value)} />
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-violet-200/80">Technologies</span>
                      {proj.technologies.map((t, ti) => (
                        <div key={ti} className="flex gap-2">
                          <input className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50" placeholder="Technology" value={t} onChange={(e) => updateTech(idx, ti, e.target.value)} />
                          {proj.technologies.length > 1 && (
                            <button onClick={() => {
                              const updated = [...projects];
                              updated[idx] = { ...updated[idx], technologies: updated[idx].technologies.filter((_, i) => i !== ti) };
                              setProjects(updated);
                            }} className="text-red-400 text-xs px-2 hover:text-red-300">X</button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => {
                        const updated = [...projects];
                        updated[idx] = { ...updated[idx], technologies: [...updated[idx].technologies, ""] };
                        setProjects(updated);
                      }} className="text-xs text-violet-400 hover:text-violet-300">+ Add Technology</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 6: Review */}
            {step === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span>✅</span> Review & Save</h3>
                <p className="text-sm text-violet-200/60">
                  Review your resume in the preview panel, then save when ready.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-sm text-violet-100/80">
                  <p><strong className="text-white">Title:</strong> {title}</p>
                  <p><strong className="text-white">Name:</strong> {personalInfo.name || "–"}</p>
                  <p><strong className="text-white">Email:</strong> {personalInfo.email || "–"}</p>
                  <p><strong className="text-white">Experiences:</strong> {experiences.filter(e => e.jobTitle).length}</p>
                  <p><strong className="text-white">Skills:</strong> {skills.filter(s => s.name).length}</p>
                  <p><strong className="text-white">Education:</strong> {educations.filter(e => e.degree).length}</p>
                  <p><strong className="text-white">Projects:</strong> {projects.filter(p => p.name).length}</p>
                </div>
                <button
                  onClick={saveResume}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-violet-500/25 transition-all duration-300"
                >
                  {saving ? "Saving..." : "Save Resume"}
                </button>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
              <button onClick={prev} disabled={step === 0} className="px-5 py-2.5 border border-white/20 text-violet-200/80 rounded-xl text-sm disabled:opacity-30 hover:bg-white/5 transition-colors">
                Previous
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-sm shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition-all">
                  Next
                </button>
              ) : null}
            </div>
          </div>

          {/* Preview */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <h3 className="text-sm font-medium text-violet-300/60 mb-3">Live Preview</h3>
              <div className="transform scale-[0.75] origin-top-left w-[133%]">
                <ResumePreview resume={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
