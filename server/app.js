import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import platformRoute from "./routes/platformsRoute.js";
import statsRoutes from "./routes/statsRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import typeSenseRoutes from "./routes/typeSenseRoutes.js";
import { startStreakCronJob } from './utils/streakResetJob.js';
import { appLifecycle } from './utils/appLifecycle.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { ensureDbConnection } from './lib/db.js';
import jobQueue from './services/jobQueue.js';
import { initializeEmailWorker } from './workers/emailWorker.js';
import { initializeDataSyncWorker } from './workers/dataSyncWorker.js';
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ limit: '5mb', extended: false }));

app.use(cookieParser());
app.use(passport.initialize());

app.use(ensureDbConnection);


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/auth/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/platforms', platformRoute);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/search', typeSenseRoutes);

if (process.env.NODE_ENV !== 'test') {
    startStreakCronJob();
    appLifecycle.initialize();
    
    jobQueue.initialize();
    initializeEmailWorker();
    initializeDataSyncWorker();
}

export const cleanup = async () => {
    await jobQueue.shutdown();
    return appLifecycle.cleanup();
};

app.get('/hello', (req, res) => { return res.status(200).send("Hello, World!") })

app.get('/health', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';

    let redisStatus = 'not_configured';
    if (process.env.REDIS_URL) {
      try {
        const redis = await import('redis');
        const client = redis.createClient({ url: process.env.REDIS_URL });
        await client.connect();
        await client.ping();
        await client.disconnect();
        redisStatus = 'healthy';
      } catch (error) {
        redisStatus = 'unhealthy';
      }
    }

    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus
      },
      uptime: process.uptime()
    };

    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.use('*', (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.errorCode = 'ROUTE_NOT_FOUND';
  next(error);
});

app.use(globalErrorHandler);

export default app;