import jobQueue from '../services/jobQueue.js';
import { sendOTPEmail, sendResetPassEmail, deleteConfirmationMail } from '../utils/emailService.js';
import auditService from '../services/auditService.js';

const processEmailJob = async (job) => {
    const { type, to, email, ...data } = job.data;
    const recipient = to || email;

    auditService.systemEvent('email_job_processing', {
        jobId: job.id,
        type,
        to: recipient,
        attempt: job.attemptsMade + 1
    });

    try {
        switch (type) {
            case 'otp':
                await sendOTPEmail(recipient, data.otp);
                break;

            case 'password_reset':
                await sendResetPassEmail(recipient, data.resetLink);
                break;

            case 'deletion_confirmation':
                await deleteConfirmationMail(recipient);
                break;

            case 'welcome':
                auditService.info('Welcome email type not implemented yet', { to: recipient });
                break;

            case 'notification':
                auditService.info('Notification email type not implemented yet', { to: recipient });
                break;

            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        auditService.systemEvent('email_job_completed', {
            jobId: job.id,
            type,
            to: recipient
        });

        return { success: true, type, to: recipient };
    } catch (error) {
        auditService.error('email_job_failed', error, {
            jobId: job.id,
            type,
            to: recipient,
            attempt: job.attemptsMade + 1
        });

        throw error;
    }
};

export const initializeEmailWorker = () => {
    const worker = jobQueue.registerWorker('email', processEmailJob);
    
    if (worker) {
        auditService.systemEvent('email_worker_started');
    }
    
    return worker;
};

export const queueOTPEmail = async (email, otp) => {
    return jobQueue.addEmailJob({
        type: 'otp',
        to: email,
        otp
    });
};

export const queuePasswordResetEmail = async (email, resetLink) => {
    return jobQueue.addEmailJob({
        type: 'password_reset',
        to: email,
        resetLink
    });
};


export const queueDeletionConfirmationEmail = async (email) => {
    return jobQueue.addEmailJob({
        type: 'deletion_confirmation',
        to: email
    });
};

export default {
    initializeEmailWorker,
    queueOTPEmail,
    queuePasswordResetEmail,
    queueDeletionConfirmationEmail,
    processEmailJob
};
