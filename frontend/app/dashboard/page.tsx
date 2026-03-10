"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { resumeAPI, exportAPI } from "@/lib/api";
import { Resume } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (token) {
      resumeAPI.getAll(token)
        .then(({ resumes }) => setResumes(resumes))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this resume?")) return;
    try {
      await resumeAPI.delete(token, id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!token) return;
    try {
      const { resume } = await resumeAPI.duplicate(token, id);
      setResumes((prev) => [resume, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const [downloadOpen, setDownloadOpen] = useState<string | null>(null);

  const handleDownload = async (resumeId: string, format: "pdf" | "docx" | "text") => {
    if (!token) return;
    const resume = resumes.find((r) => r.id === resumeId);
    const title = resume?.title || "resume";
    const ext = format === "text" ? "txt" : format;
    const url =
      format === "pdf"
        ? exportAPI.getPDFUrl(resumeId)
        : format === "docx"
        ? exportAPI.getDOCXUrl(resumeId)
        : exportAPI.getTextUrl(resumeId);
    try {
      await exportAPI.downloadFile(token, url, `${title}.${ext}`);
    } catch (err) {
      console.error(err);
    }
    setDownloadOpen(null);
  };

  if (authLoading || !user) {
    return <div className="flex items-center justify-center h-96"><p>Loading...</p></div>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-violet-50/50 via-background to-blue-50/50" />
      <div className="fixed inset-0 -z-10 bg-dots" />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome back, <span className="text-gradient">{user.name}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Manage and optimize your resumes</p>
          </div>
          <Link href="/builder">
            <Button size="lg" className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg shadow-violet-500/25 transition-all duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Resume
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Resumes", value: resumes.length, icon: "📄", gradient: "from-violet-500 to-purple-600" },
            { label: "Avg ATS Score", value: resumes.length > 0 ? Math.round(resumes.reduce((s, r) => s + (r.atsScore || 0), 0) / (resumes.filter(r => r.atsScore).length || 1)) : "—", icon: "📊", gradient: "from-blue-500 to-cyan-600" },
            { label: "Optimized", value: resumes.filter((r) => r.status === "OPTIMIZED").length, icon: "✨", gradient: "from-emerald-500 to-teal-600" },
            { label: "Drafts", value: resumes.filter((r) => r.status === "DRAFT").length, icon: "📝", gradient: "from-amber-500 to-orange-600" },
          ].map((stat, i) => (
            <Card key={i} className={`rounded-2xl border-0 bg-card/80 backdrop-blur-sm card-hover animate-slide-up-delay-${Math.min(i + 1, 4) as 1|2|3|4}`}>
              <CardHeader className="pb-2 flex flex-row items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg text-xl`}>
                  {stat.icon}
                </div>
                <div>
                  <CardDescription className="text-xs uppercase tracking-wider">{stat.label}</CardDescription>
                  <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Resume List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border bg-card/50 h-64 animate-shimmer" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card className="text-center py-20 rounded-2xl border-dashed border-2 bg-card/50 backdrop-blur-sm">
            <CardContent>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
              <p className="text-muted-foreground mb-6">Create your first resume and start applying!</p>
              <Link href="/builder">
                <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg shadow-violet-500/25">
                  Create Your First Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="rounded-2xl border bg-card/80 backdrop-blur-sm card-hover overflow-hidden group">
                {/* Top accent bar */}
                <div className={`h-1.5 ${resume.status === "OPTIMIZED" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : resume.status === "COMPLETED" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-violet-500 to-purple-500"}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{resume.title}</CardTitle>
                    <Badge variant={resume.status === "OPTIMIZED" ? "default" : "secondary"} className="rounded-full text-xs">
                      {resume.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    v{resume.version} &bull; {new Date(resume.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resume.atsScore !== null && resume.atsScore !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">ATS Score</span>
                        <span className={`font-bold ${resume.atsScore >= 80 ? "text-emerald-600" : resume.atsScore >= 60 ? "text-amber-600" : "text-red-500"}`}>{resume.atsScore}/100</span>
                      </div>
                      <Progress value={resume.atsScore} className="h-2 rounded-full" />
                    </div>
                  )}
                  {resume.personalInfo && (
                    <p className="text-sm text-muted-foreground truncate">{resume.personalInfo.name}</p>
                  )}
                  <div className="flex gap-2 mt-5">
                    <Link href={`/builder/${resume.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full rounded-lg">Edit</Button>
                    </Link>
                    <div className="relative">
                      <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setDownloadOpen(downloadOpen === resume.id ? null : resume.id)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </Button>
                      {downloadOpen === resume.id && (
                        <div className="absolute right-0 bottom-full mb-1 w-36 bg-card border rounded-xl shadow-xl z-50 overflow-hidden">
                          <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted/80 transition-colors" onClick={() => handleDownload(resume.id, "pdf")}>PDF</button>
                          <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted/80 transition-colors" onClick={() => handleDownload(resume.id, "docx")}>DOCX</button>
                          <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted/80 transition-colors" onClick={() => handleDownload(resume.id, "text")}>TXT</button>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => handleDuplicate(resume.id)}>
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(resume.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
