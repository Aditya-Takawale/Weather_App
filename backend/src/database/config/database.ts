import mongoose from 'mongoose';
import logger from './logger';

/**
 * MongoDB Connection Configuration
 * Handles connection, reconnection, and error management
 */

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather_dashboard';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${(error as Error).message}`);
    process.exit(1);
  }
};

/**
 * Initialize database indexes for optimal performance
 */
const initializeIndexes = async (): Promise<void> => {
  try {
    logger.info('🔧 Initializing database indexes...');
    
    // Iterate through all models and ensure indexes
    for (const modelName of Object.keys(mongoose.models)) {
      await mongoose.models[modelName].ensureIndexes();
      logger.info(`✓ Indexes created for ${modelName}`);
    }
    
    logger.info('✅ All indexes initialized successfully');
  } catch (error) {
    logger.error(`❌ Error initializing indexes: ${(error as Error).message}`);
  }
};

export { connectDB, initializeIndexes };
