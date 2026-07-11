import app from "./app.js";
import config from "./config/index.js";
import logger from "./config/logger.js";
import { connectDatabase } from "./config/database.js";
import { connectRedis } from "./config/redis.js";

const { port } = config.env;

const startServer = async () => {
  try {
    await connectDatabase();

    // Add this
    await connectRedis();

    app.listen(port, () => {
      logger.info(`🚀 SkyReserve Server running on port ${port}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();