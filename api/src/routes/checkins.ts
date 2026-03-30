import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";
import { performCheckin } from "../services/checkin";

const bodySchema = z.object({
  classSessionId: z.number().int().positive()
});

const qrBodySchema = z.object({
  qrToken: z.string().min(10).max(256)
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
      const result = await performCheckin({ pool, studentId, classSessionId });
      if (!result.ok) {
        return reply.code(result.statusCode).send(result.payload);
      }

      return reply.code(201).send(result.data);
    }
  );

  app.post(
    "/api/v1/checkins/qr",
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsedBody = qrBodySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.code(400).send({
          error: "invalid_payload",
          details: parsedBody.error.flatten()
        });
      }

      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const { qrToken } = parsedBody.data;
      const { studentId } = request.user;
      const pool = getDbPool();

      const tokenResult = await pool.query<{
        class_session_id: string;
      }>(
        `
        select class_session_id
        from class_checkin_qr_tokens
        where token = $1
          and revoked_at is null
          and expires_at >= now()
        order by created_at desc
        limit 1
        `,
        [qrToken]
      );

      if (tokenResult.rowCount === 0) {
        return reply.code(422).send({
          error: "invalid_or_expired_qr_token",
          message: "O QR code informado e invalido ou expirou."
        });
      }

      const classSessionId = Number(tokenResult.rows[0].class_session_id);
      const result = await performCheckin({ pool, studentId, classSessionId });
      if (!result.ok) {
        return reply.code(result.statusCode).send(result.payload);
      }

      return reply.code(201).send({
        ...result.data,
        checkinMethod: "qr"
      });
    }
  );
}
