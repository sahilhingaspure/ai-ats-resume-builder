"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { resumeAPI, aiAPI } from "@/lib/api";

export default function ScorePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [skillGap, setSkillGap] = useState<any>(null);

  useEffect(() => {
    if (token) {
      resumeAPI.getAll(token).then(({ resumes }) => setResumes(resumes)).catch(() => {});
    }
  }, [token]);

  if (authLoading) return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  if (!user || !token) { router.push("/login"); return null; }

  const handleScore = async () => {
    if (!selectedResume || !jobDescription.trim()) return alert("Select a resume and paste a job description");
    setScoring(true);
    setScoreResult(null);
    setOptimizations([]);
    setSkillGap(null);
    try {
      const { score } = await aiAPI.scoreResume(token, { resumeId: selectedResume, jobDescription });
      setScoreResult(score);
    } catch (e: any) {
      alert(e.message || "Scoring failed");
    } finally {
      setScoring(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedResume || !jobDescription.trim()) return;
    setOptimizing(true);
    try {
      const { optimizations: opts } = await aiAPI.optimizeResume(token, { resumeId: selectedResume, jobDescription });
      setOptimizations(opts || []);
    } catch (e: any) {
      alert(e.message || "Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  const handleSkillGap = async () => {
    if (!selectedResume || !jobDescription.trim()) return;
    try {
      const { analysis } = await aiAPI.skillGap(token, { resumeId: selectedResume, jobDescription });
      setSkillGap(analysis);
    } catch (e: any) {
      alert(e.message || "Skill gap analysis failed");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="bg-dots fixed inset-0 pointer-events-none opacity-30" />
      <div className="fixed top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 -left-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-lg">📊</div>
          <h1 className="text-3xl font-bold text-gradient">ATS Resume Score</h1>
        </div>
        <p className="text-violet-200/70 mb-8 ml-[52px]">
          Score your resume against a specific job description and get optimization suggestions.
        </p>

        {/* Input section */}
        <div className="glass rounded-2xl p-6 mb-8 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-violet-200/80">Select Resume</label>
              <select
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
              >
                <option value="" className="bg-slate-900">-- Select a resume --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900">
                    {r.title} {r.atsScore ? `(Score: ${r.atsScore})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-violet-200/80">Job Description</label>
            <textarea
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[200px] resize-y text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleScore}
              disabled={scoring || !selectedResume || !jobDescription.trim()}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-violet-500/25 transition-all duration-300"
            >
              {scoring ? "Scoring..." : "Score Resume"}
            </button>
            {scoreResult && (
              <>
                <button
                  onClick={handleOptimize}
                  disabled={optimizing}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-blue-500/25 transition-all duration-300"
                >
                  {optimizing ? "Optimizing..." : "Get Optimizations"}
                </button>
                <button
                  onClick={handleSkillGap}
                  className="border border-violet-400/50 text-violet-300 hover:bg-violet-500/20 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300"
                >
                  Skill Gap Analysis
                </button>
              </>
            )}
          </div>
        </div>

        {/* Score results */}
        {scoreResult && (
          <div className="space-y-6 animate-slide-up delay-1">
            {/* Overall score */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-6 flex-col sm:flex-row">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      className={`stroke-current ${getScoreColor(scoreResult.totalScore)}`}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(scoreResult.totalScore / 100) * 314} 314`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(scoreResult.totalScore)}`}>
                      {scoreResult.totalScore}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <h3 className="text-xl font-semibold text-white">ATS Score Breakdown</h3>
                  {[
                    { label: "Keyword Match", value: scoreResult.keywordMatch, weight: "30%" },
                    { label: "Skills Alignment", value: scoreResult.skillsAlign, weight: "25%" },
                    { label: "Formatting", value: scoreResult.formatting, weight: "15%" },
                    { label: "Action Verbs", value: scoreResult.actionVerbs, weight: "15%" },
                    { label: "Experience Relevance", value: scoreResult.expRelevance, weight: "15%" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm w-40 text-violet-200/80">{item.label} ({item.weight})</span>
                      <div className="flex-1 bg-white/10 rounded-full h-2.5">
                        <div className={`bg-gradient-to-r ${getScoreGradient(item.value)} rounded-full h-2.5 transition-all`} style={{ width: `${item.value}%` }} />
                      </div>
                      <span className={`text-sm font-medium w-10 text-right ${getScoreColor(item.value)}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {scoreResult.suggestions?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>💡</span> Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {scoreResult.suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-violet-100/80">
                      <span className="text-yellow-400 mt-0.5">▸</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optimizations */}
            {optimizations.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>⚡</span> AI Optimizations</h3>
                <div className="space-y-4">
                  {optimizations.map((opt, i) => (
                    <div key={i} className="border border-white/10 rounded-xl p-4 bg-white/5">
                      <span className="text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                        {opt.type}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-violet-300/60 mb-1">Original</p>
                          <p className="text-sm bg-red-500/10 border border-red-400/20 text-red-200 p-2.5 rounded-lg">{opt.original}</p>
                        </div>
                        <div>
                          <p className="text-xs text-violet-300/60 mb-1">Optimized</p>
                          <p className="text-sm bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 p-2.5 rounded-lg">{opt.optimized}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gap */}
            {skillGap && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-3 text-white flex items-center gap-2"><span>🎯</span> Skill Gap Analysis</h3>
                {skillGap.missingSkills && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 text-red-300">Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(skillGap.missingSkills) ? skillGap.missingSkills : []).map((s: string, i: number) => (
                        <span key={i} className="bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {skillGap.matchedSkills && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 text-emerald-300">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(skillGap.matchedSkills) ? skillGap.matchedSkills : []).map((s: string, i: number) => (
                        <span key={i} className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {skillGap.recommendations && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-violet-300">Recommendations</p>
                    <ul className="space-y-1">
                      {(Array.isArray(skillGap.recommendations) ? skillGap.recommendations : []).map((r: string, i: number) => (
                        <li key={i} className="text-sm flex gap-2 text-violet-100/80"><span className="text-violet-400">→</span>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
