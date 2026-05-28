import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandHeader } from "../components/BrandHeader";
import { ComicCard } from "../components/ComicCard";
import { COLORS } from "../theme";

type PortfolioScreenProps = {
  onOpenTrade: (context?: "buy" | "stake" | "rewards") => void;
};

const holdings = [
  { accent: "yellow", symbol: "HYPE", name: "Spot balance", amount: "4,280.00", value: "$11,936.40", action: "buy" },
  { accent: "blue", symbol: "USDC", name: "Buying power", amount: "2,460.00", value: "$2,460.00", action: "buy" },
  { accent: "blue", symbol: "stHYPE", name: "Delegated position", amount: "1,204.72", value: "$3,921.10", action: "stake" },
] as const;

export function PortfolioScreen({ onOpenTrade }: PortfolioScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <BrandHeader />

        <Text style={styles.pageTitle}>Portfolio</Text>
        <Text style={styles.pageMeta}>Spot, buying power, and delegated HYPE.</Text>

        <View style={styles.list}>
          {holdings.map((holding) => (
            <Pressable
              accessibilityRole="button"
              key={holding.symbol}
              onPress={() => onOpenTrade(holding.action)}
            >
              <ComicCard accent={holding.accent} style={styles.rowCard}>
                <View style={styles.rowTop}>
                  <View>
                    <Text
                      style={[
                        styles.symbol,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.symbol}
                    </Text>
                    <Text
                      style={[
                        styles.name,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.name}
                    </Text>
                  </View>
                  <View style={styles.alignEnd}>
                    <Text
                      style={[
                        styles.value,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.value}
                    </Text>
                    <Text
                      style={[
                        styles.amount,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.amount}
                    </Text>
                  </View>
                </View>
              </ComicCard>
            </Pressable>
          ))}
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
  rowCard: {
    paddingVertical: 16,
  },
  rowTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  symbol: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "900",
  },
  name: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  value: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "900",
  },
  amount: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  blueText: {
    color: COLORS.white,
  },
});
