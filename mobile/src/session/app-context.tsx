import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  apiRequest,
  AuthResponse,
  CheckinResponse,
  ClassSession,
  DashboardResponse,
  Goal,
  InstructorFeedback,
  ProgressResponse
} from "../api/client";
import { getFriendlyError } from "../utils/error";

const TOKEN_KEY = "jj_app_access_token_secure";
const BIOMETRIC_ENABLED_KEY = "jj_app_biometric_enabled";

type AppContextValue = {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  token: string | null;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  isRefreshing: boolean;
  lastMessage: string | null;
  dashboard: DashboardResponse | null;
  classes: ClassSession[];
  progress: ProgressResponse | null;
  goals: Goal[];
  feedbackList: InstructorFeedback[];
  checkinClassId: string;
  setCheckinClassId: (value: string) => void;
  qrToken: string;
  setQrToken: (value: string) => void;
  goalTitle: string;
  setGoalTitle: (value: string) => void;
  goalTargetValue: string;
  setGoalTargetValue: (value: string) => void;
  goalUnit: string;
  setGoalUnit: (value: string) => void;
  classIdsHint: string;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  toggleBiometric: (nextValue: boolean) => Promise<void>;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  loadAll: () => Promise<void>;
  handleCheckin: () => Promise<void>;
  handleQrCheckin: () => Promise<void>;
  handleCreateGoal: () => Promise<void>;
  handleAdvanceGoal: (goal: Goal) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("aluno@jjappgym.dev");
  const [password, setPassword] = useState("123456");
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

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
      const [savedToken, savedBiometricFlag] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY)
      ]);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isAvailable = hasHardware && isEnrolled;
      setBiometricAvailable(isAvailable);

      const persistedBiometricEnabled = savedBiometricFlag === "true";
      const effectiveBiometricEnabled = persistedBiometricEnabled && isAvailable;
      setBiometricEnabled(effectiveBiometricEnabled);

      if (!savedToken) {
        return;
      }

      if (effectiveBiometricEnabled) {
        const allowed = await authenticateWithBiometrics(
          "Use biometria para restaurar sua sessao."
        );
        if (!allowed) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setLastMessage("Sessao bloqueada. Faca login novamente.");
          return;
        }
      }

      setToken(savedToken);
      await loadAllInternal(savedToken);
      setLastMessage("Sessao restaurada automaticamente.");
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    } finally {
      setIsBootstrapping(false);
    }
  }

  async function authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: "Usar senha do dispositivo",
      cancelLabel: "Cancelar"
    });

    return result.success;
  }

  async function toggleBiometric(nextValue: boolean): Promise<void> {
    if (nextValue) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setBiometricAvailable(false);
        setBiometricEnabled(false);
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "false");
        setLastMessage("Biometria indisponivel no dispositivo.");
        return;
      }

      const allowed = await authenticateWithBiometrics("Confirme biometria para ativar.");
      if (!allowed) {
        setLastMessage("Ativacao de biometria cancelada.");
        return;
      }
    }

    setBiometricEnabled(nextValue);
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, nextValue ? "true" : "false");
    setLastMessage(nextValue ? "Biometria ativada." : "Biometria desativada.");
  }

  async function loadAllInternal(authToken: string): Promise<void> {
    setIsRefreshing(true);
    setLastMessage(null);
    try {
      const [dashboardData, classesData, progressData, goalsData, feedbackData] =
        await Promise.all([
          apiRequest<DashboardResponse>("/api/v1/dashboard", { token: authToken }),
          apiRequest<{ items: ClassSession[] }>("/api/v1/classes", { token: authToken }),
          apiRequest<ProgressResponse>("/api/v1/progress", { token: authToken }),
          apiRequest<{ items: Goal[] }>("/api/v1/goals", { token: authToken }),
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

  async function handleLogin(): Promise<void> {
    try {
      setIsLoggingIn(true);
      setLastMessage(null);
      const response = await apiRequest<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });
      setToken(response.access_token);
      await SecureStore.setItemAsync(TOKEN_KEY, response.access_token);
      setLastMessage("Login realizado com sucesso.");
      await loadAllInternal(response.access_token);
    } catch (error) {
      setLastMessage(getFriendlyError(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function loadAll(): Promise<void> {
    if (!token) {
      return;
    }
    await loadAllInternal(token);
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
      const payload: { title: string; targetValue?: number; unit?: string } = {
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
    const goalsData = await apiRequest<{ items: Goal[] }>("/api/v1/goals", { token: authToken });
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
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setLastMessage("Sessao encerrada.");
  }

  const value: AppContextValue = {
    email,
    setEmail,
    password,
    setPassword,
    token,
    isBootstrapping,
    isLoggingIn,
    isRefreshing,
    lastMessage,
    dashboard,
    classes,
    progress,
    goals,
    feedbackList,
    checkinClassId,
    setCheckinClassId,
    qrToken,
    setQrToken,
    goalTitle,
    setGoalTitle,
    goalTargetValue,
    setGoalTargetValue,
    goalUnit,
    setGoalUnit,
    classIdsHint,
    biometricAvailable,
    biometricEnabled,
    toggleBiometric,
    handleLogin,
    handleLogout,
    loadAll,
    handleCheckin,
    handleQrCheckin,
    handleCreateGoal,
    handleAdvanceGoal
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}

