import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  apiRequest,
  AuthResponse,
  CheckinResponse,
  ClassSession,
  DashboardResponse,
  ProgressResponse
} from "./src/api/client";

type Section = "dashboard" | "classes" | "progress" | "checkin";

export default function App() {
  const [email, setEmail] = useState("aluno@jjappgym.dev");
  const [password, setPassword] = useState("123456");
  const [token, setToken] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [checkinClassId, setCheckinClassId] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const loggedIn = !!token;

  const classIdsHint = useMemo(() => {
    if (classes.length === 0) {
      return "Carregue as aulas para selecionar um classSessionId valido.";
    }
    return `Ids disponiveis: ${classes.map((item) => item.id).join(", ")}`;
  }, [classes]);

  async function handleLogin(): Promise<void> {
    try {
      setIsLoggingIn(true);
      setLastMessage(null);

      const response = await apiRequest<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      setToken(response.access_token);
      setLastMessage("Login realizado com sucesso.");
      await loadAll(response.access_token);
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function loadAll(authToken = token): Promise<void> {
    if (!authToken) {
      return;
    }

    try {
      setIsRefreshing(true);
      setLastMessage(null);
      const [dashboardData, classesData, progressData] = await Promise.all([
        apiRequest<DashboardResponse>("/api/v1/dashboard", {
          token: authToken
        }),
        apiRequest<{ items: ClassSession[] }>("/api/v1/classes", {
          token: authToken
        }),
        apiRequest<ProgressResponse>("/api/v1/progress", {
          token: authToken
        })
      ]);

      setDashboard(dashboardData);
      setClasses(classesData.items ?? []);
      setProgress(progressData);
      setLastMessage("Dados atualizados.");
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleCheckin(): Promise<void> {
    if (!token) {
      return;
    }

    const classSessionId = Number(checkinClassId);
    if (!Number.isInteger(classSessionId) || classSessionId <= 0) {
      Alert.alert("Check-in", "Informe um classSessionId valido.");
      return;
    }

    try {
      const response = await apiRequest<CheckinResponse>("/api/v1/checkins", {
        method: "POST",
        token,
        body: JSON.stringify({ classSessionId })
      });

      setLastMessage(
        `Check-in confirmado. attendanceId=${response.id}, horario=${new Date(
          response.checked_in_at
        ).toLocaleString("pt-BR")}`
      );
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    }
  }

  async function handleQrCheckin(): Promise<void> {
    if (!token) {
      return;
    }

    if (!qrToken.trim()) {
      Alert.alert("Check-in por QR", "Informe o token do QR.");
      return;
    }

    try {
      const response = await apiRequest<CheckinResponse>("/api/v1/checkins/qr", {
        method: "POST",
        token,
        body: JSON.stringify({ qrToken: qrToken.trim() })
      });

      setLastMessage(
        `Check-in por QR confirmado. attendanceId=${response.id}, horario=${new Date(
          response.checked_in_at
        ).toLocaleString("pt-BR")}`
      );
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    }
  }

  function handleLogout(): void {
    setToken(null);
    setDashboard(null);
    setClasses([]);
    setProgress(null);
    setCheckinClassId("");
    setQrToken("");
    setLastMessage("Sessao encerrada.");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>JJ App Gym</Text>
        <Text style={styles.subtitle}>MVP Mobile Integrado com API</Text>

        {!loggedIn ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              placeholder="E-mail"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              <Text style={styles.buttonText}>
                {isLoggingIn ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => void loadAll()}>
                <Text style={styles.buttonText}>Atualizar Tudo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDanger} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sair</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionTabs}>
              <TabButton
                label="Dashboard"
                active={activeSection === "dashboard"}
                onPress={() => setActiveSection("dashboard")}
              />
              <TabButton
                label="Aulas"
                active={activeSection === "classes"}
                onPress={() => setActiveSection("classes")}
              />
              <TabButton
                label="Progresso"
                active={activeSection === "progress"}
                onPress={() => setActiveSection("progress")}
              />
              <TabButton
                label="Check-in"
                active={activeSection === "checkin"}
                onPress={() => setActiveSection("checkin")}
              />
            </View>

            {activeSection === "dashboard" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Dashboard</Text>
                {dashboard ? (
                  <>
                    <Text style={styles.textLine}>
                      Proxima aula: {dashboard.nextClass?.title ?? "Sem aula agendada"}
                    </Text>
                    <Text style={styles.textLine}>
                      Faixa: {dashboard.progress.currentBelt} {"->"}{" "}
                      {dashboard.progress.nextBelt ?? "Sem proxima faixa definida"}
                    </Text>
                    <Text style={styles.textLine}>
                      Progresso: {dashboard.progress.completedClasses}/
                      {dashboard.progress.requiredClasses} (
                      {dashboard.progress.progressPercentage}%)
                    </Text>
                    <Text style={styles.textLine}>
                      Metas ativas: {dashboard.goals.activeCount} | Concluidas:{" "}
                      {dashboard.goals.completedCount}
                    </Text>
                    <Text style={styles.textLine}>
                      Media feedback: {dashboard.feedback.averageRating ?? "N/A"}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.textLine}>Sem dados ainda.</Text>
                )}
              </View>
            )}

            {activeSection === "classes" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Aulas</Text>
                <FlatList
                  data={classes}
                  keyExtractor={(item) => String(item.id)}
                  scrollEnabled={false}
                  ListEmptyComponent={<Text style={styles.textLine}>Sem aulas.</Text>}
                  renderItem={({ item }) => (
                    <View style={styles.listItem}>
                      <Text style={styles.listTitle}>
                        #{item.id} - {item.title}
                      </Text>
                      <Text style={styles.textLine}>
                        Categoria: {item.class_category ?? "nao definida"}
                      </Text>
                      <Text style={styles.textLine}>
                        Inicio: {new Date(item.starts_at).toLocaleString("pt-BR")}
                      </Text>
                      <Text style={styles.textLine}>
                        Instrutor: {item.instructor_name} | Faixa: {item.belt_name}
                      </Text>
                    </View>
                  )}
                />
              </View>
            )}

            {activeSection === "progress" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Progresso</Text>
                {progress ? (
                  <>
                    <Text style={styles.textLine}>
                      Perfil: {progress.profileCode} | Faixa atual: {progress.currentBelt}
                    </Text>
                    <Text style={styles.textLine}>
                      Proxima: {progress.nextBelt ?? "N/A"} | {progress.progressPercentage}%
                    </Text>
                    <Text style={styles.textLine}>
                      IBJJF meses na faixa: {progress.ibjjf.monthsAtCurrentBelt}/
                      {progress.ibjjf.minTimeCurrentBeltMonths ?? "N/A"}
                    </Text>
                    <Text style={styles.textLine}>
                      Regra de tempo atendida:{" "}
                      {progress.ibjjf.timeRequirementMet === null
                        ? "N/A"
                        : progress.ibjjf.timeRequirementMet
                          ? "sim"
                          : "nao"}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.textLine}>Sem dados ainda.</Text>
                )}
              </View>
            )}

            {activeSection === "checkin" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Check-in por Botao</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="classSessionId"
                  value={checkinClassId}
                  onChangeText={setCheckinClassId}
                />
                <Text style={styles.hint}>{classIdsHint}</Text>
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => void handleCheckin()}>
                  <Text style={styles.buttonText}>Confirmar Check-in</Text>
                </TouchableOpacity>

                <Text style={[styles.cardTitle, styles.subCardSpacing]}>Check-in por QR</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Token QR"
                  value={qrToken}
                  onChangeText={setQrToken}
                />
                <TouchableOpacity
                  style={styles.buttonPrimary}
                  onPress={() => void handleQrCheckin()}
                >
                  <Text style={styles.buttonText}>Confirmar QR</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {isRefreshing ? <ActivityIndicator size="small" color="#0f766e" /> : null}
        {lastMessage ? <Text style={styles.feedback}>{lastMessage}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabButton(props: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { label, active, onPress } = props;
  return (
    <TouchableOpacity
      style={[styles.tabButton, active ? styles.tabButtonActive : null]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

function getFriendlyError(error: unknown): string {
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9"
  },
  container: {
    padding: 20,
    gap: 12
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitle: {
    fontSize: 14,
    color: "#334155"
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1"
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a"
  },
  subCardSpacing: {
    marginTop: 10
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  buttonPrimary: {
    backgroundColor: "#0f766e",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center"
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center"
  },
  buttonDanger: {
    flex: 1,
    backgroundColor: "#be123c",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  sectionTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tabButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#94a3b8",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#e2e8f0"
  },
  tabButtonActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a"
  },
  tabText: {
    color: "#334155",
    fontWeight: "600"
  },
  tabTextActive: {
    color: "#ffffff"
  },
  textLine: {
    color: "#0f172a",
    fontSize: 14
  },
  hint: {
    fontSize: 12,
    color: "#475569"
  },
  listItem: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8
  },
  listTitle: {
    fontWeight: "700",
    color: "#0f172a"
  },
  feedback: {
    color: "#0f172a",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10
  }
});
