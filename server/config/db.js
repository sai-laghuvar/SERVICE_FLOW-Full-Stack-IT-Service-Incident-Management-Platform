const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/serviceflow';

  try {
    // Attempt connecting to the configured MongoDB URI
    // Set a short timeout (3000ms) for discovery so if no local server is listening, we fail fast to fallback
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[ServiceFlow] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[ServiceFlow] Primary MongoDB connection failed (${primaryErr.message}).`);
    console.log('[ServiceFlow] Initializing self-contained in-memory MongoDB instance for development & testing...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = memoryServerInstance.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`[ServiceFlow] Connected to in-memory MongoDB at: ${memoryUri}`);
      return conn;
    } catch (fallbackErr) {
      console.error('[ServiceFlow] Failed to initialize in-memory MongoDB:', fallbackErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
