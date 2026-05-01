import jobQueue from '../services/jobQueue.js';
import { User } from '../models/User.js';
import auditService from '../services/auditService.js';

const processDataSyncJob = async (job) => {
    const { type, userId, platform, username } = job.data;

    auditService.systemEvent('data_sync_job_processing', {
        jobId: job.id,
        type,
        userId,
        platform
    });

    try {
        switch (type) {
            case 'platform_sync':
                await syncUserPlatformData(userId, platform);
                break;

            case 'bulk_sync':
                await syncAllUsersPlatformData(platform);
                break;

            case 'user_refresh':
                await refreshUserData(userId);
                break;

            default:
                throw new Error(`Unknown sync type: ${type}`);
        }

        auditService.systemEvent('data_sync_job_completed', {
            jobId: job.id,
            type,
            userId,
            platform
        });

        return { success: true, type };
    } catch (error) {
        auditService.error('data_sync_job_failed', error, {
            jobId: job.id,
            type,
            userId,
            platform
        });

        throw error;
    }
};

const syncUserPlatformData = async (userId, platform) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    switch (platform) {
        case 'leetcode':
            if (user.leetCode?.username) {
                auditService.info('Syncing LeetCode data', { userId, username: user.leetCode.username });
            }
            break;

        case 'codeforces':
            if (user.codeforces?.username) {
                auditService.info('Syncing Codeforces data', { userId, username: user.codeforces.username });
            }
            break;

        default:
            throw new Error(`Unknown platform: ${platform}`);
    }
};

const syncAllUsersPlatformData = async (platform) => {
    const users = await User.find({
        isVerified: true,
        [`${platform}.username`]: { $exists: true, $ne: '' }
    }).limit(100);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
        try {
            await syncUserPlatformData(user._id, platform);
            successCount++;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            failCount++;
            auditService.error('Bulk sync user failed', error, {
                userId: user._id,
                platform
            });
        }
    }

    auditService.systemEvent('bulk_sync_completed', {
        platform,
        total: users.length,
        success: successCount,
        failed: failCount
    });
};


const refreshUserData = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    const platforms = ['leetcode', 'codeforces'];
    
    for (const platform of platforms) {
        try {
            await syncUserPlatformData(userId, platform);
        } catch (error) {
            auditService.error('User refresh platform failed', error, {
                userId,
                platform
            });
        }
    }
};

export const initializeDataSyncWorker = () => {
    const worker = jobQueue.registerWorker('dataSync', processDataSyncJob);
    
    if (worker) {
        auditService.systemEvent('data_sync_worker_started');
        
        jobQueue.scheduleRecurringJob('dataSync', {
            type: 'bulk_sync',
            platform: 'leetcode'
        }, {
            pattern: '0 * * * *'
        });
    }
    
    return worker;
};

export const queueUserPlatformSync = async (userId, platform) => {
    return jobQueue.addDataSyncJob({
        type: 'platform_sync',
        userId,
        platform
    });
};


export const queueUserDataRefresh = async (userId) => {
    return jobQueue.addDataSyncJob({
        type: 'user_refresh',
        userId
    });
};

export default {
    initializeDataSyncWorker,
    queueUserPlatformSync,
    queueUserDataRefresh,
    processDataSyncJob
};
