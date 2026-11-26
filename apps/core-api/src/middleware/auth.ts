import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthPayload {
    userId: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

export function authorize(...allowedRoles: AuthPayload['role'][]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthenticated' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden: insufficient permissions' });
            return;
        }
        next();
    };
}