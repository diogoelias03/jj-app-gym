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

type MainTabsParamList = {
  Dashboard: undefined;
  Aulas: undefined;
  Progresso: undefined;
  Checkin: undefined;
  Metas: undefined;
  Feedback: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0f172a",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" }
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Aulas" component={ClassesScreen} />
      <Tab.Screen name="Progresso" component={ProgressScreen} />
      <Tab.Screen name="Checkin" component={CheckinScreen} />
      <Tab.Screen name="Metas" component={GoalsScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
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
