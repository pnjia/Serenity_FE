import { StyleSheet } from "react-native";

import { COLORS } from "./authStyles";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 36,
    padding: 32,
    alignItems: "center",
    gap: 16,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 6,
  },
  greeting: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 18,
    color: COLORS.headline,
    textAlign: "center",
  },
  name: {
    fontFamily: "Nunito_700Bold",
    fontSize: 28,
    color: COLORS.primary,
    textAlign: "center",
  },
  caption: {
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: COLORS.headline,
    opacity: 0.8,
    textAlign: "center",
  },
  providerTag: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.white,
    backgroundColor: COLORS.deepIndigo,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    textTransform: "capitalize",
  },
  actions: {
    width: "100%",
    marginTop: 16,
  },
});
