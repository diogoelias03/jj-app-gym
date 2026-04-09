import { FastifyInstance } from "fastify";
import { getDbPool } from "../db";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health/live", async (_request, reply) => {
    return reply.send({
      status: "ok"
    });
  });

  app.get("/health", async (_request, reply) => {
    const pool = getDbPool();
    const result = await pool.query("select now() as db_time");
    return reply.send({
      status: "ok",
      dbTime: result.rows[0]?.db_time
    });
  });
}
