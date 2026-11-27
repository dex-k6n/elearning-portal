import { Queue } from 'bullmq';

const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');

export const connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    ...(redisUrl.password ? { password: redisUrl.password } : {}),
};

export interface SubmissionGradedPayload {
    submissionId: string;
    studentId: string;
    assessmentId: string;
    assessmentType: 'PRACTICE' | 'TEST';
    score: number;
    maxScore: number;
    results: Array<{
        questionId: string;
        skillId: string;
        isCorrect: boolean;
        pointsEarned: number;
        pointsPossible: number;
    }>;
}

export const analyticsQueue = new Queue<SubmissionGradedPayload>('analytics-events', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});