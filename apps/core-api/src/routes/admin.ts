import { type Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.post('/users', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password, fullName, role } = req.body;
        if (!email || !password || !fullName || !role) {
            res.status(400).json({ error: 'email, password, fullName, and role are required' });
            return;
        }

        if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
            res.status(400).json({ error: 'Role must be ADMIN, TEACHER, or STUDENT' });
            return;
        }

        const existing = await prisma.User.whereUnique({ email }).first();
        if (existing) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const created = await prisma.User.create({
            email,
            passwordHash,
            fullName,
            role,
        });

        res.status(201).json({
            user: {
                id: created.id,
                email: created.email,
                fullName: created.fullName,
                role: created.role,
                isActive: created.isActive,
                createdAt: created.createdAt,
            },
        });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await prisma.User.select(
            'id',
            'email',
            'fullName',
            'role',
            'isActive',
            'createdAt',
        )
            .orderBy((u) => u.createdAt.desc())
            .all();

        res.json({ users });
    } catch (err) {
        console.error('List users error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/users/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            res.status(400).json({ error: 'isActive boolean is required' });
            return;
        }

        const updated = await prisma.User.whereUnique({ id }).update({ isActive });
        if (!updated) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            user: {
                id: updated.id,
                email: updated.email,
                fullName: updated.fullName,
                role: updated.role,
                isActive: updated.isActive,
            },
        });
    } catch (err) {
        console.error('Update user status error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/skills', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { code, name, description } = req.body;
        if (!code || !name) {
            res.status(400).json({ error: 'code and name are required' });
            return;
        }

        const skill = await prisma.Skill.create({
            code,
            name,
            description: description ?? null,
        });

        res.status(201).json({ skill });
    } catch (err) {
        console.error('Create skill error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/skills', async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const skills = await prisma.Skill.orderBy((s) => s.code.asc()).all();
        res.json({ skills });
    } catch (err) {
        console.error('List skills error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;