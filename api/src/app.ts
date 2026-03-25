import cors from "@fastify/cors";
import Fastify, { FastifyInstance } from "fastify";
import { config } from "./config";
import { authRoutes } from "./routes/auth";
import { checkinRoutes } from "./routes/checkins";
import { classesRoutes } from "./routes/classes";
import { healthRoutes } from "./routes/health";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: config.corsOrigin === "*" ? true : config.corsOrigin
  });

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(classesRoutes);
  app.register(checkinRoutes);

  return app;
}
