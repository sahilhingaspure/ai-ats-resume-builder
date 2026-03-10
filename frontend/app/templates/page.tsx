"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout with clean lines and structured sections.",
    color: "from-gray-700 to-gray-900",
    preview: "AaBbCc",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with accent colors and a sidebar for skills.",
    color: "from-blue-600 to-indigo-700",
    preview: "AaBbCc",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, whitespace-focused design that lets your content breathe.",
    color: "from-slate-500 to-slate-700",
    preview: "AaBbCc",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold design with unique layout elements for creative professionals.",
    color: "from-purple-600 to-pink-600",
    preview: "AaBbCc",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Sophisticated layout designed for senior leadership positions.",
    color: "from-amber-700 to-yellow-800",
    preview: "AaBbCc",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Optimized for tech roles with prominent skills and project sections.",
    color: "from-emerald-600 to-teal-700",
    preview: "AaBbCc",
  },
];

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (authLoading) return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="bg-dots fixed inset-0 pointer-events-none opacity-30" />
      <div className="fixed top-10 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-32 -left-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center gap-3 mb-2 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-lg">🎨</div>
          <h1 className="text-3xl font-bold text-gradient">Resume Templates</h1>
        </div>
        <p className="text-violet-200/70 mb-8 ml-[52px] animate-slide-up delay-1">
          Choose a template to get started. You can change templates anytime while building your resume.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((t, idx) => (
            <div
              key={t.id}
              className={`glass rounded-2xl overflow-hidden card-hover cursor-pointer group animate-slide-up delay-${Math.min(idx, 4)}`}
              onClick={() => router.push(user ? "/builder" : "/login")}
            >
              {/* Template preview */}
              <div className={`h-48 bg-gradient-to-br ${t.color} flex items-center justify-center relative`}>
                <div className="bg-white/90 rounded shadow-md w-28 h-36 p-2 flex flex-col gap-1">
                  <div className="h-3 bg-gray-800 rounded-sm w-16 mx-auto" />
                  <div className="h-1.5 bg-gray-400 rounded-sm w-20 mx-auto" />
                  <div className="mt-1 h-1 bg-gray-300 rounded-sm w-full" />
                  <div className="h-1 bg-gray-300 rounded-sm w-full" />
                  <div className="h-1 bg-gray-300 rounded-sm w-3/4" />
                  <div className="mt-1 h-1 bg-gray-200 rounded-sm w-full" />
                  <div className="h-1 bg-gray-200 rounded-sm w-full" />
                  <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
                  <div className="mt-1 flex gap-1">
                    <div className="h-2 bg-gray-300 rounded-sm flex-1" />
                    <div className="h-2 bg-gray-300 rounded-sm flex-1" />
                    <div className="h-2 bg-gray-300 rounded-sm flex-1" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transform group-hover:scale-100 scale-90 transition-transform">
                    Use Template
                  </span>
                </div>
              </div>

              {/* Template info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-white">{t.name}</h3>
                <p className="text-sm text-violet-200/60">{t.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 glass rounded-2xl p-8 animate-slide-up delay-3">
          <h2 className="text-xl font-semibold mb-6 text-gradient">All Templates Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">✓</div>
              <div>
                <h3 className="font-medium mb-1 text-white">ATS-Optimized</h3>
                <p className="text-sm text-violet-200/60">
                  Every template is designed to pass Applicant Tracking Systems with proper formatting and structure.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">📄</div>
              <div>
                <h3 className="font-medium mb-1 text-white">Multiple Formats</h3>
                <p className="text-sm text-violet-200/60">
                  Export your resume as PDF, DOCX, or plain text. Perfect for any application method.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">🤖</div>
              <div>
                <h3 className="font-medium mb-1 text-white">AI-Powered Content</h3>
                <p className="text-sm text-violet-200/60">
                  Use AI to generate summaries, enhance bullet points, and optimize for specific jobs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
