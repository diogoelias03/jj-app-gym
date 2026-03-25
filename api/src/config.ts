import dotenv from "dotenv";

dotenv.config();

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? "3000"),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/jj_app_gym",
  corsOrigin: process.env.CORS_ORIGIN ?? "*"
};
