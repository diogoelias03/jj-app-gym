import { FastifyInstance } from "fastify";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

type ProgressRow = {
  student_id: number;
  current_belt_name: string;
  current_belt_rank: number;
  required_classes: number | null;
  completed_classes: number;
};

type NextBeltRow = {
  next_belt_name: string;
};

export async function progressRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/api/v1/progress",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const pool = getDbPool();

      const result = await pool.query<ProgressRow>(
        `
        with student_ctx as (
          select s.id as student_id, s.belt_id, b.name as current_belt_name, b.rank_order
          from students s
          join belts b on b.id = s.belt_id
          where s.id = $1 and s.is_active = true
        ),
        attendance_count as (
          select count(*)::int as completed_classes
          from attendances a
          where a.student_id = $1
            and a.status = 'present'
        )
        select
          sc.student_id,
          sc.current_belt_name,
          sc.rank_order as current_belt_rank,
          pr.min_classes as required_classes,
          ac.completed_classes
        from student_ctx sc
        cross join attendance_count ac
        left join promotion_rules pr on pr.belt_id = sc.belt_id and pr.active = true
        `,
        [request.user.studentId]
      );

      if (result.rowCount === 0) {
        return reply.code(404).send({ error: "student_not_found" });
      }

      const data = result.rows[0];

      const nextBelt = await pool.query<NextBeltRow>(
        `
        select b2.name as next_belt_name
        from belts b2
        where b2.rank_order > $1
        order by b2.rank_order asc
        limit 1
        `,
        [data.current_belt_rank]
      );

      const requiredClasses = data.required_classes ?? 0;
      const completedClasses = data.completed_classes;
      const remainingClasses = Math.max(requiredClasses - completedClasses, 0);
      const progressPercentage =
        requiredClasses > 0
          ? Math.min(Math.round((completedClasses / requiredClasses) * 100), 100)
          : 0;

      return reply.send({
        studentId: data.student_id,
        currentBelt: data.current_belt_name,
        nextBelt: nextBelt.rows[0]?.next_belt_name ?? null,
        completedClasses,
        requiredClasses,
        remainingClasses,
        progressPercentage
      });
    }
  );
}
