export function getFriendlyError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Erro inesperado.";
  }

  try {
    const parsed = JSON.parse(error.message) as {
      error?: string;
      message?: string;
      checkinOpensAt?: string;
      checkinClosesAt?: string;
    };

    if (parsed.error === "checkin_window_closed") {
      const opensAt = parsed.checkinOpensAt
        ? new Date(parsed.checkinOpensAt).toLocaleString("pt-BR")
        : "N/A";
      const closesAt = parsed.checkinClosesAt
        ? new Date(parsed.checkinClosesAt).toLocaleString("pt-BR")
        : "N/A";
      return `Janela de check-in fechada. Abre em ${opensAt} e fecha em ${closesAt}.`;
    }

    if (parsed.message) {
      return parsed.message;
    }

    if (parsed.error) {
      return `Erro da API: ${parsed.error}`;
    }
  } catch {
    return error.message;
  }

  return error.message;
}

