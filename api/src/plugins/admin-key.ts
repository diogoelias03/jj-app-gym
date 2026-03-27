import { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config";

export async function requireAdminKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  if (!config.adminApiKey) {
    await reply
      .code(503)
      .send({ error: "admin_key_not_configured", message: "Defina ADMIN_API_KEY no .env." });
    return false;
  }

  const adminKey = request.headers["x-admin-key"];
  if (adminKey !== config.adminApiKey) {
    await reply.code(401).send({ error: "invalid_admin_key" });
    return false;
  }

  return true;
}
