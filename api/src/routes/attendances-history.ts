import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

const querySchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export async function attendanceHistoryRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/api/v1/attendances/history",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const parsedQuery = querySchema.safeParse(request.query ?? {});
      if (!parsedQuery.success) {
        return reply.code(400).send({
          error: "invalid_query",
          details: parsedQuery.error.flatten()
        });
      }

      const { fromDate, toDate, page, pageSize } = parsedQuery.data;
      const offset = (page - 1) * pageSize;
      const pool = getDbPool();

      const countResult = await pool.query<{ total: number }>(
        `
        select count(*)::int as total
        from attendances a
        join class_sessions cs on cs.id = a.class_session_id
        where a.student_id = $1
          and a.status = 'present'
          and ($2::timestamptz is null or cs.starts_at >= $2)
          and ($3::timestamptz is null or cs.starts_at <= $3)
        `,
        [request.user.studentId, fromDate ?? null, toDate ?? null]
      );

      const itemsResult = await pool.query(
        `
        select
          a.id,
          a.checked_in_at,
          cs.id as class_session_id,
          cs.title as class_title,
          cs.starts_at,
          cs.ends_at,
          b.name as branch_name,
          bl.name as belt_name,
          i.full_name as instructor_name
        from attendances a
        join class_sessions cs on cs.id = a.class_session_id
        join branches b on b.id = cs.branch_id
        join belts bl on bl.id = cs.belt_id
        join instructors i on i.id = cs.instructor_id
        where a.student_id = $1
          and a.status = 'present'
          and ($2::timestamptz is null or cs.starts_at >= $2)
          and ($3::timestamptz is null or cs.starts_at <= $3)
        order by cs.starts_at desc
        limit $4 offset $5
        `,
        [request.user.studentId, fromDate ?? null, toDate ?? null, pageSize, offset]
      );

      const total = countResult.rows[0]?.total ?? 0;

      return reply.send({
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        items: itemsResult.rows
      });
    }
  );
}
