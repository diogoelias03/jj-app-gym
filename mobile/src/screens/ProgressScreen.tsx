import { Text, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function ProgressScreen() {
  const { progress } = useAppContext();

  return (
    <View style={appStyles.page}>
      <Text style={appStyles.title}>Progresso</Text>
      <View style={appStyles.card}>
        {progress ? (
          <>
            <Text style={appStyles.textLine}>
              Perfil: {progress.profileCode} | Faixa atual: {progress.currentBelt}
            </Text>
            <Text style={appStyles.textLine}>
              Proxima: {progress.nextBelt ?? "N/A"} | {progress.progressPercentage}%
            </Text>
            <Text style={appStyles.textLine}>
              IBJJF meses na faixa: {progress.ibjjf.monthsAtCurrentBelt}/
              {progress.ibjjf.minTimeCurrentBeltMonths ?? "N/A"}
            </Text>
            <Text style={appStyles.textLine}>
              Regra de tempo atendida:{" "}
              {progress.ibjjf.timeRequirementMet === null
                ? "N/A"
                : progress.ibjjf.timeRequirementMet
                  ? "sim"
                  : "nao"}
            </Text>
          </>
        ) : (
          <Text style={appStyles.textLine}>Sem dados ainda.</Text>
        )}
      </View>
    </View>
  );
}

