import { ActivityIndicator, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { appStyles } from "../styles";
import { useAppContext } from "../session/app-context";

export function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    isLoggingIn,
    isBootstrapping,
    lastMessage
  } = useAppContext();

  if (isBootstrapping) {
    return (
      <SafeAreaView style={appStyles.safeCentered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={appStyles.textLine}>Carregando sessao...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={appStyles.safe}>
      <View style={appStyles.page}>
        <Text style={appStyles.title}>JJ App Gym</Text>
        <Text style={appStyles.subtitle}>MVP Mobile Integrado com API</Text>

        <View style={appStyles.card}>
          <Text style={appStyles.cardTitle}>Login</Text>
          <TextInput
            style={appStyles.input}
            autoCapitalize="none"
            placeholder="E-mail"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={appStyles.input}
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={appStyles.buttonPrimary}
            onPress={() => void handleLogin()}
            disabled={isLoggingIn}
          >
            <Text style={appStyles.buttonText}>{isLoggingIn ? "Entrando..." : "Entrar"}</Text>
          </TouchableOpacity>
        </View>
        {lastMessage ? <Text style={appStyles.feedback}>{lastMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}
