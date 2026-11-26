import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import adminRouter from './routes/admin.js';
import assessmentsRouter from './routes/assessments.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'core-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/assessments', assessmentsRouter);

app.listen(PORT, () => {
    console.log(`core-api running on http://localhost:${PORT}`);
});