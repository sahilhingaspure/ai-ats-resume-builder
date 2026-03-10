import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ExportService } from '../services/export.service';
import prisma from '../utils/prisma';

const exportService = new ExportService();

export const exportPDF = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const templateId = (req.query.template as string) || 'classic';

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        personalInfo: true,
        summary: true,
        experiences: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        educations: { orderBy: { order: 'asc' } },
        projects: { orderBy: { order: 'asc' } },
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    const pdf = await exportService.generatePDF(resume, templateId);
    const safeName = (resume.personalInfo?.name || 'resume').replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_resume.pdf"`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

export const exportDOCX = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    const buffer = await exportService.generateDOCX(resume);
    const safeName = (resume.personalInfo?.name || 'resume').replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_resume.docx"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const exportPlainText = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    const text = exportService.generatePlainText(resume);
    const safeName = (resume.personalInfo?.name || 'resume').replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_resume.txt"`);
    res.send(text);
  } catch (error) {
    next(error);
  }
};
