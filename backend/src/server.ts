import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import organizationRoutes from './routes/organizations';
import projectRoutes from './routes/projects';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { TaskExpirationService } from './services/taskExpirationService';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
// CORS configuration for local network testing
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost and local network IPs
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];

    // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const localNetworkPattern = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):5173$/;

    if (allowedOrigins.includes(origin) || localNetworkPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/projects', projectRoutes);

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
// Listen on 0.0.0.0 to accept connections from local network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TaskMan API server running on http://localhost:${PORT}`);
  console.log(`📱 Local network access: http://[YOUR-LOCAL-IP]:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start task expiration cleanup service
  TaskExpirationService.startPeriodicCleanup();
});

export default app;
