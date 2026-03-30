import { Pool } from "pg";
import { config } from "../config";
import { evaluateCheckinWindow } from "./checkin-window";

type CheckinResult =
  | {
      ok: true;
      data: {
        id: string;
        class_session_id: string;
        student_id: string;
        status: string;
        checked_in_at: string;
      };
    }
  | { ok: false; statusCode: number; payload: Record<string, unknown> };

export async function performCheckin(params: {
  pool: Pool;
  studentId: number;
  classSessionId: number;
}): Promise<CheckinResult> {
  const { pool, studentId, classSessionId } = params;

  const classSessionResult = await pool.query<{
    starts_at: string;
    server_now: string;
  }>(
    `
    select starts_at, now() as server_now
    from class_sessions
    where id = $1
    `,
    [classSessionId]
  );

  if (classSessionResult.rowCount === 0) {
    return {
      ok: false,
      statusCode: 404,
      payload: { error: "class_session_not_found" }
    };
  }

  const classSession = classSessionResult.rows[0];
  const classStartsAt = new Date(classSession.starts_at);
  const serverNow = new Date(classSession.server_now);

  const windowEval = evaluateCheckinWindow({
    classStartsAt,
    serverNow,
    openHoursBefore: config.checkinOpenHoursBefore,
    closeMinutesAfter: config.checkinCloseMinutesAfter
  });

  if (!windowEval.allowed) {
    return {
      ok: false,
      statusCode: 422,
      payload: {
        error: "checkin_window_closed",
        reason: windowEval.reason,
        message: windowEval.message,
        classSessionId,
        serverNow: windowEval.serverNow,
        checkinOpensAt: windowEval.checkinOpensAt,
        checkinClosesAt: windowEval.checkinClosesAt,
        classStartsAt: windowEval.classStartsAt
      }
    };
  }

  const attendanceResult = await pool.query<{
    id: string;
    class_session_id: string;
    student_id: string;
    status: string;
    checked_in_at: string;
  }>(
    `
    insert into attendances (class_session_id, student_id, status)
    values ($1, $2, 'present')
    on conflict (class_session_id, student_id)
    do update set status = excluded.status, checked_in_at = now()
    returning id, class_session_id, student_id, status, checked_in_at
    `,
    [classSessionId, studentId]
  );

  return {
    ok: true,
    data: attendanceResult.rows[0]
  };
}
