import dotenv from "dotenv";

dotenv.config();

export const config = {
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? "3000"),
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/jj_app_gym",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  jwtSecret: process.env.JWT_SECRET ?? "change-this-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  checkinOpenHoursBefore: Number(process.env.CHECKIN_OPEN_HOURS_BEFORE ?? "168"),
  checkinCloseMinutesAfter: Number(
    process.env.CHECKIN_CLOSE_MINUTES_AFTER ?? "10"
  ),
  adminApiKey: process.env.ADMIN_API_KEY ?? ""
};
