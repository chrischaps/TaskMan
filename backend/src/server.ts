import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import authRoutes from './routes/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check / Hello World endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'TaskMan API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      uptime: process.uptime(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TaskMan API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
