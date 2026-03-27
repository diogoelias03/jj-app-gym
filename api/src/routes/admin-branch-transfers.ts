import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getDbPool } from "../db";
import { requireAdminKey } from "../plugins/admin-key";

const listQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional()
});

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reviewNotes: z.string().max(500).optional()
});

export async function adminBranchTransferRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get("/api/v1/admin/branch-transfers/requests", async (request, reply) => {
    const isAdmin = await requireAdminKey(request, reply);
    if (!isAdmin) {
      return;
    }

    const parsedQuery = listQuerySchema.safeParse(request.query ?? {});
    if (!parsedQuery.success) {
      return reply.code(400).send({
        error: "invalid_query",
        details: parsedQuery.error.flatten()
      });
    }

    const pool = getDbPool();
    const status = parsedQuery.data.status ?? null;
    const result = await pool.query(
      `
      select
        r.id,
        r.student_id,
        s.full_name as student_name,
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
      join students s on s.id = r.student_id
      join branches cb on cb.id = r.current_branch_id
      join branches rb on rb.id = r.requested_branch_id
      where ($1::text is null or r.status = $1)
      order by r.requested_at asc
      `,
      [status]
    );

    return reply.send({ items: result.rows });
  });

  app.post(
    "/api/v1/admin/branch-transfers/requests/:requestId/decision",
    async (request, reply) => {
      const isAdmin = await requireAdminKey(request, reply);
      if (!isAdmin) {
        return;
      }

      const requestIdSchema = z.object({
        requestId: z.coerce.number().int().positive()
      });
      const parsedParams = requestIdSchema.safeParse(request.params ?? {});
      if (!parsedParams.success) {
        return reply.code(400).send({
          error: "invalid_params",
          details: parsedParams.error.flatten()
        });
      }

      const parsedBody = decisionSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.code(400).send({
          error: "invalid_payload",
          details: parsedBody.error.flatten()
        });
      }

      const { requestId } = parsedParams.data;
      const { decision, reviewNotes } = parsedBody.data;
      const pool = getDbPool();

      const transferResult = await pool.query<{
        id: string;
        student_id: string;
        current_branch_id: string;
        requested_branch_id: string;
        status: string;
      }>(
        `
        select id, student_id, current_branch_id, requested_branch_id, status
        from branch_transfer_requests
        where id = $1
        `,
        [requestId]
      );

      if (transferResult.rowCount === 0) {
        return reply.code(404).send({ error: "transfer_request_not_found" });
      }

      const transfer = transferResult.rows[0];
      if (transfer.status !== "pending") {
        return reply.code(409).send({
          error: "transfer_request_not_pending",
          message: `Solicitacao esta com status '${transfer.status}'.`
        });
      }

      const newStatus = decision === "approve" ? "approved" : "rejected";

      await pool.query("begin");
      try {
        await pool.query(
          `
          update branch_transfer_requests
          set status = $1,
              reviewed_at = now(),
              reviewed_by = 'admin',
              review_notes = $2
          where id = $3
          `,
          [newStatus, reviewNotes ?? null, requestId]
        );

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
          ) values ($1, $2, 'admin', null, $3, $4, $5::jsonb)
          `,
          [
            requestId,
            decision === "approve" ? "approved" : "rejected",
            Number(transfer.current_branch_id),
            Number(transfer.requested_branch_id),
            JSON.stringify({ reviewNotes: reviewNotes ?? null })
          ]
        );

        if (decision === "approve") {
          await pool.query(
            `
            update students
            set branch_id = $1
            where id = $2
            `,
            [Number(transfer.requested_branch_id), Number(transfer.student_id)]
          );

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
            ) values ($1, 'branch_updated', 'system', null, $2, $3, '{}'::jsonb)
            `,
            [
              requestId,
              Number(transfer.current_branch_id),
              Number(transfer.requested_branch_id)
            ]
          );
        }

        await pool.query("commit");
      } catch (error) {
        await pool.query("rollback");
        throw error;
      }

      return reply.send({
        requestId,
        decision,
        status: newStatus
      });
    }
  );
}
