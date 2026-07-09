import app from "./app.js";
import config from "../config/index.js";
import logger from "../config/logger.js";
import { connectDatabase } from "../config/database.js";

const { port } = config.env;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(port, () => {
      logger.info(`🚀 SkyReserve Server running on port ${port}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();