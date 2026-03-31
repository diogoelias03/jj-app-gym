import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { AppProvider, useAppContext } from "./src/session/app-context";
import { appStyles } from "./src/styles";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ClassesScreen } from "./src/screens/ClassesScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { CheckinScreen } from "./src/screens/CheckinScreen";
import { GoalsScreen } from "./src/screens/GoalsScreen";
import { FeedbackScreen } from "./src/screens/FeedbackScreen";
import { SecurityScreen } from "./src/screens/SecurityScreen";
import { TelemetryScreen } from "./src/screens/TelemetryScreen";

type MainTabsParamList = {
  Dashboard: undefined;
  Aulas: undefined;
  Progresso: undefined;
  Checkin: undefined;
  Metas: undefined;
  Feedback: undefined;
  Seguranca: undefined;
  Telemetria: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  const { trackEvent } = useAppContext();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f172a",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        listeners={{ tabPress: () => void trackEvent("tab_open", { tab: "Dashboard" }) }}
      />
      <Tab.Screen
        name="Aulas"
        component={ClassesScreen}
        listeners={{ tabPress: () => void trackEvent("tab_open", { tab: "Aulas" }) }}
      />
      <Tab.Screen
        name="Progresso"
        component={ProgressScreen}
        listeners={{ tabPress: () => void trackEvent("tab_open", { tab: "Progresso" }) }}
      />
      <Tab.Screen
        name="Checkin"
        component={CheckinScreen}
        listeners={{ tabPress: () => void trackEvent("tab_open", { tab: "Checkin" }) }}
      />
      <Tab.Screen
        name="Metas"
        component={GoalsScreen}
        listeners={{ tabPress: () => void trackEvent("tab_open", { tab: "Metas" }) }}
      />
      <Tab.Screen
        name="Feedback"
        component={FeedbackScreen}
        listeners={{ tabPress: () => void trackEvent("tab_open", { tab: "Feedback" }) }}
      />
      <Tab.Screen
        name="Seguranca"
        component={SecurityScreen}
        listeners={{ tabPress: () => void trackEvent("tab_open", { tab: "Seguranca" }) }}
      />
      <Tab.Screen
        name="Telemetria"
        component={TelemetryScreen}
        listeners={{
          tabPress: () => {
            void trackEvent("tab_open", { tab: "Telemetria" });
          }
        }}
      />
    </Tab.Navigator>
  );
}

function AuthenticatedLayout() {
  const { loadAll, handleLogout, isRefreshing, lastMessage } = useAppContext();

  return (
    <SafeAreaView style={appStyles.safe}>
      <StatusBar style="dark" />
      <View style={appStyles.page}>
        <View style={appStyles.row}>
          <TouchableOpacity style={appStyles.buttonSecondary} onPress={() => void loadAll()}>
            <Text style={appStyles.buttonText}>Atualizar Tudo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={appStyles.buttonDanger} onPress={() => void handleLogout()}>
            <Text style={appStyles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={appStyles.flex1}>
          <MainTabs />
        </View>

        {isRefreshing ? <ActivityIndicator size="small" color="#0f766e" /> : null}
        {lastMessage ? <Text style={appStyles.feedback}>{lastMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

function AppContent() {
  const { token, isBootstrapping } = useAppContext();

  if (isBootstrapping) {
    return (
      <SafeAreaView style={appStyles.safeCentered}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={appStyles.textLine}>Carregando sessao...</Text>
      </SafeAreaView>
    );
  }

  if (!token) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen />
      </>
    );
  }

  return <AuthenticatedLayout />;
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AppProvider>
  );
}
