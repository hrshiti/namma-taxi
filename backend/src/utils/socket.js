import { Server } from 'socket.io';
import logger from './logger.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict this to your frontend URL
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket] Client connected: ${socket.id}`);

    socket.on('join', (room) => {
      socket.join(room);
      logger.info(`[Socket] Client ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    logger.info(`[Socket] Emitted ${event} to room ${room}`);
  }
};

export const emitGlobal = (event, data) => {
  if (io) {
    io.emit(event, data);
    logger.info(`[Socket] Emitted global ${event}`);
  }
};
