import { StyleSheet } from "react-native";

import { COLORS } from "./authStyles";

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    alignItems: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 500,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: COLORS.white,
    borderRadius: 36,
    padding: 28,
    alignItems: "center",
    gap: 18,
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
    marginBottom: 4,
  },
  name: {
    fontFamily: "Nunito_700Bold",
    fontSize: 26,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  caption: {
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: COLORS.headline,
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 24,
  },
  providerTag: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.white,
    backgroundColor: COLORS.deepIndigo,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    textTransform: "capitalize",
    marginTop: 4,
  },
  actions: {
    width: "100%",
    marginTop: 20,
  },
});
