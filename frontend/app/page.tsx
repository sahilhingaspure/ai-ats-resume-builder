import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col overflow-hidden bg-[#030014] text-white">
      {/* ===== Hero Section ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Deep dark gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0c0a2a_0%,_#030014_50%,_#010008_100%)]" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Floating orbs — muted, deep */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-violet-600/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px]" />

        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <div className="container relative z-10 flex flex-col items-center justify-center gap-8 py-24 text-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-violet-300 shadow-sm shadow-violet-500/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              AI-Powered Resume Builder
            </span>
          </div>

          <h1 className="animate-slide-up-delay-1 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1]">
            <span className="text-white/90">Build ATS-Optimized</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Resumes with AI</span>
          </h1>

          <p className="animate-slide-up-delay-2 max-w-[640px] text-lg text-gray-400 sm:text-xl leading-relaxed">
            Create professional resumes that pass Applicant Tracking Systems.
            AI-powered content generation, keyword optimization, and instant scoring.
          </p>

          <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-10 py-6 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300">
                Get Started Free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                View Templates
              </Button>
            </Link>
          </div>

          {/* Stats bar */}
          <div className="animate-slide-up-delay-4 flex flex-wrap items-center justify-center gap-8 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"><span className="text-green-400 text-xs">&#10003;</span></div>
              <span className="text-gray-400">ATS-Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><span className="text-blue-400 text-xs">&#9733;</span></div>
              <span className="text-gray-400">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"><span className="text-violet-400 text-xs">&#8595;</span></div>
              <span className="text-gray-400">PDF/DOCX Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="relative py-24 bg-[#030014]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-violet-400">Features</span>
            <h2 className="text-4xl font-bold mt-2 text-white">Everything You Need</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Powerful tools to build, optimize, and export professional resumes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 hover:bg-white/[0.04] hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="relative py-24 overflow-hidden bg-[#030014]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0c0a2a_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

        <div className="container relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-400">How It Works</span>
            <h2 className="text-4xl font-bold mt-2 text-white">Three Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mx-auto shadow-xl shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow duration-300 rotate-3 group-hover:rotate-0">
                    <span className="text-white text-2xl font-bold">{i + 1}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-12 w-8 border-t-2 border-dashed border-violet-500/30" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="relative py-24 bg-[#030014]">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/10 backdrop-blur-sm p-16 shadow-2xl shadow-violet-500/5">
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 to-blue-600/5" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of job seekers who have optimized their resumes with AI and increased their interview rate.
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-lg px-10 py-6 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-500/25 transition-all duration-300">
                  Start Building for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/5 py-12 bg-[#020010]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-white">ATS Resume Builder</span>
            </div>
            <p className="text-sm text-gray-600">
              &copy; 2026 AI ATS Resume Builder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🤖",
    gradient: "from-violet-500 to-purple-600",
    title: "AI Content Generation",
    description: "Generate professional summaries, bullet points, and skill descriptions powered by GPT.",
  },
  {
    icon: "📊",
    gradient: "from-blue-500 to-cyan-600",
    title: "ATS Score Engine",
    description: "Get instant ATS compatibility scores and actionable improvement suggestions.",
  },
  {
    icon: "🔍",
    gradient: "from-emerald-500 to-teal-600",
    title: "Job Description Analyzer",
    description: "Extract keywords, skills, and requirements from any job description automatically.",
  },
  {
    icon: "✨",
    gradient: "from-amber-500 to-orange-600",
    title: "AI Optimization",
    description: "One-click optimization to match your resume perfectly to any job description.",
  },
  {
    icon: "📄",
    gradient: "from-pink-500 to-rose-600",
    title: "Multiple Export Formats",
    description: "Export your resume as PDF, DOCX, or plain text — all ATS-friendly formats.",
  },
  {
    icon: "📁",
    gradient: "from-indigo-500 to-violet-600",
    title: "Resume Versioning",
    description: "Save multiple resume versions, duplicate and customize for each application.",
  },
];

const steps = [
  {
    title: "Fill in Your Details",
    description: "Use our guided multi-step form to enter your experience, skills, and education.",
  },
  {
    title: "AI Optimizes Content",
    description: "Our AI enhances bullet points, generates summaries, and optimizes keywords.",
  },
  {
    title: "Export & Apply",
    description: "Download your ATS-optimized resume in PDF or DOCX and start applying confidently.",
  },
];
