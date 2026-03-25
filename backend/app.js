import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import electionRoutes from './routes/electionRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: `https://vote-pole-1.onrender.com`,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { status: 'fail', message: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, uptime: `${Math.floor(process.uptime())}s` });
});

// API routes — all prefixed with /api/v1
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/elections',  electionRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/votes',      voteRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
