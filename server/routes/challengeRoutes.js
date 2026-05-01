import express from 'express';
import { protect } from '../middleware/auth.js';
import { challengeUpdateRateLimit } from '../middleware/redisRateLimiter.js';
import { 
    getChallenges, 
    getChallengeById, 
    getSolutionByChallengeId, 
    getDailyChallenge, 
    getFilterOptions,
    checkPOTDStatus
} from '../controllers/challengeController.js';

const router = express.Router();
router.get('/', getChallenges);
router.get('/daily', getDailyChallenge);
router.get('/filter-options', getFilterOptions);
router.get('/:id', getChallengeById);
router.get('/solution/:id', protect, getSolutionByChallengeId);
router.post('/check-potd-status', protect, challengeUpdateRateLimit, checkPOTDStatus);

export default router;