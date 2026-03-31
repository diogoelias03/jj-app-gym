import AsyncStorage from "@react-native-async-storage/async-storage";

const TELEMETRY_EVENTS_KEY = "jj_app_telemetry_events";
const MAX_EVENTS = 300;

export type TelemetryEvent = {
  id: string;
  name: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type TelemetrySummary = {
  totalEvents: number;
  byName: Record<string, number>;
  lastEventAt: string | null;
};

export async function trackTelemetryEvent(
  name: string,
  metadata?: Record<string, string | number | boolean | null>
): Promise<void> {
  const events = await getTelemetryEvents();
  const nextEvent: TelemetryEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    timestamp: new Date().toISOString(),
    metadata
  };

  const nextEvents = [nextEvent, ...events].slice(0, MAX_EVENTS);
  await AsyncStorage.setItem(TELEMETRY_EVENTS_KEY, JSON.stringify(nextEvents));
}

export async function getTelemetryEvents(limit = 50): Promise<TelemetryEvent[]> {
  const raw = await AsyncStorage.getItem(TELEMETRY_EVENTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as TelemetryEvent[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.slice(0, Math.max(1, limit));
  } catch {
    return [];
  }
}

export async function getTelemetrySummary(): Promise<TelemetrySummary> {
  const allEvents = await getTelemetryEvents(MAX_EVENTS);
  const byName: Record<string, number> = {};

  for (const event of allEvents) {
    byName[event.name] = (byName[event.name] ?? 0) + 1;
  }

  return {
    totalEvents: allEvents.length,
    byName,
    lastEventAt: allEvents[0]?.timestamp ?? null
  };
}

export async function clearTelemetryEvents(): Promise<void> {
  await AsyncStorage.removeItem(TELEMETRY_EVENTS_KEY);
}

