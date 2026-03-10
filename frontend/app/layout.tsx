import "@/styles/globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/navbar";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "AI ATS Resume Builder",
  description: "Generate ATS-optimized resumes using AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
