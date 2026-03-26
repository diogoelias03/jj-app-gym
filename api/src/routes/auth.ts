import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { signAccessToken } from "../security/jwt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/auth/login", async (request, reply) => {
    const parsedBody = loginSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        error: "invalid_payload",
        details: parsedBody.error.flatten()
      });
    }

    const { email, password } = parsedBody.data;
    const pool = getDbPool();

    const result = await pool.query(
      `
      select id, branch_id
      from students
      where email = $1
        and is_active = true
        and password_hash = crypt($2, password_hash)
      `,
      [email.toLowerCase(), password]
    );

    if (result.rowCount === 0) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    const student = result.rows[0] as { id: number; branch_id: number };
    const accessToken = signAccessToken({
      studentId: student.id,
      branchId: student.branch_id,
      role: "student"
    });

    return reply.send({
      access_token: accessToken,
      token_type: "Bearer",
      studentId: student.id,
      branchId: student.branch_id
    });
  });
}
