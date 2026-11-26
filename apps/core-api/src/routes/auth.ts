import { type Request, type Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = await prisma.User.whereUnique({ email }).first();
        if (!user || !user.isActive) {
            res.status(401).json({ error: 'Invalid credentials or inactive account' });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' },
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.User.whereUnique({ id: req.user!.userId })
            .select('id', 'email', 'fullName', 'role', 'isActive', 'createdAt')
            .first();

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;