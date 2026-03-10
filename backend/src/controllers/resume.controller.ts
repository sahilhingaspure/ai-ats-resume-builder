import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const createResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { title, personalInfo, summary, experiences, skills, educations, projects, templateId } = req.body;

    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
        templateId,
        personalInfo: personalInfo ? { create: personalInfo } : undefined,
        summary: summary ? { create: summary } : undefined,
        experiences: experiences ? { create: experiences } : undefined,
        skills: skills ? { create: skills } : undefined,
        educations: educations ? { create: educations } : undefined,
        projects: projects ? { create: projects } : undefined,
      },
      include: {
        personalInfo: true,
        summary: true,
        experiences: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        educations: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
      },
    });

    res.status(201).json({ resume });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        personalInfo: true,
        scoringDetails: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ resumes });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        personalInfo: true,
        summary: true,
        experiences: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        educations: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
        scoringDetails: { orderBy: { createdAt: 'desc' }, take: 1 },
        optimizations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    res.json({ resume });
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { title, personalInfo, summary, experiences, skills, educations, projects, templateId } = req.body;

    const existing = await prisma.resume.findFirst({ where: { id, userId } });
    if (!existing) {
      return next(new AppError('Resume not found', 404));
    }

    // Use a transaction for atomic updates
    const resume = await prisma.$transaction(async (tx) => {
      // Update base resume
      await tx.resume.update({
        where: { id },
        data: { title, templateId },
      });

      // Update personal info
      if (personalInfo) {
        await tx.personalInfo.upsert({
          where: { resumeId: id },
          create: { ...personalInfo, resumeId: id },
          update: personalInfo,
        });
      }

      // Update summary
      if (summary) {
        await tx.summary.upsert({
          where: { resumeId: id },
          create: { ...summary, resumeId: id },
          update: summary,
        });
      }

      // Replace experiences
      if (experiences) {
        await tx.experience.deleteMany({ where: { resumeId: id } });
        if (experiences.length > 0) {
          await tx.experience.createMany({
            data: experiences.map((exp: any) => ({ ...exp, resumeId: id })),
          });
        }
      }

      // Replace skills
      if (skills) {
        await tx.skill.deleteMany({ where: { resumeId: id } });
        if (skills.length > 0) {
          await tx.skill.createMany({
            data: skills.map((s: any) => ({ ...s, resumeId: id })),
          });
        }
      }

      // Replace educations
      if (educations) {
        await tx.education.deleteMany({ where: { resumeId: id } });
        if (educations.length > 0) {
          await tx.education.createMany({
            data: educations.map((e: any) => ({ ...e, resumeId: id })),
          });
        }
      }

      // Replace projects
      if (projects) {
        await tx.project.deleteMany({ where: { resumeId: id } });
        if (projects.length > 0) {
          await tx.project.createMany({
            data: projects.map((p: any) => ({ ...p, resumeId: id })),
          });
        }
      }

      return tx.resume.findUnique({
        where: { id },
        include: {
          personalInfo: true,
          summary: true,
          experiences: { orderBy: { order: 'asc' } },
          skills: { orderBy: { order: 'asc' } },
          educations: { orderBy: { order: 'asc' } },
          projects: { orderBy: { order: 'asc' } },
        },
      });
    });

    res.json({ resume });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    const existing = await prisma.resume.findFirst({ where: { id, userId } });
    if (!existing) {
      return next(new AppError('Resume not found', 404));
    }

    await prisma.resume.delete({ where: { id } });
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    next(error);
  }
};

export const duplicateResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    const source = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        personalInfo: true,
        summary: true,
        experiences: true,
        skills: true,
        educations: true,
        projects: true,
      },
    });

    if (!source) {
      return next(new AppError('Resume not found', 404));
    }

    const { personalInfo, summary, experiences, skills, educations, projects, ...resumeData } = source;

    const newResume = await prisma.resume.create({
      data: {
        userId,
        title: `${source.title} (Copy)`,
        version: source.version + 1,
        templateId: source.templateId,
        personalInfo: personalInfo ? {
          create: {
            name: personalInfo.name,
            phone: personalInfo.phone,
            email: personalInfo.email,
            linkedin: personalInfo.linkedin,
            portfolio: personalInfo.portfolio,
            location: personalInfo.location,
          },
        } : undefined,
        summary: summary ? { create: { content: summary.content } } : undefined,
        experiences: experiences.length > 0 ? {
          create: experiences.map(({ id: _id, resumeId: _rid, ...e }: any) => e),
        } : undefined,
        skills: skills.length > 0 ? {
          create: skills.map(({ id: _id, resumeId: _rid, ...s }: any) => s),
        } : undefined,
        educations: educations.length > 0 ? {
          create: educations.map(({ id: _id, resumeId: _rid, ...ed }: any) => ed),
        } : undefined,
        projects: projects.length > 0 ? {
          create: projects.map(({ id: _id, resumeId: _rid, ...p }: any) => p),
        } : undefined,
      },
      include: {
        personalInfo: true,
        summary: true,
        experiences: true,
        skills: true,
        educations: true,
        projects: true,
      },
    });

    res.status(201).json({ resume: newResume });
  } catch (error) {
    next(error);
  }
};
