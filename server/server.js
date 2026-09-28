require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const { seedDatabase } = require('./seed/seed');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Auto-seed if database has 0 users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[ServiceFlow] Fresh database detected. Initializing demo seed data...');
      await seedDatabase(false);
    }

    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log('========================================================');
      console.log(` ServiceFlow API Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Listening on: http://localhost:${PORT}`);
      console.log(` API Base URL: http://localhost:${PORT}/api`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log('========================================================');
    });
  } catch (error) {
    console.error('[Server Error] Failed to start ServiceFlow server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      console.log('[Server] Database disconnected. Process terminating.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();
