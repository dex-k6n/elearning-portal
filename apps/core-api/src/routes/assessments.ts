import { type Response, Router } from 'express';
import { prisma, prismaClient } from '../lib/prisma.js';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';
import { analyticsQueue } from '../lib/queue.js';

type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

const router = Router();

router.use(authenticate);

// Teacher/Admin: create an assessment + its questions
router.post('/', authorize('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, type, questions } = req.body;
        if (!title || !type || !Array.isArray(questions) || questions.length === 0) {
            res.status(400).json({ error: 'title, type, and at least one question are required' });
            return;
        }

        const assessment = await prismaClient.transaction(async () => {
            const created = await prisma.Assessment.create({
                title,
                description: description ?? null,
                type,
                createdById: req.user!.userId,
            });

            await prisma.Question.createAll(
                questions.map(
                    (
                        q: {
                            skillId: string;
                            prompt: string;
                            options: JsonValue;
                            correctAnswer: string;
                            points?: number;
                        },
                        idx: number,
                    ) => ({
                        assessmentId: created.id,
                        skillId: q.skillId,
                        prompt: q.prompt,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        points: q.points ?? 1,
                        orderIndex: idx,
                    }),
                ),
            );

            return prisma.Assessment.whereUnique({ id: created.id })
                .include('questions')
                .first();
        });

        res.status(201).json({ assessment });
    } catch (err) {
        console.error('Create assessment error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Teacher/Admin: assign an assessment to one or more students
router.post('/:id/assign', authorize('TEACHER', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const assessmentId = String(req.params.id);
        const { studentIds, dueDate } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            res.status(400).json({ error: 'studentIds array is required' });
            return;
        }

        const assignments = await Promise.all(
            studentIds.map((studentId: string) =>
                prisma.Assignment.create({
                    assessmentId,
                    studentId,
                    dueDate: dueDate ? new Date(dueDate) : null,
                }),
            ),
        );

        res.status(201).json({ assignments });
    } catch (err) {
        console.error('Assign assessment error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Role-filtered list of assessments
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId, role } = req.user!;

        if (role === 'STUDENT') {
            const assignments = await prisma.Assignment.where({ studentId: userId })
                .include('assessment')
                .all();

            res.json({ assessments: assignments.map((a) => ({ ...a.assessment, dueDate: a.dueDate })) });
            return;
        }

        const baseQuery =
            role === 'TEACHER'
                ? prisma.Assessment.where({ createdById: userId })
                : prisma.Assessment;

        const assessments = await baseQuery
            .include('questions')
            .orderBy((a) => a.createdAt.desc())
            .all();

        res.json({ assessments });
    } catch (err) {
        console.error('List assessments error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Single assessment (strips correctAnswer for students)
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        const assessment = await prisma.Assessment.whereUnique({ id })
            .include('questions')
            .first();

        if (!assessment) {
            res.status(404).json({ error: 'Assessment not found' });
            return;
        }

        if (req.user!.role === 'STUDENT') {
            const sanitized = {
                ...assessment,
                questions: assessment.questions.map(({ correctAnswer: _hidden, ...q }) => q),
            };
            res.json({ assessment: sanitized });
            return;
        }

        res.json({ assessment });
    } catch (err) {
        console.error('Get assessment error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Student: submit answers, auto-grade, persist, and publish event to BullMQ
router.post('/:id/submit', authorize('STUDENT'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const assessmentId = String(req.params.id);
        const studentId = req.user!.userId;
        const { answers } = req.body;

        if (!Array.isArray(answers) || answers.length === 0) {
            res.status(400).json({ error: 'answers array is required' });
            return;
        }

        const assessment = await prisma.Assessment.whereUnique({ id: assessmentId })
            .include('questions')
            .first();

        if (!assessment) {
            res.status(404).json({ error: 'Assessment not found' });
            return;
        }

        // Verify assignment for TEST assessments (PRACTICE can be open or assigned)
        if (assessment.type === 'TEST') {
            const assignment = await prisma.Assignment.where({
                assessmentId,
                studentId,
            }).first();

            if (!assignment) {
                res.status(403).json({ error: 'You are not assigned to this test' });
                return;
            }
        }

        const answerMap = new Map<string, string>(
            answers.map((a: { questionId: string; selectedAnswer: string }) => [
                String(a.questionId),
                String(a.selectedAnswer),
            ]),
        );

        let score = 0;
        let maxScore = 0;

        const gradedRows = assessment.questions.map((q) => {
            const selectedAnswer = answerMap.get(q.id) ?? '';
            const isCorrect = selectedAnswer === q.correctAnswer;
            const pointsEarned = isCorrect ? q.points : 0;

            score += pointsEarned;
            maxScore += q.points;

            return {
                questionId: q.id,
                skillId: q.skillId,
                selectedAnswer,
                isCorrect,
                pointsEarned,
                pointsPossible: q.points,
            };
        });

        const submission = await prismaClient.transaction(async () => {
            const created = await prisma.Submission.create({
                assessmentId,
                studentId,
                score,
                maxScore,
            });

            await prisma.SubmissionAnswer.createAll(
                gradedRows.map((r) => ({
                    submissionId: created.id,
                    questionId: r.questionId,
                    selectedAnswer: r.selectedAnswer,
                    isCorrect: r.isCorrect,
                })),
            );

            return prisma.Submission.whereUnique({ id: created.id })
                .include('answers')
                .first();
        });

        await analyticsQueue.add('submission.graded', {
            submissionId: submission!.id,
            studentId,
            assessmentId,
            assessmentType: assessment.type,
            score,
            maxScore,
            results: gradedRows.map(({ questionId, skillId, isCorrect, pointsEarned, pointsPossible }) => ({
                questionId,
                skillId,
                isCorrect,
                pointsEarned,
                pointsPossible,
            })),
        });

        res.status(201).json({ submission });
    } catch (err) {
        console.error('Submit assessment error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// View submissions (Students see own; Teachers/Admins see all for the assessment)
router.get('/:id/submissions', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const assessmentId = String(req.params.id);
        const { userId, role } = req.user!;

        const query =
            role === 'STUDENT'
                ? prisma.Submission.where({ assessmentId, studentId: userId })
                : prisma.Submission.where({ assessmentId });

        const submissions = await query
            .include('answers')
            .orderBy((s) => s.submittedAt.desc())
            .all();

        res.json({ submissions });
    } catch (err) {
        if (err && typeof err === 'object' && 'sqlState' in err && err.sqlState === '23503') {
            res.status(400).json({ error: 'One or more referenced skillId values do not exist' });
            return;
        }
        console.error('List submissions error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;