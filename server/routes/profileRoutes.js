import express from "express";
import { protect } from "../middleware/auth.js";
import { getUserProfile, updateUserProfile, getUserById, updateUserStreak } from "../controllers/profileController.js";


const router = express.Router();
router.use((req, res, next) => { console.log('DEBUG: profileRouter hit:', req.method, req.url); next(); });

router.get('/me', getUserProfile);
router.put('/update', (req, res, next) => { console.log('DEBUG: matched /update'); next(); }, protect, updateUserProfile);
router.get('/getUser', getUserById);
router.put('/streak', protect, updateUserStreak);
// router.post("/potd", postPotdChallenge);



export default router;