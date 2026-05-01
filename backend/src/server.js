/**
 * src/server.js
 *
 * Application entry point.
 * Responsible for:
 *   1. Loading the Express app
 *   2. Testing DB connectivity (fail fast if DB is down)
 *   3. Binding to the configured port
 *   4. Graceful shutdown on SIGTERM / SIGINT
 */

import app from './app.js';
import config from './config/env.js';
import logger from './utils/logger.js';
import { connectDB, disconnectDB } from './config/database.js';

// ── Boot sequence ─────────────────────────────────────────────────────────────

async function boot() {
  logger.info('╔════════════════════════════════════════╗');
  logger.info('║       NAMMA TAXI API  — Booting        ║');
  logger.info('╚════════════════════════════════════════╝');
  logger.info(`[Server] Environment: ${config.env}`);
  logger.info(`[Server] Node version: ${process.version}`);

  // Connect to MongoDB before accepting traffic
  try {
    await connectDB();
  } catch (err) {
    logger.error('[Server] Failed to connect to database', { error: err.message });
    logger.error('[Server] Make sure MongoDB is running and MONGODB_URI is configured correctly.');
    // In production we exit; in dev we continue so the server boots and /api/health shows degraded
    if (config.isProduction) process.exit(1);
    logger.warn('[Server] Continuing in development mode without DB (health will show degraded)');
  }

  // Start listening
  const server = app.listen(config.port, () => {
    logger.info(`[Server] ✓ Listening on http://localhost:${config.port}`);
    logger.info(`[Server] ✓ Health:  http://localhost:${config.port}/api/health`);
    logger.info(`[Server] ✓ API v1:  http://localhost:${config.port}/api/v1`);
  });

  // Initialize Socket.io
  const { initSocket } = await import('./utils/socket.js');
  initSocket(server);

  // ── Graceful shutdown ─────────────────────────────────────────────────────

  const shutdown = async (signal) => {
    logger.info(`[Server] Received ${signal}. Shutting down gracefully...`);
    
    // Close DB connection
    try {
      await disconnectDB();
    } catch (err) {
      logger.error('[Server] Error during DB disconnection', { error: err.message });
    }

    server.close(() => {
      logger.info('[Server] HTTP server closed.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000).unref(); // unref so it doesn't hold the process open
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('[Server] Unhandled Promise Rejection', { reason: String(reason) });
    // Don't exit here in dev — just log it
    if (config.isProduction) process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    logger.error('[Server] Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });

  return server;
}

boot().catch((err) => {
  console.error('[Server] Boot failed:', err.message);
  process.exit(1);
});
