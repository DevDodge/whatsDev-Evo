import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { EvolutionService } from './services/evolution.service';
import { WebhookService } from './services/webhook.service';
import { MessageController } from './controllers/message.controller';
import { InstanceController } from './controllers/instance.controller';
import { SequenceController } from './controllers/sequence.controller';
import { WebhookController } from './controllers/webhook.controller';
import { TestController } from './controllers/test.controller';
import { createRouter } from './routes/api.routes';
import { swaggerSpec } from './config/swagger';
import { createAuthMiddleware } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const DEFAULT_INSTANCE_NAME = process.env.DEFAULT_INSTANCE_NAME || 'TEST';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize Express app
const app: Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API docs to work
  }),
);

// CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Initialize services
const evolutionService = new EvolutionService({
  baseURL: EVOLUTION_API_URL,
  apiKey: EVOLUTION_API_KEY,
  defaultInstance: DEFAULT_INSTANCE_NAME,
});

const webhookService = WebhookService.getInstance();

// Initialize controllers
const messageController = new MessageController(evolutionService);
const instanceController = new InstanceController(evolutionService);
const sequenceController = new SequenceController(evolutionService);
const webhookController = new WebhookController(webhookService);
const testController = new TestController();

// Create auth middleware
const authMiddleware = createAuthMiddleware((apiKey: string) => {
  return new EvolutionService({
    baseURL: EVOLUTION_API_URL,
    apiKey: apiKey,
    defaultInstance: DEFAULT_INSTANCE_NAME,
  });
});

// Setup routes
const router = createRouter(messageController, instanceController, sequenceController, webhookController, testController, authMiddleware);
app.use('/', router);

// API Documentation - Serve static HTML
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Serve swagger spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableDocs: '/api-docs',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     WhatsDeveloper Backend Bridge API                ║');
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Server running on: http://localhost:${PORT}         ║`);
  console.log(`║  📚 API Docs: http://localhost:${PORT}/api-docs          ║`);
  console.log(`║  🔗 Evolution API: ${EVOLUTION_API_URL.padEnd(29)} ║`);
  console.log(`║  📱 Instance: ${DEFAULT_INSTANCE_NAME.padEnd(37)} ║`);
  console.log('╚═══════════════════════════════════════════════════════╝');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
