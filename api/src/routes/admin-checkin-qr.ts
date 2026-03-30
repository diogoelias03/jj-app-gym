import { randomBytes } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../config";
import { getDbPool } from "../db";
import { requireAdminKey } from "../plugins/admin-key";

const bodySchema = z.object({
  classSessionId: z.number().int().positive(),
  expiresInMinutes: z.number().int().positive().max(120).optional()
});

export async function adminCheckinQrRoutes(
  app: FastifyInstance
): Promise<void> {
  app.post("/api/v1/admin/checkins/qr-token", async (request, reply) => {
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

    const { classSessionId } = parsedBody.data;
    const expiresInMinutes =
      parsedBody.data.expiresInMinutes ?? config.qrCheckinTokenExpiresMinutes;
    const pool = getDbPool();

    const classSessionResult = await pool.query<{ id: string; title: string }>(
      `
      select id, title
      from class_sessions
      where id = $1
      `,
      [classSessionId]
    );

    if (classSessionResult.rowCount === 0) {
      return reply.code(404).send({ error: "class_session_not_found" });
    }

    const token = randomBytes(18).toString("hex");

    await pool.query(
      `
      update class_checkin_qr_tokens
      set revoked_at = now()
      where class_session_id = $1
        and revoked_at is null
        and expires_at >= now()
      `,
      [classSessionId]
    );

    const createdToken = await pool.query<{
      id: string;
      class_session_id: string;
      token: string;
      expires_at: string;
      created_at: string;
    }>(
      `
      insert into class_checkin_qr_tokens (
        class_session_id,
        token,
        expires_at
      ) values (
        $1,
        $2,
        now() + ($3::text || ' minutes')::interval
      )
      returning id, class_session_id, token, expires_at, created_at
      `,
      [classSessionId, token, expiresInMinutes]
    );

    const row = createdToken.rows[0];
    return reply.code(201).send({
      id: Number(row.id),
      classSessionId: Number(row.class_session_id),
      qrToken: row.token,
      expiresAt: row.expires_at,
      expiresInMinutes,
      classTitle: classSessionResult.rows[0].title
    });
  });
}
