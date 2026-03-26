import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { verifyAccessToken } from "../security/jwt";
import { AuthenticatedUser } from "../types";

const authHeaderSchema = z.string().startsWith("Bearer ");

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const parsedHeader = authHeaderSchema.safeParse(request.headers.authorization);
  if (!parsedHeader.success) {
    await reply.code(401).send({ error: "missing_or_invalid_token" });
    return;
  }

  try {
    const token = parsedHeader.data.replace("Bearer ", "").trim();
    request.user = verifyAccessToken(token);
  } catch {
    await reply.code(401).send({ error: "invalid_or_expired_token" });
    return;
  }
}
