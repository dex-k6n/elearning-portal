import bcrypt from 'bcryptjs';
import { prisma, prismaClient } from '../src/lib/prisma.js';

async function main() {
    const users = [
        {
            email: 'admin@portal.edu',
            passwordHash: await bcrypt.hash('Admin123!', 10),
            fullName: 'System Administrator',
            role: 'ADMIN' as const,
        },
        {
            email: 'teacher@portal.edu',
            passwordHash: await bcrypt.hash('Teacher123!', 10),
            fullName: 'Prof. Elena Popescu',
            role: 'TEACHER' as const,
        },
        {
            email: 'student@portal.edu',
            passwordHash: await bcrypt.hash('Student123!', 10),
            fullName: 'Andrei Ionescu',
            role: 'STUDENT' as const,
        },
    ];

    for (const u of users) {
        const existing = await prisma.User.whereUnique({ email: u.email }).first();
        if (!existing) {
            await prisma.User.create(u);
        }
    }

    const skills = [
        { code: 'ALG-01', name: 'Linear Equations', description: 'Solving single-variable linear equations' },
        { code: 'ALG-02', name: 'Quadratic Functions', description: 'Factoring and roots of quadratics' },
        { code: 'CALC-01', name: 'Limits & Continuity', description: 'Evaluating basic algebraic limits' },
    ];

    for (const s of skills) {
        const existing = await prisma.Skill.whereUnique({ code: s.code }).first();
        if (!existing) {
            await prisma.Skill.create(s);
        }
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prismaClient.close();
    });