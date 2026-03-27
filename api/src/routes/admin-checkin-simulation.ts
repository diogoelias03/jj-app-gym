import { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { getDbPool } from "../db";
import { requireAdminKey } from "../plugins/admin-key";
import { evaluateCheckinWindow } from "../services/checkin-window";

const bodySchema = z.object({
  classSessionId: z.number().int().positive(),
  simulatedNow: z.string().datetime().optional()
});

export async function adminCheckinSimulationRoutes(
  app: FastifyInstance
): Promise<void> {
  app.post("/api/v1/admin/checkins/simulate-window", async (request, reply) => {
    const isAdmin = await requireAdminKey(request, reply);
    if (!isAdmin) {
      return;
    }

    const parsedBody = bodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        error: "invalid_payload",
        details: parsedBody.error.flatten()
      });
    }

    const { classSessionId, simulatedNow } = parsedBody.data;
    const pool = getDbPool();
    const classSessionResult = await pool.query<{
      starts_at: string;
      title: string;
    }>(
      `
      select starts_at, title
      from class_sessions
      where id = $1
      `,
      [classSessionId]
    );

    if (classSessionResult.rowCount === 0) {
      return reply.code(404).send({ error: "class_session_not_found" });
    }

    const classSession = classSessionResult.rows[0];
    const classStartsAt = new Date(classSession.starts_at);
    const now = simulatedNow ? new Date(simulatedNow) : new Date();

    const windowEval = evaluateCheckinWindow({
      classStartsAt,
      serverNow: now,
      openHoursBefore: config.checkinOpenHoursBefore,
      closeMinutesAfter: config.checkinCloseMinutesAfter
    });

    return reply.send({
      classSessionId,
      classTitle: classSession.title,
      simulatedNow: windowEval.serverNow,
      allowed: windowEval.allowed,
      reason: windowEval.reason,
      message: windowEval.message,
      checkinOpensAt: windowEval.checkinOpensAt,
      checkinClosesAt: windowEval.checkinClosesAt,
      classStartsAt: windowEval.classStartsAt
    });
  });
}
