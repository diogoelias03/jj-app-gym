import { StyleSheet } from "react-native";

export const appStyles = StyleSheet.create({
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
  page: {
    flex: 1,
    padding: 16,
    gap: 12
  },
  pageScrollContent: {
    paddingBottom: 24
  },
  title: {
    fontSize: 26,
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  flex1: {
    flex: 1
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
