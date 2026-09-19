'use strict';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from './src/config/swagger';
import { createControllers } from './src/controllers';
import { createImageApiRoutes, createImageRoutes } from './src/routes';
import { formatSeconds } from './src/utils/uptime';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
   helmet({
      contentSecurityPolicy: {
         directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:', 'http:'],
            connectSrc: ["'self'", 'https:api.telegram.org'],
         },
      },
   }),
);

// CORS configuration
app.use(cors({}));

// Rate limiting
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100, // Limit each IP to 100 requests per windowMs
   message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
   },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Initialize controllers and routes
const controllers = createControllers();
const imageRoutes = createImageApiRoutes(controllers.imageApiController);
app.use('/api', imageRoutes);
const viewRoutes = createImageRoutes(controllers.imageApiController);
app.use('/view', viewRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Swagger JSON spec
app.get('/api-docs.json', (_req, res) => {
   res.setHeader('Content-Type', 'application/json');
   res.send(swaggerSpec);
});

// Health check endpoint
app.get('/', (_req, res) => {
   res.json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: formatSeconds(process.uptime()),
   });
});

// 404 handler
app.use('*', (req, res) => {
   res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
   });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
   console.error('Global error handler:', err);
   res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
   });
});

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
   console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
