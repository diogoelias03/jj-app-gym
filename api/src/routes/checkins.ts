import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

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
