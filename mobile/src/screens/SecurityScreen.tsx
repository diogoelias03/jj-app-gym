import { Switch, Text, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function SecurityScreen() {
  const { biometricAvailable, biometricEnabled, toggleBiometric } = useAppContext();

  return (
    <View style={appStyles.page}>
      <Text style={appStyles.title}>Seguranca</Text>
      <View style={appStyles.card}>
        <Text style={appStyles.cardTitle}>Biometria de acesso</Text>
        <Text style={appStyles.textLine}>
          Protege a restauracao automatica da sessao com digital/face do dispositivo.
        </Text>
        <View style={appStyles.rowBetween}>
          <Text style={appStyles.textLine}>
            {biometricAvailable ? "Biometria disponivel" : "Biometria indisponivel"}
          </Text>
          <Switch
            value={biometricEnabled}
            onValueChange={(value) => void toggleBiometric(value)}
            disabled={!biometricAvailable}
          />
        </View>
      </View>
    </View>
  );
}

