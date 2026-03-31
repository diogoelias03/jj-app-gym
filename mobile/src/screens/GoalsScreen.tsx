import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function GoalsScreen() {
  const {
    goalTitle,
    setGoalTitle,
    goalTargetValue,
    setGoalTargetValue,
    goalUnit,
    setGoalUnit,
    handleCreateGoal,
    goals,
    handleAdvanceGoal
  } = useAppContext();

  return (
    <View style={appStyles.page}>
      <Text style={appStyles.title}>Metas</Text>
      <View style={appStyles.card}>
        <Text style={appStyles.cardTitle}>Metas do Aluno</Text>
        <TextInput
          style={appStyles.input}
          placeholder="Titulo da meta"
          value={goalTitle}
          onChangeText={setGoalTitle}
        />
        <View style={appStyles.row}>
          <TextInput
            style={[appStyles.input, appStyles.flex1]}
            keyboardType="numeric"
            placeholder="Meta alvo (opcional)"
            value={goalTargetValue}
            onChangeText={setGoalTargetValue}
          />
          <TextInput
            style={[appStyles.input, appStyles.flex1]}
            placeholder="Unidade (ex.: aulas)"
            value={goalUnit}
            onChangeText={setGoalUnit}
          />
        </View>
        <TouchableOpacity style={appStyles.buttonPrimary} onPress={() => void handleCreateGoal()}>
          <Text style={appStyles.buttonText}>Criar Meta</Text>
        </TouchableOpacity>

        <FlatList
          data={goals}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={appStyles.textLine}>Sem metas cadastradas.</Text>}
          renderItem={({ item }) => (
            <View style={appStyles.listItem}>
              <Text style={appStyles.listTitle}>{item.title}</Text>
              <Text style={appStyles.textLine}>
                Status: {item.status} | Atual: {item.current_value}
                {item.target_value !== null ? ` / ${item.target_value}` : ""}
                {item.unit ? ` ${item.unit}` : ""}
              </Text>
              <TouchableOpacity
                style={appStyles.buttonSmall}
                onPress={() => void handleAdvanceGoal(item)}
              >
                <Text style={appStyles.buttonText}>+1 progresso</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

