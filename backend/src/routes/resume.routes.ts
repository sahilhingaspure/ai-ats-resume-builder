import { Router } from 'express';
import {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  duplicateResume,
} from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createResumeSchema, updateResumeSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post('/', validate(createResumeSchema), createResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.put('/:id', validate(updateResumeSchema), updateResume);
router.delete('/:id', deleteResume);
router.post('/:id/duplicate', duplicateResume);

export default router;
