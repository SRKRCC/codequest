import auditService from './auditService.js';

class JobQueueService {
    constructor() {
        this.processors = {};
        this.intervals = [];
        this.isInitialized = false;
    }

    async initialize() {
        this.isInitialized = true;
        auditService.systemEvent('job_queue_initialized', { mode: 'in-memory' });
    }

    registerWorker(queueName, processor) {
        this.processors[queueName] = processor;
        auditService.systemEvent('worker_registered', { queueName });
        return { 
            on: () => {}, // Mock for compatibility if needed
            close: async () => {}
        };
    }

    async addEmailJob(data, options = {}) {
        if (!this.processors.email) {
            auditService.warn('No email worker registered, job skipped', { data });
            return null;
        }

        const job = { id: `email-${Date.now()}-${Math.random()}`, data: { ...data, type: data.type || 'email' }, attemptsMade: 0 };
        
        setImmediate(async () => {
            try {
                await this.processors.email(job);
            } catch (error) {
                auditService.error('Email job failed', error, { jobId: job.id });
            }
        });

        return job;
    }

    async addDataSyncJob(data, options = {}) {
        if (!this.processors.dataSync) {
            auditService.warn('No dataSync worker registered, job skipped', { data });
            return null;
        }

        const job = { id: `sync-${Date.now()}-${Math.random()}`, data: { ...data, type: data.type || 'sync' }, attemptsMade: 0 };

        setImmediate(async () => {
            try {
                await this.processors.dataSync(job);
            } catch (error) {
                auditService.error('Data sync job failed', error, { jobId: job.id });
            }
        });

        return job;
    }

    async scheduleRecurringJob(queueName, data, repeatOptions) {
        if (!this.processors[queueName]) {
             auditService.warn(`Cannot schedule recurring job: no worker for ${queueName}`);
             return null;
        }

        
        let intervalMs = 60 * 60 * 1000; // default 1 hour
        
        if (repeatOptions.every) {
            intervalMs = repeatOptions.every;
        } 
    
        const timer = setInterval(async () => {
            const job = { id: `recurring-${Date.now()}`, data: { ...data, type: data.type || 'recurring' }, attemptsMade: 0 };
             try {
                await this.processors[queueName](job);
            } catch (error) {
                auditService.error(`Recurring job ${queueName} failed`, error);
            }
        }, intervalMs);

        this.intervals.push(timer);
        
        auditService.systemEvent('recurring_job_scheduled', { queueName, intervalMs });
        return { id: 'recurring-timer' };
    }

    async getQueueStats() {
        return {
            initialized: this.isInitialized,
            queues: {
                email: { waiting: 0, active: 0, completed: 0, failed: 0 },
                dataSync: { waiting: 0, active: 0, completed: 0, failed: 0 }
            }
        };
    }

    async shutdown() {
        this.intervals.forEach(clearInterval);
        this.intervals = [];
        this.isInitialized = false;
        auditService.systemEvent('job_queue_shutdown_completed');
    }
}

const jobQueue = new JobQueueService();
export default jobQueue;
