import { Router } from 'express';
import { exportPDF, exportDOCX, exportPlainText } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:id/pdf', exportPDF);
router.get('/:id/docx', exportDOCX);
router.get('/:id/text', exportPlainText);

export default router;
