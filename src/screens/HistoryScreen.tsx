import { StyleSheet, Text, View } from "react-native";

import { BrandHeader } from "../components/BrandHeader";
import { ComicCard } from "../components/ComicCard";
import { COLORS } from "../theme";

const activity = [
  {
    title: "Wallet created",
    detail: "Private wallet generated on this device and recovery phrase confirmed.",
    meta: "Today",
    accent: "blue",
  },
  {
    title: "HYPE balance sync",
    detail: "Checked your live HyperEVM balance and refreshed the receive address state.",
    meta: "Just now",
    accent: "yellow",
  },
  {
    title: "Staking history",
    detail: "HyperCore staking activity will appear here once stake and unstake actions are wired.",
    meta: "Coming next",
    accent: "blue",
  },
] as const;

export function HistoryScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <BrandHeader />

        <Text style={styles.pageTitle}>History</Text>
        <Text style={styles.pageMeta}>Recent wallet, balance, and future staking activity.</Text>

        <View style={styles.list}>
          {activity.map((item) => {
            const isBlue = item.accent === "blue";

            return (
              <ComicCard accent={item.accent} key={item.title} style={styles.card}>
                <Text style={[styles.meta, isBlue ? styles.blueText : null]}>{item.meta}</Text>
                <Text style={[styles.title, isBlue ? styles.blueText : null]}>{item.title}</Text>
                <Text style={[styles.body, isBlue ? styles.blueText : null]}>{item.detail}</Text>
              </ComicCard>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  pageTitle: {
    color: COLORS.yellow,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
  },
  pageMeta: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "700",
    marginTop: -6,
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  card: {
    minHeight: 128,
  },
  meta: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 24,
    marginTop: 8,
  },
  body: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
  },
  blueText: {
    color: COLORS.white,
  },
});
