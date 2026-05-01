import { Redis } from '@upstash/redis';
import NodeCache from 'node-cache';
import auditService from './auditService.js';

class CacheService {
    constructor() {
        this.redis = null;
        this.isRedisAvailable = false;
        
        this.memoryCache = new NodeCache({ 
            stdTTL: 300, // 5 minutes
            checkperiod: 60,
            maxKeys: 100,
            useClones: false
        });
        
        if (process.env.NODE_ENV !== 'test') {
            this.initializeRedis();
            this.setupMetrics();
        }
    }

    async initializeRedis() {
        try {
            if (process.env.REDIS_URL) {
                const redisUrl = new URL(process.env.REDIS_URL);
                const token = redisUrl.password;
                const restUrl = `https://${redisUrl.hostname}`;
                
                const isReadOnly = redisUrl.username.includes('_ro');
                
                this.redis = new Redis({
                    url: restUrl,
                    token: token,
                    retry: {
                        retries: 3,
                        backoff: (retryCount) => Math.min(retryCount * 50, 500)
                    }
                });
                
                await this.redis.ping();
                this.isRedisAvailable = !isReadOnly;
                
                console.log(`Redis connected: ${redisUrl.hostname} (${isReadOnly ? 'read-only - using memory cache' : 'read-write'})`);
            }
        } catch (error) {
            console.warn('Redis connection failed:', error.message);
            this.isRedisAvailable = false;
        }
    }

    setupMetrics() {
        this.metrics = {
            hits: 0,
            misses: 0,
            errors: 0,
            operations: 0
        };
        
        setInterval(() => {
            if (this.metrics.operations > 0) {
                const hitRate = (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100;
                auditService.performance('cache_metrics', {
                    hitRate: hitRate.toFixed(2),
                    hits: this.metrics.hits,
                    misses: this.metrics.misses,
                    errors: this.metrics.errors,
                    operations: this.metrics.operations,
                    redisAvailable: this.isRedisAvailable
                });
                
                this.metrics = { hits: 0, misses: 0, errors: 0, operations: 0 };
            }
        }, 5 * 60000);
    }

    getCacheKey(namespace, key) {
        return `codequest:${namespace}:${key}`;
    }

    // Get from cache with fallback
    async get(namespace, key, defaultTTL = 300) {
        const cacheKey = this.getCacheKey(namespace, key);
        this.metrics.operations++;

        try {
            let value = null;
            
            if (this.isRedisAvailable && this.redis) {
                try {
                    const redisValue = await this.redis.get(cacheKey);
                    if (redisValue !== null) {
                        value = typeof redisValue === 'string' ? JSON.parse(redisValue) : redisValue;
                        this.metrics.hits++;
                        return value;
                    }
                } catch (error) {
                    this.isRedisAvailable = false;
                    console.warn('Redis cache get failed:', error.message);
                    this.metrics.errors++;
                }
            }
            
            value = this.memoryCache.get(cacheKey);
            if (value !== undefined) {
                this.metrics.hits++;
                auditService.cacheEvent('cache_memory_hit', { namespace, key });
                return value;
            }
            
            this.metrics.misses++;
            auditService.cacheEvent('cache_miss', { namespace, key });
            return null;
            
        } catch (error) {
            this.metrics.errors++;
            auditService.error('cache_get_error', { error: error.message, namespace, key });
            return null;
        }
    }

    async set(namespace, key, value, ttl = 300) {
        const cacheKey = this.getCacheKey(namespace, key);
        this.metrics.operations++;

        try {
            const serializedValue = JSON.stringify(value);
            
            if (this.isRedisAvailable && this.redis) {
                try {
                    await this.redis.set(cacheKey, serializedValue, { ex: ttl });
                } catch (error) {
                    this.isRedisAvailable = false;
                    console.warn('Redis cache set failed:', error.message);
                    this.metrics.errors++;
                }
            }
            
            this.memoryCache.set(cacheKey, value, ttl);
            
        } catch (error) {
            this.metrics.errors++;
            console.error('Cache set error:', error.message);
        }
    }

    async del(namespace, key) {
        const cacheKey = this.getCacheKey(namespace, key);
        this.metrics.operations++;

        try {
            if (this.isRedisAvailable) {
                try {
                    await this.redis.del(cacheKey);
                    auditService.cacheEvent('cache_redis_del', { namespace, key });
                } catch (error) {
                    auditService.error('cache_redis_del_error', { error: error.message, key: cacheKey });
                    this.metrics.errors++;
                }
            }
            
            this.memoryCache.del(cacheKey);
            auditService.cacheEvent('cache_memory_del', { namespace, key });
            
        } catch (error) {
            this.metrics.errors++;
            auditService.error('cache_del_error', { error: error.message, namespace, key });
        }
    }

    async clearNamespace(namespace) {
        this.metrics.operations++;

        try {
            if (this.isRedisAvailable) {
                try {
                    const pattern = this.getCacheKey(namespace, '*');
                    const keys = await this.redis.keys(pattern);
                    if (keys.length > 0) {
                        await this.redis.del(...keys);
                    }
                    auditService.cacheEvent('cache_redis_namespace_cleared', { namespace, keysDeleted: keys.length });
                } catch (error) {
                    auditService.error('cache_redis_clear_namespace_error', { error: error.message, namespace });
                    this.metrics.errors++;
                }
            }
            
            const memoryKeys = this.memoryCache.keys().filter(key => key.startsWith(this.getCacheKey(namespace, '')));
            memoryKeys.forEach(key => this.memoryCache.del(key));
            auditService.cacheEvent('cache_memory_namespace_cleared', { namespace, keysDeleted: memoryKeys.length });
            
        } catch (error) {
            this.metrics.errors++;
            auditService.error('cache_clear_namespace_error', { error: error.message, namespace });
        }
    }

    async getOrSet(namespace, key, fetcher, ttl = 300) {
        let value = await this.get(namespace, key);
        
        if (value === null) {
            try {
                auditService.cacheEvent('cache_fetch_started', { namespace, key });
                value = await fetcher();
                await this.set(namespace, key, value, ttl);
                auditService.cacheEvent('cache_fetch_completed', { namespace, key });
            } catch (error) {
                auditService.error('cache_fetch_error', { error: error.message, namespace, key });
                throw error;
            }
        }
        
        return value;
    }

    async healthCheck() {
        const health = {
            redis: this.isRedisAvailable,
            memory: true,
            metrics: this.metrics
        };

        if (this.isRedisAvailable) {
            try {
                await this.redis.ping();
                health.redis = true;
            } catch (error) {
                health.redis = false;
                this.isRedisAvailable = false;
                auditService.error('cache_redis_health_check_failed', { error: error.message });
            }
        }

        return health;
    }

    getStats() {
        return {
            redis: {
                available: this.isRedisAvailable,
                url: process.env.REDIS_URL ? 'configured' : 'not configured'
            },
            memory: this.memoryCache.getStats(),
            metrics: { ...this.metrics }
        };
    }

    isRedisConnected() {
        return this.redis !== null;
    }
}

export default new CacheService();