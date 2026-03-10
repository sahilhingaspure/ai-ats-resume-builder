import { Router } from 'express';
import { analyzeJobDescription, getJobAnalyses, compareResumeWithJob } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { jobDescriptionSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post('/analyze', validate(jobDescriptionSchema), analyzeJobDescription);
router.post('/compare', compareResumeWithJob);
router.get('/', getJobAnalyses);

export default router;
