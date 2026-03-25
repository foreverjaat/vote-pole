
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import app from './app.js';
import { setIO } from './utils/socket.js';
import logger from './utils/logger.js';


import User from './models/User.js';

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

//  Admin FUNCTION
const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD, // auto hashed by model
        role: "admin",
      });

      logger.info(" Admin created");
    } else {
      logger.info("ℹ Admin already exists");
    }
  } catch (error) {
    logger.error(`Admin creation error: ${error.message}`);
  }
};

const startServer = async () => {
  await connectDB();

  //  for admin
  await createAdmin();

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: `https://vote-pole-1.onrender.com`,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  setIO(io);

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('joinElection', (electionId) => {
      socket.join(`election:${electionId}`);
      logger.debug(`Socket ${socket.id} joined election:${electionId}`);
    });

    socket.on('leaveElection', (electionId) => {
      socket.leave(`election:${electionId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  const PORT = parseInt(process.env.PORT);
  httpServer.listen(PORT, () => {
    logger.info(`Server running with  ${process.env.NODE_ENV} mode`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down...`);
    httpServer.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
