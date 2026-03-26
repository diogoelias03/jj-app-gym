import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { AuthenticatedUser } from "../types";

const payloadSchema = z.object({
  studentId: z.number().int().positive(),
  branchId: z.number().int().positive(),
  role: z.literal("student")
});

export function signAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(user, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
}

export function verifyAccessToken(token: string): AuthenticatedUser {
  const decoded = jwt.verify(token, config.jwtSecret);
  const parsedPayload = payloadSchema.safeParse(decoded);

  if (!parsedPayload.success) {
    throw new Error("invalid_token_payload");
  }

  return parsedPayload.data;
}
