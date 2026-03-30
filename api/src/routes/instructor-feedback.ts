import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAdminKey } from "../plugins/admin-key";
import { requireAuth } from "../plugins/auth";

const createFeedbackSchema = z.object({
  studentId: z.number().int().positive(),
  instructorId: z.number().int().positive(),
  classSessionId: z.number().int().positive().optional(),
  rating: z.number().int().min(1).max(5),
  feedbackText: z.string().min(5).max(2000),
  visibleToStudent: z.boolean().default(true)
});

export async function instructorFeedbackRoutes(
  app: FastifyInstance
): Promise<void> {
  app.post("/api/v1/admin/instructor-feedback", async (request, reply) => {
    const isAdmin = await requireAdminKey(request, reply);
    if (!isAdmin) {
      return;
    }

    const parsed = createFeedbackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid_payload",
        details: parsed.error.flatten()
      });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `
      insert into instructor_feedback (
        student_id,
        instructor_id,
        class_session_id,
        rating,
        feedback_text,
        visible_to_student
      ) values ($1, $2, $3, $4, $5, $6)
      returning id, student_id, instructor_id, class_session_id, rating, feedback_text, visible_to_student, created_at
      `,
      [
        parsed.data.studentId,
        parsed.data.instructorId,
        parsed.data.classSessionId ?? null,
        parsed.data.rating,
        parsed.data.feedbackText,
        parsed.data.visibleToStudent
      ]
    );

    return reply.code(201).send(result.rows[0]);
  });

  app.get(
    "/api/v1/instructor-feedback",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const pool = getDbPool();
      const result = await pool.query(
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
        `,
        [request.user.studentId]
      );

      return reply.send({ items: result.rows });
    }
  );
}
