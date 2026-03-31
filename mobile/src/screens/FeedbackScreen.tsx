import { FlatList, Text, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function FeedbackScreen() {
  const { feedbackList } = useAppContext();

  return (
    <View style={appStyles.page}>
      <Text style={appStyles.title}>Feedback</Text>
      <View style={appStyles.card}>
        <Text style={appStyles.cardTitle}>Feedback do Instrutor</Text>
        <FlatList
          data={feedbackList}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={appStyles.textLine}>Sem feedback disponivel.</Text>}
          renderItem={({ item }) => (
            <View style={appStyles.listItem}>
              <Text style={appStyles.listTitle}>
                Nota {item.rating}/5 - {item.instructor_name}
              </Text>
              <Text style={appStyles.textLine}>{item.feedback_text}</Text>
              <Text style={appStyles.hint}>{new Date(item.created_at).toLocaleString("pt-BR")}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

