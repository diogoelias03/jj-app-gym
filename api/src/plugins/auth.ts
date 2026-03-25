import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthenticatedUser } from "../types";

const authHeaderSchema = z.string().startsWith("Bearer ");

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

// MVP note: this is a lightweight token format for fast bootstrap.
// Replace with JWT verification before production.
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const parsedHeader = authHeaderSchema.safeParse(request.headers.authorization);
  if (!parsedHeader.success) {
    await reply.code(401).send({ error: "missing_or_invalid_token" });
    return;
  }

  const token = parsedHeader.data.replace("Bearer ", "").trim();
  const [studentIdRaw, branchIdRaw] = token.split(":");
  const studentId = Number(studentIdRaw);
  const branchId = Number(branchIdRaw);

  if (!Number.isInteger(studentId) || !Number.isInteger(branchId)) {
    await reply.code(401).send({ error: "invalid_token_payload" });
    return;
  }

  request.user = { studentId, branchId };
}
