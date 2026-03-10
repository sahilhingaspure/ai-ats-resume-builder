"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { jobAPI } from "@/lib/api";

type TabType = "analyze" | "compare";

export default function AnalyzerPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>("analyze");

  // Analyze tab state
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Compare tab state
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  if (authLoading) return <div className="flex justify-center items-center min-h-screen"><p className="text-violet-200">Loading...</p></div>;
  if (!user || !token) { router.push("/login"); return null; }

  const handleAnalyze = async () => {
    if (!description.trim()) return alert("Please paste a job description");
    setAnalyzing(true);
    setResult(null);
    try {
      const { analysis } = await jobAPI.analyze(token, { jobTitle, company, description });
      setResult(analysis);
    } catch (e: any) {
      alert(e.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["text/plain", "text/markdown", "application/rtf"];
    const validExtensions = [".txt", ".md", ".rtf"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      alert("Please upload a .txt, .md, or .rtf file. For PDF resumes, please copy and paste the text.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResumeText(reader.result as string);
      setUploadedFileName(file.name);
    };
    reader.onerror = () => alert("Failed to read file");
    reader.readAsText(file);
  };

  const handleCompare = async () => {
    if (!resumeText.trim()) return alert("Please upload or paste your resume text");
    if (!jobDesc.trim()) return alert("Please paste the job description");
    setComparing(true);
    setComparison(null);
    try {
      const { comparison: comp } = await jobAPI.compare(token, { resumeText, jobDescription: jobDesc });
      setComparison(comp);
    } catch (e: any) {
      alert(e.message || "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="bg-dots fixed inset-0 pointer-events-none opacity-30" />
      <div className="fixed top-20 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 -right-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-lg">🔍</div>
          <h1 className="text-3xl font-bold text-gradient">Resume & Job Analyzer</h1>
        </div>
        <p className="text-violet-200/70 mb-6 ml-[52px]">
          Analyze job descriptions or compare your resume against a job posting.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "analyze"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25"
                : "glass text-violet-200/70 hover:text-white"
            }`}
          >
            📋 Analyze Job Description
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === "compare"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25"
                : "glass text-violet-200/70 hover:text-white"
            }`}
          >
            📊 Compare Resume vs Job
          </button>
        </div>

        {/* ===== ANALYZE TAB ===== */}
        {activeTab === "analyze" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input */}
            <div className="space-y-4 animate-slide-up">
              <div className="glass rounded-2xl p-6 space-y-4">
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Job Title (e.g. Senior Frontend Developer)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <input
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Company (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[300px] resize-y text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Paste the full job description here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !description.trim()}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-violet-500/25 transition-all duration-300"
                >
                  {analyzing ? "Analyzing..." : "Analyze Job Description"}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="animate-slide-up delay-1">
              {!result && !analyzing && (
                <div className="glass rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-violet-200/60">
                      Paste a job description and click Analyze to see results here.
                    </p>
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="glass rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-3">
                    <div className="animate-spin w-10 h-10 border-4 border-violet-400 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-violet-200/70">AI is analyzing the job description...</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>🎯</span> Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(result.requiredSkills || []).map((skill: string, i: number) => (
                        <span key={i} className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>🔑</span> Important Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {(result.keywords || []).map((kw: string, i: number) => (
                        <span key={i} className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-sm">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>📝</span> Key Responsibilities</h3>
                    <ul className="space-y-2">
                      {(result.responsibilities || []).map((r: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-violet-100/80"><span className="text-violet-400 mt-0.5">▸</span><span>{r}</span></li>
                      ))}
                    </ul>
                  </div>
                  {result.importance && Object.keys(result.importance).length > 0 && (
                    <div className="glass rounded-2xl p-6">
                      <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>📊</span> Skill Importance</h3>
                      <div className="space-y-3">
                        {Object.entries(result.importance)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([skill, weight]) => (
                            <div key={skill} className="flex items-center gap-3">
                              <span className="text-sm w-32 truncate text-violet-200/80">{skill}</span>
                              <div className="flex-1 bg-white/10 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-violet-500 to-blue-500 rounded-full h-2.5 transition-all" style={{ width: `${Math.min((weight as number) * 10, 100)}%` }} />
                              </div>
                              <span className="text-xs text-violet-300 w-10 text-right">{weight as number}/10</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== COMPARE TAB ===== */}
        {activeTab === "compare" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              {/* Resume Input */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-violet-500/30 flex items-center justify-center text-sm">📄</span>
                  Your Resume
                </h3>

                {/* File Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-violet-400/30 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400/60 hover:bg-white/5 transition-all duration-300"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.rtf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFileName ? (
                    <div className="space-y-1">
                      <div className="text-2xl">✅</div>
                      <p className="text-violet-200 text-sm font-medium">{uploadedFileName}</p>
                      <p className="text-violet-300/50 text-xs">Click to upload a different file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-3xl">📤</div>
                      <p className="text-violet-200/80 text-sm font-medium">Upload Resume File</p>
                      <p className="text-violet-300/50 text-xs">Supports .txt, .md, .rtf files</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-violet-300/50 text-xs">or paste text</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[200px] resize-y text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setUploadedFileName(""); }}
                />
              </div>

              {/* Job Description Input */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center text-sm">💼</span>
                  Job Description
                </h3>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[340px] resize-y text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  placeholder="Paste the job description you want to compare against..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />
              </div>
            </div>

            {/* Compare Button */}
            <div className="text-center">
              <button
                onClick={handleCompare}
                disabled={comparing || !resumeText.trim() || !jobDesc.trim()}
                className="px-10 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-violet-500/25 transition-all duration-300 text-lg"
              >
                {comparing ? "Comparing..." : "🔍 Compare Resume vs Job"}
              </button>
            </div>

            {/* Comparing Spinner */}
            {comparing && (
              <div className="glass rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="animate-spin w-10 h-10 border-4 border-violet-400 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-violet-200/70">AI is comparing your resume against the job...</p>
                </div>
              </div>
            )}

            {/* Comparison Results */}
            {comparison && (
              <div className="space-y-6 animate-slide-up">
                {/* Match Score */}
                <div className="glass rounded-2xl p-8 text-center">
                  <h3 className="text-white font-semibold mb-4 text-lg">Match Score</h3>
                  <div className="relative inline-flex items-center justify-center w-36 h-36">
                    <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke={comparison.matchScore >= 70 ? "#22c55e" : comparison.matchScore >= 40 ? "#eab308" : "#ef4444"}
                        strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${(comparison.matchScore / 100) * 314} 314`}
                      />
                    </svg>
                    <span className="absolute text-3xl font-bold text-white">{comparison.matchScore}%</span>
                  </div>
                  <p className="mt-3 text-sm text-violet-200/60">
                    {comparison.matchScore >= 70 ? "Great match! Your resume aligns well." :
                     comparison.matchScore >= 40 ? "Decent match. Some improvements needed." :
                     "Low match. Consider significant updates."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matched Skills */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 text-emerald-300 flex items-center gap-2"><span>✅</span> Matched Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(comparison.matchedSkills || []).map((s: string, i: number) => (
                        <span key={i} className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-sm">{s}</span>
                      ))}
                      {(!comparison.matchedSkills || comparison.matchedSkills.length === 0) && (
                        <p className="text-violet-200/50 text-sm">No matched skills found</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 text-red-300 flex items-center gap-2"><span>❌</span> Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(comparison.missingSkills || []).map((s: string, i: number) => (
                        <span key={i} className="bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full text-sm">{s}</span>
                      ))}
                      {(!comparison.missingSkills || comparison.missingSkills.length === 0) && (
                        <p className="text-violet-200/50 text-sm">No missing skills</p>
                      )}
                    </div>
                  </div>

                  {/* Keyword Matches */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 text-blue-300 flex items-center gap-2"><span>🔑</span> Keyword Matches</h3>
                    <div className="flex flex-wrap gap-2">
                      {(comparison.keywordMatches || []).map((k: string, i: number) => (
                        <span key={i} className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-sm">{k}</span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 text-amber-300 flex items-center gap-2"><span>⚠️</span> Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {(comparison.missingKeywords || []).map((k: string, i: number) => (
                        <span key={i} className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-sm">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strong Points */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>💪</span> Strong Points</h3>
                  <ul className="space-y-2">
                    {(comparison.strongPoints || []).map((p: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-emerald-200/80"><span className="text-emerald-400 mt-0.5">✓</span><span>{p}</span></li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>📈</span> Suggested Improvements</h3>
                  <ul className="space-y-2">
                    {(comparison.improvements || []).map((imp: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-violet-100/80"><span className="text-violet-400 mt-0.5">▸</span><span>{imp}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
