import cors from "@fastify/cors";
import Fastify, { FastifyInstance } from "fastify";
import { config } from "./config";
import { adminBranchTransferRoutes } from "./routes/admin-branch-transfers";
import { adminClassesRoutes } from "./routes/admin-classes";
import { adminCheckinQrRoutes } from "./routes/admin-checkin-qr";
import { adminCheckinSimulationRoutes } from "./routes/admin-checkin-simulation";
import { authRoutes } from "./routes/auth";
import { attendanceHistoryRoutes } from "./routes/attendances-history";
import { branchTransferRoutes } from "./routes/branch-transfers";
import { checkinRoutes } from "./routes/checkins";
import { classesRoutes } from "./routes/classes";
import { dashboardRoutes } from "./routes/dashboard";
import { healthRoutes } from "./routes/health";
import { instructorFeedbackRoutes } from "./routes/instructor-feedback";
import { progressRoutes } from "./routes/progress";
import { studentGoalsRoutes } from "./routes/student-goals";

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
  app.register(adminCheckinQrRoutes);
  app.register(adminBranchTransferRoutes);
  app.register(adminClassesRoutes);
  app.register(classesRoutes);
  app.register(dashboardRoutes);
  app.register(checkinRoutes);
  app.register(attendanceHistoryRoutes);
  app.register(progressRoutes);
  app.register(branchTransferRoutes);
  app.register(studentGoalsRoutes);
  app.register(instructorFeedbackRoutes);

  return app;
}
