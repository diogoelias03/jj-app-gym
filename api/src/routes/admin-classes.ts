import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAdminKey } from "../plugins/admin-key";

const createClassSchema = z.object({
  branchId: z.number().int().positive(),
  beltId: z.number().int().positive(),
  instructorId: z.number().int().positive(),
  title: z.string().min(3).max(200),
  classCategory: z.enum([
    "fundamentos",
    "tecnica",
    "rola",
    "drill",
    "condicionamento"
  ]),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().int().positive().max(200).default(30)
});

export async function adminClassesRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/v1/admin/classes", async (request, reply) => {
    const isAdmin = await requireAdminKey(request, reply);
    if (!isAdmin) {
      return;
    }

    const parsedBody = createClassSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        error: "invalid_payload",
        details: parsedBody.error.flatten()
      });
    }

    const {
      branchId,
      beltId,
      instructorId,
      title,
      classCategory,
      startsAt,
      endsAt,
      capacity
    } = parsedBody.data;

    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(endsAt);
    if (endsAtDate <= startsAtDate) {
      return reply.code(422).send({
        error: "invalid_time_range",
        message: "O horario de termino deve ser maior que o horario de inicio."
      });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `
      insert into class_sessions (
        branch_id,
        belt_id,
        instructor_id,
        title,
        class_category,
        starts_at,
        ends_at,
        capacity
      ) values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning id, branch_id, belt_id, instructor_id, title, class_category, starts_at, ends_at, capacity
      `,
      [
        branchId,
        beltId,
        instructorId,
        title,
        classCategory,
        startsAt,
        endsAt,
        capacity
      ]
    );

    return reply.code(201).send(result.rows[0]);
  });
}
