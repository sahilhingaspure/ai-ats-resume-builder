import { Router } from 'express';
import {
  generateSummary,
  enhanceBulletPoint,
  categorizeSkills,
  scoreResume,
  optimizeResume,
  getSkillGapAnalysis,
  getCareerSuggestions,
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateSummarySchema, enhanceBulletSchema, optimizeResumeSchema } from '../utils/validators';
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { error: 'Too many AI requests, please try again shortly.' },
});

const router = Router();

router.use(authenticate);
router.use(aiLimiter);

router.post('/generate-summary', validate(generateSummarySchema), generateSummary);
router.post('/enhance-bullet', validate(enhanceBulletSchema), enhanceBulletPoint);
router.post('/categorize-skills', categorizeSkills);
router.post('/score-resume', scoreResume);
router.post('/optimize-resume', validate(optimizeResumeSchema), optimizeResume);
router.post('/skill-gap', getSkillGapAnalysis);
router.post('/career-suggestions', getCareerSuggestions);

export default router;
