import { Text, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function DashboardScreen() {
  const { dashboard } = useAppContext();

  return (
    <View style={appStyles.page}>
      <Text style={appStyles.title}>Dashboard</Text>
      <View style={appStyles.card}>
        {dashboard ? (
          <>
            <Text style={appStyles.textLine}>
              Proxima aula: {dashboard.nextClass?.title ?? "Sem aula agendada"}
            </Text>
            <Text style={appStyles.textLine}>
              Faixa: {dashboard.progress.currentBelt} {"->"}{" "}
              {dashboard.progress.nextBelt ?? "Sem proxima faixa definida"}
            </Text>
            <Text style={appStyles.textLine}>
              Progresso: {dashboard.progress.completedClasses}/
              {dashboard.progress.requiredClasses} ({dashboard.progress.progressPercentage}%)
            </Text>
            <Text style={appStyles.textLine}>
              Metas ativas: {dashboard.goals.activeCount} | Concluidas:{" "}
              {dashboard.goals.completedCount}
            </Text>
            <Text style={appStyles.textLine}>
              Media feedback: {dashboard.feedback.averageRating ?? "N/A"}
            </Text>
          </>
        ) : (
          <Text style={appStyles.textLine}>Sem dados ainda.</Text>
        )}
      </View>
    </View>
  );
}

