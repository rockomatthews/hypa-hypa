import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../theme";

export function BrandHeader() {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.kicker}>Wallet</Text>
        <Text style={styles.title}>HYPA HYPA</Text>
        <Text style={styles.subtitle}>Buy, stake, and track HYPE in one place.</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>Live</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  kicker: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.yellow,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 30,
  },
  subtitle: {
    color: COLORS.yellow,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    opacity: 0.84,
  },
  badge: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderRadius: 0,
    borderWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
