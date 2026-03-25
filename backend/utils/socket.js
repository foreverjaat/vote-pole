import { AppError } from './appError.js';

let io = null;

export const setIO = (socketIO) => { io = socketIO; };

export const getIO = () => {
  if (!io) throw new AppError('Socket.IO is not initialized', 500);
  return io;
};
