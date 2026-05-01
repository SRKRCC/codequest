import express from "express";
import { codechefData, codeforcesData, fetchLeetCodeStatus, geeksforgeeksData, heatmap, leetcodeData, solvedChallenges } from "../controllers/platformsController.js";
import { protect } from "../middleware/auth.js";
import { platformUpdateRateLimit } from "../middleware/redisRateLimiter.js";
const router = express.Router();

router.post('/leetcode', platformUpdateRateLimit, leetcodeData);
// router.post('/gfg',  geeksforgeeksData);
router.post('/codeforces', platformUpdateRateLimit, codeforcesData);
// router.post('/codechef', codechefData);
router.post('/solvedChallenges', solvedChallenges);
// router.post('/leetcode/graphql', fetchLeetCodeGraphql);
router.post('/heatmap', heatmap);

export default router;