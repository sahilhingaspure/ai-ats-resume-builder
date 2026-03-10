import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const personalInfoSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email(),
  linkedin: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  location: z.string().max(200).optional(),
});

export const summarySchema = z.object({
  content: z.string().min(10).max(2000),
});

export const experienceSchema = z.object({
  jobTitle: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  responsibilities: z.array(z.string()).min(1),
  order: z.number().int().min(0).default(0),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['LANGUAGE', 'FRAMEWORK', 'TOOL', 'CLOUD', 'DATABASE', 'SOFT_SKILL', 'OTHER']),
  level: z.number().int().min(0).max(100).optional(),
  order: z.number().int().min(0).default(0),
});

export const educationSchema = z.object({
  degree: z.string().min(1).max(200),
  university: z.string().min(1).max(200),
  graduationYear: z.string(),
  gpa: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  technologies: z.array(z.string()),
  githubLink: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

export const createResumeSchema = z.object({
  title: z.string().min(1).max(200),
  personalInfo: personalInfoSchema.optional(),
  summary: summarySchema.optional(),
  experiences: z.array(experienceSchema).optional(),
  skills: z.array(skillSchema).optional(),
  educations: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  templateId: z.string().optional(),
});

export const updateResumeSchema = createResumeSchema.partial();

export const jobDescriptionSchema = z.object({
  jobTitle: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  description: z.string().min(20).max(10000),
});

export const generateSummarySchema = z.object({
  role: z.string().min(1),
  experience: z.string().optional().default(''),
  skills: z.array(z.string()).optional().default([]),
});

export const enhanceBulletSchema = z.object({
  bulletPoint: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
});

export const optimizeResumeSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().min(20),
});
