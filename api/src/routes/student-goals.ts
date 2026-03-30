import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

const createGoalSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  targetValue: z.number().positive().optional(),
  unit: z.string().max(30).optional(),
  targetDate: z.string().date().optional()
});

const updateGoalSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  targetValue: z.number().positive().nullable().optional(),
  currentValue: z.number().min(0).optional(),
  unit: z.string().max(30).nullable().optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
  targetDate: z.string().date().nullable().optional()
});

export async function studentGoalsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/v1/goals", { preHandler: requireAuth }, async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `
      select
        id,
        title,
        description,
        target_value,
        current_value,
        unit,
        status,
        target_date,
        created_at,
        updated_at
      from student_goals
      where student_id = $1
      order by created_at desc
      `,
      [request.user.studentId]
    );

    return reply.send({ items: result.rows });
  });

  app.post("/api/v1/goals", { preHandler: requireAuth }, async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const parsed = createGoalSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: "invalid_payload",
        details: parsed.error.flatten()
      });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `
      insert into student_goals (
        student_id,
        title,
        description,
        target_value,
        unit,
        target_date
      ) values ($1, $2, $3, $4, $5, $6)
      returning id, title, description, target_value, current_value, unit, status, target_date, created_at, updated_at
      `,
      [
        request.user.studentId,
        parsed.data.title,
        parsed.data.description ?? null,
        parsed.data.targetValue ?? null,
        parsed.data.unit ?? null,
        parsed.data.targetDate ?? null
      ]
    );

    return reply.code(201).send(result.rows[0]);
  });

  app.patch(
    "/api/v1/goals/:goalId",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const paramsSchema = z.object({
        goalId: z.coerce.number().int().positive()
      });
      const parsedParams = paramsSchema.safeParse(request.params ?? {});
      if (!parsedParams.success) {
        return reply.code(400).send({
          error: "invalid_params",
          details: parsedParams.error.flatten()
        });
      }

      const parsedBody = updateGoalSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.code(400).send({
          error: "invalid_payload",
          details: parsedBody.error.flatten()
        });
      }

      const payload = parsedBody.data;
      const pool = getDbPool();
      const result = await pool.query(
        `
        update student_goals
        set
          title = coalesce($1, title),
          description = case when $2::text is null then description else $2 end,
          target_value = case when $3::numeric is null then target_value else $3 end,
          current_value = coalesce($4, current_value),
          unit = case when $5::text is null then unit else $5 end,
          status = coalesce($6, status),
          target_date = case when $7::date is null then target_date else $7 end,
          updated_at = now()
        where id = $8
          and student_id = $9
        returning id, title, description, target_value, current_value, unit, status, target_date, created_at, updated_at
        `,
        [
          payload.title ?? null,
          payload.description ?? null,
          payload.targetValue ?? null,
          payload.currentValue ?? null,
          payload.unit ?? null,
          payload.status ?? null,
          payload.targetDate ?? null,
          parsedParams.data.goalId,
          request.user.studentId
        ]
      );

      if ((result.rowCount ?? 0) === 0) {
        return reply.code(404).send({ error: "goal_not_found" });
      }

      return reply.send(result.rows[0]);
    }
  );
}
