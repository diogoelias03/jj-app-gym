import { FastifyInstance } from "fastify";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

type ProgressRow = {
  student_id: string | number;
  profile_code: string;
  current_belt_id: string | number;
  current_belt_name: string;
  current_belt_rank: number;
  next_belt_id: string | number | null;
  next_belt_name: string | null;
  required_classes: number | null;
  completed_classes: number;
  belt_started_at: string;
  ibjjf_min_time_current_belt_months: number | null;
  ibjjf_min_age_years: number | null;
  ibjjf_requires_instructor_approval: boolean | null;
  ibjjf_source_document_version: string | null;
  ibjjf_source_document_path: string | null;
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
          select
            s.id as student_id,
            s.profile_code,
            s.belt_id,
            s.created_at as student_created_at,
            b.name as current_belt_name,
            b.rank_order
          from students s
          join belts b on b.id = s.belt_id
          where s.id = $1 and s.is_active = true
        ),
        next_belt_ctx as (
          select
            sc.student_id,
            b2.id as next_belt_id,
            b2.name as next_belt_name
          from student_ctx sc
          left join lateral (
            select id, name
            from belts
            where rank_order > sc.rank_order
            order by rank_order asc
            limit 1
          ) b2 on true
        ),
        belt_started_ctx as (
          select
            sc.student_id,
            coalesce(
              (
                select p.promoted_at
                from promotions p
                where p.student_id = sc.student_id
                  and p.to_belt_id = sc.belt_id
                order by p.promoted_at desc
                limit 1
              ),
              sc.student_created_at
            ) as belt_started_at
          from student_ctx sc
        ),
        attendance_count as (
          select count(*)::int as completed_classes
          from attendances a
          where a.student_id = $1
            and a.status = 'present'
        )
        select
          sc.student_id,
          sc.profile_code,
          sc.belt_id as current_belt_id,
          sc.current_belt_name,
          sc.rank_order as current_belt_rank,
          nbc.next_belt_id,
          nbc.next_belt_name,
          pr.min_classes as required_classes,
          ac.completed_classes,
          bsc.belt_started_at,
          ic.min_time_current_belt_months as ibjjf_min_time_current_belt_months,
          ic.min_age_years as ibjjf_min_age_years,
          ic.requires_instructor_approval as ibjjf_requires_instructor_approval,
          ic.source_document_version as ibjjf_source_document_version,
          ic.source_document_path as ibjjf_source_document_path
        from student_ctx sc
        cross join attendance_count ac
        join belt_started_ctx bsc on bsc.student_id = sc.student_id
        left join next_belt_ctx nbc on nbc.student_id = sc.student_id
        left join promotion_rules pr on pr.belt_id = sc.belt_id and pr.active = true
        left join ibjjf_profile_belt_criteria ic
          on ic.profile_code = sc.profile_code
         and ic.belt_current_id = sc.belt_id
         and ic.belt_next_id = nbc.next_belt_id
        `,
        [request.user.studentId]
      );

      if (result.rowCount === 0) {
        return reply.code(404).send({ error: "student_not_found" });
      }

      const data = result.rows[0];

      const studentId = Number(data.student_id);
      const requiredClasses = data.required_classes ?? 0;
      const completedClasses = data.completed_classes;
      const remainingClasses = Math.max(requiredClasses - completedClasses, 0);
      const progressPercentage =
        requiredClasses > 0
          ? Math.min(Math.round((completedClasses / requiredClasses) * 100), 100)
          : 0;
      const beltStartedAt = new Date(data.belt_started_at);
      const now = new Date();
      const monthsAtCurrentBelt =
        (now.getFullYear() - beltStartedAt.getFullYear()) * 12 +
        (now.getMonth() - beltStartedAt.getMonth()) -
        (now.getDate() < beltStartedAt.getDate() ? 1 : 0);
      const ibjjfMinMonths = data.ibjjf_min_time_current_belt_months;
      const ibjjfTimeRequirementMet =
        ibjjfMinMonths === null ? null : monthsAtCurrentBelt >= ibjjfMinMonths;

      return reply.send({
        studentId,
        profileCode: data.profile_code,
        currentBelt: data.current_belt_name,
        nextBelt: data.next_belt_name,
        completedClasses,
        requiredClasses,
        remainingClasses,
        progressPercentage,
        ibjjf: {
          currentBeltId: Number(data.current_belt_id),
          nextBeltId: data.next_belt_id ? Number(data.next_belt_id) : null,
          sourceDocumentVersion: data.ibjjf_source_document_version,
          sourceDocumentPath: data.ibjjf_source_document_path,
          minTimeCurrentBeltMonths: ibjjfMinMonths,
          monthsAtCurrentBelt: monthsAtCurrentBelt < 0 ? 0 : monthsAtCurrentBelt,
          timeRequirementMet: ibjjfTimeRequirementMet,
          minAgeYears: data.ibjjf_min_age_years,
          requiresInstructorApproval: data.ibjjf_requires_instructor_approval
        }
      });
    }
  );
}
