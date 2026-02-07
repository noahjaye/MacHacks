import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Import routes
import healthRouter from './routes/health';
import uploadRouter from './routes/upload';
import analyzeRouter from './routes/analyze';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
console.log("Here is the process env", process.env)
// Routes
app.use('/api', healthRouter);
app.use('/api', uploadRouter);
app.use('/api', analyzeRouter);

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Active Reading API Server');
  console.log('API KEY', process.env.OPENROUTER_API_KEY)
  console.log('================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  WARNING: OPENROUTER_API_KEY not set!');
    console.warn('   Please copy .env.example to .env and add your API key');
    console.log('');
  }
});

export default app;
