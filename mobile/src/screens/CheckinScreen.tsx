import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function CheckinScreen() {
  const {
    checkinClassId,
    setCheckinClassId,
    qrToken,
    setQrToken,
    classIdsHint,
    handleCheckin,
    handleQrCheckin
  } = useAppContext();

  return (
    <View style={appStyles.page}>
      <Text style={appStyles.title}>Check-in</Text>
      <View style={appStyles.card}>
        <Text style={appStyles.cardTitle}>Check-in por Botao</Text>
        <TextInput
          style={appStyles.input}
          keyboardType="numeric"
          placeholder="classSessionId"
          value={checkinClassId}
          onChangeText={setCheckinClassId}
        />
        <Text style={appStyles.hint}>{classIdsHint}</Text>
        <TouchableOpacity style={appStyles.buttonPrimary} onPress={() => void handleCheckin()}>
          <Text style={appStyles.buttonText}>Confirmar Check-in</Text>
        </TouchableOpacity>

        <Text style={appStyles.cardTitle}>Check-in por QR</Text>
        <TextInput
          style={appStyles.input}
          placeholder="Token QR"
          value={qrToken}
          onChangeText={setQrToken}
        />
        <TouchableOpacity style={appStyles.buttonPrimary} onPress={() => void handleQrCheckin()}>
          <Text style={appStyles.buttonText}>Confirmar QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={appStyles.buttonSecondary}
          onPress={() =>
            Alert.alert(
              "Dica",
              "No MVP, o token QR e gerado no endpoint admin /api/v1/admin/checkins/qr-token."
            )
          }
        >
          <Text style={appStyles.buttonText}>Como gerar token QR?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

