import { Router } from 'express';
import { analyzeTicker } from '../controllers/analyzeController';

const router = Router();

// Endpoint to run stock research analysis
router.get('/analyze', analyzeTicker);
router.post('/analyze', analyzeTicker);

export default router;
