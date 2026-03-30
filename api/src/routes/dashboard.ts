import { FastifyInstance } from "fastify";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

type StudentProgressRow = {
  current_belt_rank: number;
  current_belt_name: string;
  required_classes: number | null;
  completed_classes: number;
};

type NextBeltRow = {
  name: string;
};

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/dashboard", { preHandler: requireAuth }, async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const pool = getDbPool();
    const { studentId, branchId } = request.user;

    const [nextClassResult, progressResult, goalsSummaryResult, goalsListResult, feedbackResult] =
      await Promise.all([
        pool.query(
          `
          select
            cs.id,
            cs.title,
            cs.class_category,
            cs.starts_at,
            cs.ends_at,
            b.name as branch_name,
            bl.name as belt_name,
            i.full_name as instructor_name
          from class_sessions cs
          join branches b on b.id = cs.branch_id
          join belts bl on bl.id = cs.belt_id
          join instructors i on i.id = cs.instructor_id
          where cs.branch_id = $1
            and cs.starts_at >= now()
          order by cs.starts_at asc
          limit 1
          `,
          [branchId]
        ),
        pool.query<StudentProgressRow>(
          `
          with student_ctx as (
            select s.id as student_id, s.belt_id, b.rank_order, b.name as current_belt_name
            from students s
            join belts b on b.id = s.belt_id
            where s.id = $1 and s.is_active = true
          ),
          attendance_count as (
            select count(*)::int as completed_classes
            from attendances a
            where a.student_id = $1 and a.status = 'present'
          )
          select
            sc.rank_order as current_belt_rank,
            sc.current_belt_name,
            pr.min_classes as required_classes,
            ac.completed_classes
          from student_ctx sc
          cross join attendance_count ac
          left join promotion_rules pr on pr.belt_id = sc.belt_id and pr.active = true
          `,
          [studentId]
        ),
        pool.query(
          `
          select
            count(*) filter (where status = 'active')::int as active_count,
            count(*) filter (where status = 'completed')::int as completed_count
          from student_goals
          where student_id = $1
          `,
          [studentId]
        ),
        pool.query(
          `
          select id, title, current_value, target_value, unit, status, target_date
          from student_goals
          where student_id = $1
            and status = 'active'
          order by created_at desc
          limit 3
          `,
          [studentId]
        ),
        pool.query(
          `
          select
            f.id,
            f.rating,
            f.feedback_text,
            f.created_at,
            f.class_session_id,
            i.full_name as instructor_name
          from instructor_feedback f
          join instructors i on i.id = f.instructor_id
          where f.student_id = $1
            and f.visible_to_student = true
          order by f.created_at desc
          limit 3
          `,
          [studentId]
        )
      ]);

    if ((progressResult.rowCount ?? 0) === 0) {
      return reply.code(404).send({ error: "student_not_found" });
    }

    const progress = progressResult.rows[0];
    const nextBeltResult = await pool.query<NextBeltRow>(
      `
      select name
      from belts
      where rank_order > $1
      order by rank_order asc
      limit 1
      `,
      [progress.current_belt_rank]
    );

    const requiredClasses = progress.required_classes ?? 0;
    const completedClasses = progress.completed_classes;
    const progressPercentage =
      requiredClasses > 0
        ? Math.min(Math.round((completedClasses / requiredClasses) * 100), 100)
        : 0;

    const goalsSummary = goalsSummaryResult.rows[0] as {
      active_count: number;
      completed_count: number;
    };

    const averageRating =
      feedbackResult.rows.length > 0
        ? Number(
            (
              feedbackResult.rows.reduce(
                (sum, item) => sum + Number(item.rating ?? 0),
                0
              ) / feedbackResult.rows.length
            ).toFixed(2)
          )
        : null;

    return reply.send({
      studentId,
      branchId,
      nextClass: nextClassResult.rows[0] ?? null,
      progress: {
        currentBelt: progress.current_belt_name,
        nextBelt: nextBeltResult.rows[0]?.name ?? null,
        completedClasses,
        requiredClasses,
        progressPercentage
      },
      goals: {
        activeCount: goalsSummary?.active_count ?? 0,
        completedCount: goalsSummary?.completed_count ?? 0,
        topActive: goalsListResult.rows
      },
      feedback: {
        averageRating,
        recent: feedbackResult.rows
      }
    });
  });
}
