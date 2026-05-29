import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "./src/theme";

export default function App() {
  try {
    const { WalletApp } = require("./src/WalletApp");
    return <WalletApp />;
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : "Unknown bootstrap error.";

    return (
      <View style={styles.screen}>
        <Text style={styles.kicker}>Bootstrap error</Text>
        <Text style={styles.title}>The wallet runtime failed before the app could mount.</Text>
        <Text style={styles.body}>{message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.black,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 20,
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
    lineHeight: 32,
  },
  body: {
    color: COLORS.yellow,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    opacity: 0.86,
  },
});
