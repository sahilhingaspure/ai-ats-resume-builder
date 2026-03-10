export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface PersonalInfo {
  id?: string;
  name: string;
  phone?: string;
  email: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
}

export interface Summary {
  id?: string;
  content: string;
}

export interface Experience {
  id?: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  responsibilities: string[];
  order: number;
}

export type SkillCategory = 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'CLOUD' | 'DATABASE' | 'SOFT_SKILL' | 'OTHER';

export interface Skill {
  id?: string;
  name: string;
  category: SkillCategory;
  level?: number;
  order: number;
}

export interface Education {
  id?: string;
  degree: string;
  university: string;
  graduationYear: string;
  gpa?: string;
  order: number;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  githubLink?: string;
  order: number;
}

export interface Resume {
  id: string;
  title: string;
  version: number;
  status: 'DRAFT' | 'COMPLETED' | 'OPTIMIZED';
  atsScore?: number;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  personalInfo?: PersonalInfo;
  summary?: Summary;
  experiences: Experience[];
  skills: Skill[];
  educations: Education[];
  projects: Project[];
  scoringDetails?: ScoringDetail[];
  optimizations?: Optimization[];
}

export interface ScoringDetail {
  id: string;
  keywordMatch: number;
  skillsAlign: number;
  formatting: number;
  actionVerbs: number;
  expRelevance: number;
  totalScore: number;
  suggestions: string[];
  createdAt: string;
}

export interface Optimization {
  id: string;
  type: string;
  original: string;
  optimized: string;
  applied: boolean;
  createdAt: string;
}

export interface JobAnalysis {
  id: string;
  jobTitle: string;
  company?: string;
  description: string;
  requiredSkills: string[];
  keywords: string[];
  responsibilities: string[];
  importance?: Record<string, number>;
  createdAt: string;
}
