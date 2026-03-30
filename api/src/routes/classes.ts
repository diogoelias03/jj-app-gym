import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

const querySchema = z.object({
  branchId: z.coerce.number().int().positive().optional(),
  beltId: z.coerce.number().int().positive().optional(),
  classCategory: z
    .enum(["fundamentos", "tecnica", "rola", "drill", "condicionamento"])
    .optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional()
});

export async function classesRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/v1/classes",
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsedQuery = querySchema.safeParse(request.query ?? {});
      if (!parsedQuery.success) {
        return reply.code(400).send({
          error: "invalid_query",
          details: parsedQuery.error.flatten()
        });
      }

      const branchId = parsedQuery.data.branchId ?? request.user?.branchId;
      const beltId = parsedQuery.data.beltId;
      const classCategory = parsedQuery.data.classCategory;
      const fromDate = parsedQuery.data.fromDate;
      const toDate = parsedQuery.data.toDate;

      const pool = getDbPool();
      const result = await pool.query(
        `
        select
          cs.id,
          cs.title,
          cs.class_category,
          cs.starts_at,
          cs.ends_at,
          cs.capacity,
          b.name as branch_name,
          bl.name as belt_name,
          i.full_name as instructor_name
        from class_sessions cs
        join branches b on b.id = cs.branch_id
        join belts bl on bl.id = cs.belt_id
        join instructors i on i.id = cs.instructor_id
        where ($1::int is null or cs.branch_id = $1)
          and ($2::int is null or cs.belt_id = $2)
          and ($3::text is null or cs.class_category = $3)
          and ($4::timestamptz is null or cs.starts_at >= $4)
          and ($5::timestamptz is null or cs.starts_at <= $5)
        order by cs.starts_at asc
        `,
        [
          branchId ?? null,
          beltId ?? null,
          classCategory ?? null,
          fromDate ?? null,
          toDate ?? null
        ]
      );

      return reply.send({ items: result.rows });
    }
  );
}
