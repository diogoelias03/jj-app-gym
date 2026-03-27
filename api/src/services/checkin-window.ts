export type CheckinWindowReason = "allowed" | "too_early" | "too_late";

export type CheckinWindowEvaluation = {
  allowed: boolean;
  reason: CheckinWindowReason;
  message: string;
  classStartsAt: string;
  checkinOpensAt: string;
  checkinClosesAt: string;
  serverNow: string;
};

function formatDuration(ms: number): string {
  const totalMinutes = Math.ceil(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

export function evaluateCheckinWindow(params: {
  classStartsAt: Date;
  serverNow: Date;
  openHoursBefore: number;
  closeMinutesAfter: number;
}): CheckinWindowEvaluation {
  const { classStartsAt, serverNow, openHoursBefore, closeMinutesAfter } = params;

  const checkinOpensAt = new Date(
    classStartsAt.getTime() - openHoursBefore * 60 * 60 * 1000
  );
  const checkinClosesAt = new Date(
    classStartsAt.getTime() + closeMinutesAfter * 60 * 1000
  );

  if (serverNow < checkinOpensAt) {
    const remainingToOpenMs = checkinOpensAt.getTime() - serverNow.getTime();
    return {
      allowed: false,
      reason: "too_early",
      message: `Check-in ainda nao abriu. Abre em ${formatDuration(
        remainingToOpenMs
      )}.`,
      classStartsAt: classStartsAt.toISOString(),
      checkinOpensAt: checkinOpensAt.toISOString(),
      checkinClosesAt: checkinClosesAt.toISOString(),
      serverNow: serverNow.toISOString()
    };
  }

  if (serverNow > checkinClosesAt) {
    const elapsedAfterCloseMs = serverNow.getTime() - checkinClosesAt.getTime();
    return {
      allowed: false,
      reason: "too_late",
      message: `Check-in encerrado. Fechou ha ${formatDuration(
        elapsedAfterCloseMs
      )}.`,
      classStartsAt: classStartsAt.toISOString(),
      checkinOpensAt: checkinOpensAt.toISOString(),
      checkinClosesAt: checkinClosesAt.toISOString(),
      serverNow: serverNow.toISOString()
    };
  }

  return {
    allowed: true,
    reason: "allowed",
    message: "Check-in disponivel neste momento.",
    classStartsAt: classStartsAt.toISOString(),
    checkinOpensAt: checkinOpensAt.toISOString(),
    checkinClosesAt: checkinClosesAt.toISOString(),
    serverNow: serverNow.toISOString()
  };
}
