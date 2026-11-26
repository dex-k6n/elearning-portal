import { type Response, Router } from 'express';
import { prisma, prismaClient } from '../lib/prisma.js';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

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

export default router;