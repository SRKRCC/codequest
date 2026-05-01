import express from "express"
import { registerUser, loginUser, verifyEmail, logoutUser, googleAuthCallback, githubAuthCallback, forgotPassword, resetPassword, getCurrentUser, deleteUser } from "../controllers/authController.js"
const router = express.Router();
import passport from "../config/passport.js";
import { verifyProfiles } from "../controllers/verifyProfiles.js";
import { protect, handleGoogleCallback, handleGithubCallback } from "../middleware/auth.js";
import { registrationRateLimit, authRateLimit } from "../middleware/redisRateLimiter.js";

router.post('/register', registrationRateLimit, registerUser);
router.post('/verify', authRateLimit, verifyEmail);
router.post('/login', authRateLimit, loginUser);

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"], session: false}));
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false}));

router.get("/google/callback", handleGoogleCallback, googleAuthCallback);
router.get("/github/callback", handleGithubCallback, githubAuthCallback);

router.post("/logout", protect, logoutUser);
router.post("/forgot-password", authRateLimit, forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getCurrentUser);
router.post("/verifyacc", verifyProfiles);

router.delete('/users/:id', protect, deleteUser);

export default router;