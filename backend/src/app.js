import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "../docs/swagger.js";

import rateLimiter from "./middleware/rateLimiter.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

import healthRoutes from "./routes/health.routes.js";
import apiRoutes from "./routes/index.js";
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "*",
    credentials: true
  })
);

app.use(compression());

app.use(rateLimiter);

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SkyReserve API"
  });
});

app.use("/api/health", healthRoutes);
app.use(
  "/api/v1",
  apiRoutes
);
app.use(notFound);

app.use(errorHandler);

export default app;