import cacheService from "../services/cacheService.js";
import auditService from "../services/auditService.js";

const RATE_LIMIT_NAMESPACE = 'ratelimit';
const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 10;

const memoryFallback = new Map();


const cleanupMemoryFallback = () => {
    const now = Date.now();
    for (const [key, data] of memoryFallback.entries()) {
        if (now - data.windowStart > data.windowMs * 2) {
            memoryFallback.delete(key);
        }
    }
};

if (process.env.NODE_ENV !== 'test') {
    setInterval(cleanupMemoryFallback, 2 * 60 * 1000);
}


const checkRedisRateLimit = async (identifier, maxRequests, windowMs) => {
    const key = `${identifier}:${windowMs}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
        const redis = cacheService.redis;
        
        if (!redis || !cacheService.isRedisAvailable) {
            return null;
        }

        const cacheKey = cacheService.getCacheKey(RATE_LIMIT_NAMESPACE, key);
        
        await redis.zRemRangeByScore(cacheKey, 0, windowStart);
        const currentCount = await redis.zCard(cacheKey);
        
        if (currentCount >= maxRequests) {
            const oldest = await redis.zRange(cacheKey, 0, 0, { withScores: true });
            const retryAfter = oldest.length > 0 
                ? Math.ceil((oldest[0].score + windowMs - now) / 1000)
                : Math.ceil(windowMs / 1000);
            
            return {
                allowed: false,
                current: currentCount,
                limit: maxRequests,
                retryAfter,
                remaining: 0
            };
        }

        await redis.zAdd(cacheKey, { score: now, value: `${now}:${Math.random()}` });
        await redis.expire(cacheKey, Math.ceil(windowMs / 1000) + 10);

        return {
            allowed: true,
            current: currentCount + 1,
            limit: maxRequests,
            remaining: maxRequests - currentCount - 1,
            retryAfter: 0
        };
    } catch (error) {
        auditService.error('Redis rate limit check failed', error, { identifier });
        return null;
    }
};

const checkMemoryRateLimit = (identifier, maxRequests, windowMs) => {
    const key = `${identifier}:${windowMs}`;
    const now = Date.now();
    
    const data = memoryFallback.get(key);
    
    if (!data || now - data.windowStart > windowMs) {
        memoryFallback.set(key, {
            count: 1,
            windowStart: now,
            windowMs
        });
        return {
            allowed: true,
            current: 1,
            limit: maxRequests,
            remaining: maxRequests - 1,
            retryAfter: 0
        };
    }
    
    if (data.count >= maxRequests) {
        const retryAfter = Math.ceil((data.windowStart + windowMs - now) / 1000);
        return {
            allowed: false,
            current: data.count,
            limit: maxRequests,
            remaining: 0,
            retryAfter
        };
    }
    
    data.count++;
    return {
        allowed: true,
        current: data.count,
        limit: maxRequests,
        remaining: maxRequests - data.count,
        retryAfter: 0
    };
};

export const redisRateLimitMiddleware = (options = {}) => {
    const {
        maxRequests = DEFAULT_MAX_REQUESTS,
        windowMs = DEFAULT_WINDOW_MS,
        keyGenerator = (req) => req.user?._id?.toString() || req.ip,
        skipFailedRequests = false,
        message = 'Too many requests, please try again later'
    } = options;

    return async (req, res, next) => {
        if (process.env.NODE_ENV === 'test') {
            return next();
        }

        const identifier = keyGenerator(req);
        
        let result = await checkRedisRateLimit(identifier, maxRequests, windowMs);
        const usingRedis = result !== null;
        
        if (!result) {
            result = checkMemoryRateLimit(identifier, maxRequests, windowMs);
        }
        
        res.set({
            'X-RateLimit-Limit': result.limit,
            'X-RateLimit-Remaining': Math.max(0, result.remaining),
            'X-RateLimit-Reset': Math.ceil(Date.now() / 1000) + Math.ceil(windowMs / 1000)
        });

        if (!result.allowed) {
            res.set('Retry-After', result.retryAfter);
            
            auditService.security('rate_limit_exceeded', {
                identifier,
                limit: maxRequests,
                current: result.current,
                windowMs,
                ip: req.ip,
                url: req.originalUrl,
                method: req.method,
                backend: usingRedis ? 'redis' : 'memory'
            });

            return res.status(429).json({
                success: false,
                error: {
                    message,
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: result.retryAfter,
                    limit: maxRequests,
                    windowMs
                }
            });
        }

        if (result.remaining <= Math.floor(maxRequests * 0.2)) {
            auditService.warn('Rate limit approaching', {
                identifier,
                current: result.current,
                limit: maxRequests,
                remaining: result.remaining,
                url: req.originalUrl,
                backend: usingRedis ? 'redis' : 'memory'
            });
        }

        next();
    };
};

export const apiRateLimit = redisRateLimitMiddleware({
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: 'API rate limit exceeded'
});

export const authRateLimit = redisRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many authentication attempts'
});

export const registrationRateLimit = redisRateLimitMiddleware({
    maxRequests: 3,
    windowMs: 60 * 1000,
    message: 'Too many registration attempts'
});

export const challengeUpdateRateLimit = redisRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many challenge update requests'
});

export const platformUpdateRateLimit = redisRateLimitMiddleware({
    maxRequests: 3,
    windowMs: 120 * 1000,
    message: 'Platform sync rate limit exceeded'
});

export const strictRateLimit = redisRateLimitMiddleware({
    maxRequests: 10,
    windowMs: 60 * 1000,
    message: 'Rate limit exceeded'
});

export default redisRateLimitMiddleware;
