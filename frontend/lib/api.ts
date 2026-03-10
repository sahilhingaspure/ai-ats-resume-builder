const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ──
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    fetchAPI<{ user: any; token: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchAPI<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getProfile: (token: string) =>
    fetchAPI<{ user: any }>('/auth/profile', { token }),

  forgotPassword: (email: string) =>
    fetchAPI<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    fetchAPI<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};

// ── Resumes ──
export const resumeAPI = {
  create: (token: string, data: any) =>
    fetchAPI<{ resume: any }>('/resumes', { method: 'POST', body: JSON.stringify(data), token }),

  getAll: (token: string) =>
    fetchAPI<{ resumes: any[] }>('/resumes', { token }),

  getById: (token: string, id: string) =>
    fetchAPI<{ resume: any }>(`/resumes/${id}`, { token }),

  update: (token: string, id: string, data: any) =>
    fetchAPI<{ resume: any }>(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),

  delete: (token: string, id: string) =>
    fetchAPI<{ message: string }>(`/resumes/${id}`, { method: 'DELETE', token }),

  duplicate: (token: string, id: string) =>
    fetchAPI<{ resume: any }>(`/resumes/${id}/duplicate`, { method: 'POST', token }),
};

// ── AI ──
export const aiAPI = {
  generateSummary: (token: string, data: { role: string; experience: string; skills: string[] }) =>
    fetchAPI<{ summary: string }>('/ai/generate-summary', { method: 'POST', body: JSON.stringify(data), token }),

  enhanceBullet: (token: string, data: { bulletPoint: string; role?: string; company?: string }) =>
    fetchAPI<{ enhanced: string }>('/ai/enhance-bullet', { method: 'POST', body: JSON.stringify(data), token }),

  categorizeSkills: (token: string, skills: string[]) =>
    fetchAPI<{ skills: any[] }>('/ai/categorize-skills', { method: 'POST', body: JSON.stringify({ skills }), token }),

  scoreResume: (token: string, data: { resumeId: string; jobDescription: string }) =>
    fetchAPI<{ score: any }>('/ai/score-resume', { method: 'POST', body: JSON.stringify(data), token }),

  optimizeResume: (token: string, data: { resumeId: string; jobDescription: string }) =>
    fetchAPI<{ optimizations: any[]; count: number }>('/ai/optimize-resume', { method: 'POST', body: JSON.stringify(data), token }),

  skillGap: (token: string, data: { resumeId: string; jobDescription: string }) =>
    fetchAPI<{ analysis: any }>('/ai/skill-gap', { method: 'POST', body: JSON.stringify(data), token }),

  careerSuggestions: (token: string, data: { role: string; skills: string[]; experience: string }) =>
    fetchAPI<{ suggestions: any }>('/ai/career-suggestions', { method: 'POST', body: JSON.stringify(data), token }),
};

// ── Jobs ──
export const jobAPI = {
  analyze: (token: string, data: { jobTitle: string; company?: string; description: string }) =>
    fetchAPI<{ analysis: any }>('/jobs/analyze', { method: 'POST', body: JSON.stringify(data), token }),

  compare: (token: string, data: { resumeText: string; jobDescription: string }) =>
    fetchAPI<{ comparison: any }>('/jobs/compare', { method: 'POST', body: JSON.stringify(data), token }),

  getAll: (token: string) =>
    fetchAPI<{ analyses: any[] }>('/jobs', { token }),
};

// ── Export ──
export const exportAPI = {
  getPDFUrl: (id: string, template?: string) =>
    `${API_URL}/export/${id}/pdf${template ? `?template=${template}` : ''}`,

  getDOCXUrl: (id: string) =>
    `${API_URL}/export/${id}/docx`,

  getTextUrl: (id: string) =>
    `${API_URL}/export/${id}/text`,

  downloadFile: async (token: string, url: string, filename: string) => {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
