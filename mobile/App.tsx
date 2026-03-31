import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
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
  Goal,
  InstructorFeedback,
  ProgressResponse
} from "./src/api/client";

type Section =
  | "dashboard"
  | "classes"
  | "progress"
  | "checkin"
  | "goals"
  | "feedback";

const TOKEN_KEY = "jj_app_access_token";

export default function App() {
  const [email, setEmail] = useState("aluno@jjappgym.dev");
  const [password, setPassword] = useState("123456");
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feedbackList, setFeedbackList] = useState<InstructorFeedback[]>([]);

  const [checkinClassId, setCheckinClassId] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTargetValue, setGoalTargetValue] = useState("");
  const [goalUnit, setGoalUnit] = useState("");
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

  useEffect(() => {
    void bootstrapSession();
  }, []);

  async function bootstrapSession(): Promise<void> {
    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        return;
      }

      setToken(savedToken);
      await loadAll(savedToken);
      setLastMessage("Sessao restaurada automaticamente.");
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    } finally {
      setIsBootstrapping(false);
    }
  }

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
      await AsyncStorage.setItem(TOKEN_KEY, response.access_token);
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

      const [dashboardData, classesData, progressData, goalsData, feedbackData] =
        await Promise.all([
          apiRequest<DashboardResponse>("/api/v1/dashboard", {
            token: authToken
          }),
          apiRequest<{ items: ClassSession[] }>("/api/v1/classes", {
            token: authToken
          }),
          apiRequest<ProgressResponse>("/api/v1/progress", {
            token: authToken
          }),
          apiRequest<{ items: Goal[] }>("/api/v1/goals", {
            token: authToken
          }),
          apiRequest<{ items: InstructorFeedback[] }>("/api/v1/instructor-feedback", {
            token: authToken
          })
        ]);

      setDashboard(dashboardData);
      setClasses(classesData.items ?? []);
      setProgress(progressData);
      setGoals(goalsData.items ?? []);
      setFeedbackList(feedbackData.items ?? []);
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

  async function handleCreateGoal(): Promise<void> {
    if (!token) {
      return;
    }

    if (goalTitle.trim().length < 3) {
      Alert.alert("Metas", "Titulo da meta precisa ter no minimo 3 caracteres.");
      return;
    }

    try {
      const payload: {
        title: string;
        targetValue?: number;
        unit?: string;
      } = {
        title: goalTitle.trim()
      };

      if (goalTargetValue.trim()) {
        payload.targetValue = Number(goalTargetValue);
      }
      if (goalUnit.trim()) {
        payload.unit = goalUnit.trim();
      }

      await apiRequest<Goal>("/api/v1/goals", {
        method: "POST",
        token,
        body: JSON.stringify(payload)
      });

      setGoalTitle("");
      setGoalTargetValue("");
      setGoalUnit("");
      setLastMessage("Meta criada com sucesso.");
      await loadGoals(token);
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    }
  }

  async function handleAdvanceGoal(goal: Goal): Promise<void> {
    if (!token) {
      return;
    }

    const nextValue = Number(goal.current_value ?? 0) + 1;
    const shouldComplete =
      goal.target_value !== null && Number.isFinite(goal.target_value)
        ? nextValue >= goal.target_value
        : false;

    try {
      await apiRequest<Goal>(`/api/v1/goals/${goal.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          currentValue: nextValue,
          status: shouldComplete ? "completed" : goal.status
        })
      });
      setLastMessage("Meta atualizada.");
      await loadGoals(token);
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    }
  }

  async function loadGoals(authToken: string): Promise<void> {
    const goalsData = await apiRequest<{ items: Goal[] }>("/api/v1/goals", {
      token: authToken
    });
    setGoals(goalsData.items ?? []);
  }

  async function handleLogout(): Promise<void> {
    setToken(null);
    setDashboard(null);
    setClasses([]);
    setProgress(null);
    setGoals([]);
    setFeedbackList([]);
    setCheckinClassId("");
    setQrToken("");
    await AsyncStorage.removeItem(TOKEN_KEY);
    setLastMessage("Sessao encerrada.");
  }

  if (isBootstrapping) {
    return (
      <SafeAreaView style={styles.safeCentered}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.bootText}>Carregando sessao...</Text>
      </SafeAreaView>
    );
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
              onPress={() => void handleLogin()}
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
              <TouchableOpacity style={styles.buttonDanger} onPress={() => void handleLogout()}>
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
              <TabButton
                label="Metas"
                active={activeSection === "goals"}
                onPress={() => setActiveSection("goals")}
              />
              <TabButton
                label="Feedback"
                active={activeSection === "feedback"}
                onPress={() => setActiveSection("feedback")}
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

            {activeSection === "goals" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Metas do Aluno</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Titulo da meta"
                  value={goalTitle}
                  onChangeText={setGoalTitle}
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    keyboardType="numeric"
                    placeholder="Meta alvo (opcional)"
                    value={goalTargetValue}
                    onChangeText={setGoalTargetValue}
                  />
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    placeholder="Unidade (ex.: aulas)"
                    value={goalUnit}
                    onChangeText={setGoalUnit}
                  />
                </View>
                <TouchableOpacity
                  style={styles.buttonPrimary}
                  onPress={() => void handleCreateGoal()}
                >
                  <Text style={styles.buttonText}>Criar Meta</Text>
                </TouchableOpacity>

                <FlatList
                  data={goals}
                  keyExtractor={(item) => String(item.id)}
                  scrollEnabled={false}
                  ListEmptyComponent={<Text style={styles.textLine}>Sem metas cadastradas.</Text>}
                  renderItem={({ item }) => (
                    <View style={styles.listItem}>
                      <Text style={styles.listTitle}>{item.title}</Text>
                      <Text style={styles.textLine}>
                        Status: {item.status} | Atual: {item.current_value}
                        {item.target_value !== null ? ` / ${item.target_value}` : ""}
                        {item.unit ? ` ${item.unit}` : ""}
                      </Text>
                      <TouchableOpacity
                        style={styles.buttonSmall}
                        onPress={() => void handleAdvanceGoal(item)}
                      >
                        <Text style={styles.buttonText}>+1 progresso</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}

            {activeSection === "feedback" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Feedback do Instrutor</Text>
                <FlatList
                  data={feedbackList}
                  keyExtractor={(item) => String(item.id)}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <Text style={styles.textLine}>Sem feedback disponivel.</Text>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.listItem}>
                      <Text style={styles.listTitle}>
                        Nota {item.rating}/5 - {item.instructor_name}
                      </Text>
                      <Text style={styles.textLine}>{item.feedback_text}</Text>
                      <Text style={styles.hint}>
                        {new Date(item.created_at).toLocaleString("pt-BR")}
                      </Text>
                    </View>
                  )}
                />
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
  safeCentered: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  bootText: {
    color: "#0f172a",
    fontSize: 14
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
  flex1: {
    flex: 1
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
  buttonSmall: {
    backgroundColor: "#334155",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    marginTop: 8
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
