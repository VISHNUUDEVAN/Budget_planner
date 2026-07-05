import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import dashboardRouter from './routes/dashboard';
import plannerRouter from './routes/planner';
import notificationsRouter from './routes/notifications';
import chatbotRouter from './routes/chatbot';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ─── Security & Parsing ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting (auth endpoints only) ─────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP. Please try again in 15 minutes.',
    },
  },
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/planner', plannerRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/chatbot', chatbotRouter);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist' },
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Smart Finance API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

export default app;
