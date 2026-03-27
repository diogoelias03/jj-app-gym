import cors from "@fastify/cors";
import Fastify, { FastifyInstance } from "fastify";
import { config } from "./config";
import { adminCheckinSimulationRoutes } from "./routes/admin-checkin-simulation";
import { authRoutes } from "./routes/auth";
import { attendanceHistoryRoutes } from "./routes/attendances-history";
import { checkinRoutes } from "./routes/checkins";
import { classesRoutes } from "./routes/classes";
import { healthRoutes } from "./routes/health";
import { progressRoutes } from "./routes/progress";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: config.corsOrigin === "*" ? true : config.corsOrigin
  });

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(adminCheckinSimulationRoutes);
  app.register(classesRoutes);
  app.register(checkinRoutes);
  app.register(attendanceHistoryRoutes);
  app.register(progressRoutes);

  return app;
}
