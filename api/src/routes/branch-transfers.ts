import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAuth } from "../plugins/auth";

const createRequestSchema = z.object({
  requestedBranchId: z.number().int().positive(),
  reason: z.string().min(3).max(500)
});

export async function branchTransferRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/api/v1/branch-transfers/requests",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const parsedBody = createRequestSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.code(400).send({
          error: "invalid_payload",
          details: parsedBody.error.flatten()
        });
      }

      const { requestedBranchId, reason } = parsedBody.data;
      const pool = getDbPool();
      const studentId = request.user.studentId;

      const studentResult = await pool.query<{ branch_id: string }>(
        `
        select branch_id
        from students
        where id = $1 and is_active = true
        `,
        [studentId]
      );

      if (studentResult.rowCount === 0) {
        return reply.code(404).send({ error: "student_not_found" });
      }

      const currentBranchId = Number(studentResult.rows[0].branch_id);
      if (currentBranchId === requestedBranchId) {
        return reply.code(422).send({
          error: "same_branch_request",
          message: "A filial solicitada e igual a filial atual."
        });
      }

      const requestedBranchResult = await pool.query<{ id: string }>(
        `
        select id
        from branches
        where id = $1 and is_active = true
        `,
        [requestedBranchId]
      );

      if (requestedBranchResult.rowCount === 0) {
        return reply.code(404).send({ error: "requested_branch_not_found_or_inactive" });
      }

      const pendingResult = await pool.query(
        `
        select 1
        from branch_transfer_requests
        where student_id = $1 and status = 'pending'
        limit 1
        `,
        [studentId]
      );

      if ((pendingResult.rowCount ?? 0) > 0) {
        return reply.code(409).send({
          error: "pending_transfer_request_exists",
          message: "Ja existe uma solicitacao pendente para este aluno."
        });
      }

      const requestResult = await pool.query<{
        id: string;
        student_id: string;
        current_branch_id: string;
        requested_branch_id: string;
        status: string;
        requested_at: string;
      }>(
        `
        insert into branch_transfer_requests (
          student_id,
          current_branch_id,
          requested_branch_id,
          status,
          reason
        ) values ($1, $2, $3, 'pending', $4)
        returning id, student_id, current_branch_id, requested_branch_id, status, requested_at
        `,
        [studentId, currentBranchId, requestedBranchId, reason]
      );

      const created = requestResult.rows[0];

      await pool.query(
        `
        insert into branch_transfer_events (
          request_id,
          event_type,
          actor_type,
          actor_id,
          from_branch_id,
          to_branch_id,
          payload
        ) values ($1, 'requested', 'student', $2, $3, $4, $5::jsonb)
        `,
        [
          Number(created.id),
          studentId,
          currentBranchId,
          requestedBranchId,
          JSON.stringify({ reason })
        ]
      );

      return reply.code(201).send({
        id: Number(created.id),
        studentId: Number(created.student_id),
        currentBranchId: Number(created.current_branch_id),
        requestedBranchId: Number(created.requested_branch_id),
        status: created.status,
        requestedAt: created.requested_at
      });
    }
  );

  app.get(
    "/api/v1/branch-transfers/requests/my",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const pool = getDbPool();
      const result = await pool.query(
        `
        select
          r.id,
          r.current_branch_id,
          cb.name as current_branch_name,
          r.requested_branch_id,
          rb.name as requested_branch_name,
          r.status,
          r.reason,
          r.requested_at,
          r.reviewed_at,
          r.review_notes
        from branch_transfer_requests r
        join branches cb on cb.id = r.current_branch_id
        join branches rb on rb.id = r.requested_branch_id
        where r.student_id = $1
        order by r.requested_at desc
        `,
        [request.user.studentId]
      );

      return reply.send({ items: result.rows });
    }
  );
}
