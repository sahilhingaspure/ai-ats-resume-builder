import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const getAdminStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalResumes, totalOptimizations, totalJobAnalyses] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.optimization.count(),
      prisma.jobAnalysis.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const avgScore = await prisma.scoringDetail.aggregate({
      _avg: { totalScore: true },
    });

    res.json({
      stats: {
        totalUsers,
        totalResumes,
        totalOptimizations,
        totalJobAnalyses,
        averageAtsScore: Math.round(avgScore._avg.totalScore || 0),
      },
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};
