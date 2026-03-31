import { FlatList, Text, View } from "react-native";
import { useAppContext } from "../session/app-context";
import { appStyles } from "../styles";

export function ClassesScreen() {
  const { classes } = useAppContext();

  return (
    <View style={appStyles.page}>
      <Text style={appStyles.title}>Aulas</Text>
      <View style={appStyles.card}>
        <FlatList
          data={classes}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={appStyles.textLine}>Sem aulas.</Text>}
          renderItem={({ item }) => (
            <View style={appStyles.listItem}>
              <Text style={appStyles.listTitle}>
                #{item.id} - {item.title}
              </Text>
              <Text style={appStyles.textLine}>
                Categoria: {item.class_category ?? "nao definida"}
              </Text>
              <Text style={appStyles.textLine}>
                Inicio: {new Date(item.starts_at).toLocaleString("pt-BR")}
              </Text>
              <Text style={appStyles.textLine}>
                Instrutor: {item.instructor_name} | Faixa: {item.belt_name}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

