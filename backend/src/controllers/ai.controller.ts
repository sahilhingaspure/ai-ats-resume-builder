import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { AIService } from '../services/ai.service';
import { ScoringService } from '../services/scoring.service';
import prisma from '../utils/prisma';

const aiService = new AIService();
const scoringService = new ScoringService();

export const generateSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, experience, skills } = req.body;
    const summary = await aiService.generateProfessionalSummary(role, experience, skills);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

export const enhanceBulletPoint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bulletPoint, role, company } = req.body;
    const enhanced = await aiService.enhanceBulletPoint(bulletPoint, role, company);
    res.json({ enhanced });
  } catch (error) {
    next(error);
  }
};

export const categorizeSkills = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return next(new AppError('Skills array is required', 400));
    }
    const categorized = await aiService.categorizeSkills(skills);
    res.json({ skills: categorized });
  } catch (error) {
    next(error);
  }
};

export const analyzeJobDescription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { jobTitle, company, description } = req.body;

    const analysis = await aiService.analyzeJobDescription(description);

    const saved = await prisma.jobAnalysis.create({
      data: {
        userId,
        jobTitle,
        company: company || null,
        description,
        requiredSkills: analysis.requiredSkills,
        keywords: analysis.keywords,
        responsibilities: analysis.responsibilities,
        importance: analysis.importance,
      },
    });

    res.json({ analysis: saved });
  } catch (error) {
    next(error);
  }
};

export const scoreResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return next(new AppError('resumeId and jobDescription are required', 400));
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        personalInfo: true,
        summary: true,
        experiences: true,
        skills: true,
        educations: true,
        projects: true,
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    const score = await scoringService.scoreResume(resume, jobDescription);

    const saved = await prisma.scoringDetail.create({
      data: {
        resumeId,
        keywordMatch: score.keywordMatch,
        skillsAlign: score.skillsAlign,
        formatting: score.formatting,
        actionVerbs: score.actionVerbs,
        expRelevance: score.expRelevance,
        totalScore: score.totalScore,
        suggestions: score.suggestions,
      },
    });

    // Update resume's ats score
    await prisma.resume.update({
      where: { id: resumeId },
      data: { atsScore: score.totalScore },
    });

    res.json({ score: saved });
  } catch (error) {
    next(error);
  }
};

export const optimizeResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { resumeId, jobDescription } = req.body;

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        personalInfo: true,
        summary: true,
        experiences: true,
        skills: true,
        educations: true,
        projects: true,
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    const optimizations = await aiService.optimizeResumeForJob(resume, jobDescription);

    // Save optimizations
    const saved = await prisma.optimization.createMany({
      data: optimizations.map((opt: any) => ({
        resumeId,
        type: opt.type,
        original: opt.original,
        optimized: opt.optimized,
      })),
    });

    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: 'OPTIMIZED' },
    });

    res.json({ optimizations, count: saved.count });
  } catch (error) {
    next(error);
  }
};

export const getJobAnalyses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const analyses = await prisma.jobAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ analyses });
  } catch (error) {
    next(error);
  }
};

export const getSkillGapAnalysis = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { resumeId, jobDescription } = req.body;

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: { skills: true, experiences: true },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    const analysis = await aiService.skillGapAnalysis(resume, jobDescription);
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
};

export const getCareerSuggestions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, skills, experience } = req.body;
    const suggestions = await aiService.getCareerSuggestions(role, skills, experience);
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
};

export const compareResumeWithJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return next(new AppError('Both resume text and job description are required', 400));
    }
    const comparison = await aiService.compareResumeWithJob(resumeText, jobDescription);
    res.json({ comparison });
  } catch (error) {
    next(error);
  }
};
