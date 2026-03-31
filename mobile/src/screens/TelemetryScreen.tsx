import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function TelemetryScreen() {
  const { telemetrySummary, telemetryEvents, refreshTelemetry, clearTelemetry } = useAppContext();

  const byNameEntries = Object.entries(telemetrySummary?.byName ?? {});

  return (
    <ScrollView contentContainerStyle={appStyles.pageScrollContent}>
      <View style={appStyles.page}>
        <Text style={appStyles.title}>Telemetria</Text>
        <View style={appStyles.card}>
          <Text style={appStyles.cardTitle}>Resumo</Text>
          <Text style={appStyles.textLine}>Total de eventos: {telemetrySummary?.totalEvents ?? 0}</Text>
          <Text style={appStyles.textLine}>
            Ultimo evento:{" "}
            {telemetrySummary?.lastEventAt
              ? new Date(telemetrySummary.lastEventAt).toLocaleString("pt-BR")
              : "N/A"}
          </Text>

          {byNameEntries.length === 0 ? (
            <Text style={appStyles.textLine}>Sem eventos ainda.</Text>
          ) : (
            byNameEntries.map(([name, count]) => (
              <Text key={name} style={appStyles.textLine}>
                {name}: {count}
              </Text>
            ))
          )}

          <View style={appStyles.row}>
            <TouchableOpacity style={appStyles.buttonSecondary} onPress={() => void refreshTelemetry()}>
              <Text style={appStyles.buttonText}>Atualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={appStyles.buttonDanger} onPress={() => void clearTelemetry()}>
              <Text style={appStyles.buttonText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={appStyles.card}>
          <Text style={appStyles.cardTitle}>Eventos recentes</Text>
          {telemetryEvents.length === 0 ? (
            <Text style={appStyles.textLine}>Sem eventos recentes.</Text>
          ) : (
            telemetryEvents.map((event) => (
              <View key={event.id} style={appStyles.listItem}>
                <Text style={appStyles.listTitle}>{event.name}</Text>
                <Text style={appStyles.hint}>
                  {new Date(event.timestamp).toLocaleString("pt-BR")}
                </Text>
                {event.metadata ? (
                  <Text style={appStyles.textLine}>{JSON.stringify(event.metadata)}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

