import { db } from '../generated/prisma/db.js';

export const prisma = db.orm.public;
export const prismaClient = db;