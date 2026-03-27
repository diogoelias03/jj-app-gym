import { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";
import { evaluateCheckinWindow } from "../services/checkin-window";

const bodySchema = z.object({
  classSessionId: z.number().int().positive()
});

export async function checkinRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/api/v1/checkins",
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsedBody = bodySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.code(400).send({
          error: "invalid_payload",
          details: parsedBody.error.flatten()
        });
      }

      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const { classSessionId } = parsedBody.data;
      const { studentId } = request.user;
      const pool = getDbPool();
      const classSessionResult = await pool.query<{
        starts_at: string;
        server_now: string;
      }>(
        `
        select starts_at, now() as server_now
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
      const serverNow = new Date(classSession.server_now);
      const windowEval = evaluateCheckinWindow({
        classStartsAt,
        serverNow,
        openHoursBefore: config.checkinOpenHoursBefore,
        closeMinutesAfter: config.checkinCloseMinutesAfter
      });

      if (!windowEval.allowed) {
        return reply.code(422).send({
          error: "checkin_window_closed",
          reason: windowEval.reason,
          message: windowEval.message,
          classSessionId,
          serverNow: windowEval.serverNow,
          checkinOpensAt: windowEval.checkinOpensAt,
          checkinClosesAt: windowEval.checkinClosesAt,
          classStartsAt: windowEval.classStartsAt
        });
      }

      const result = await pool.query(
        `
        insert into attendances (class_session_id, student_id, status)
        values ($1, $2, 'present')
        on conflict (class_session_id, student_id)
        do update set status = excluded.status, checked_in_at = now()
        returning id, class_session_id, student_id, status, checked_in_at
        `,
        [classSessionId, studentId]
      );

      return reply.code(201).send(result.rows[0]);
    }
  );
}
