import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandHeader } from "../components/BrandHeader";
import { ComicCard } from "../components/ComicCard";
import { COLORS } from "../theme";

type TradeContext = "buy" | "stake" | "rewards";

type TradeScreenSimpleProps = {
  initialContext?: TradeContext;
};

export function TradeScreenSimple({
  initialContext = "buy",
}: TradeScreenSimpleProps) {
  const [selectedContext, setSelectedContext] = useState<TradeContext>(initialContext);
  const [autoStake, setAutoStake] = useState(true);

  useEffect(() => {
    setSelectedContext(initialContext);
  }, [initialContext]);

  const headline =
    selectedContext === "buy"
      ? "240 USDC -> 29.41 HYPE"
      : selectedContext === "stake"
        ? "Move HYPE into staking"
        : "Review reward history";

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <BrandHeader />

        <Text style={styles.pageTitle}>Trade</Text>
        <Text style={styles.pageMeta}>Review your flow before you confirm.</Text>

        <View style={styles.modeRow}>
          {(["buy", "stake", "rewards"] as TradeContext[]).map((mode) => {
            const active = selectedContext === mode;
            const useBlue = active || mode === "buy";

            return (
              <Pressable
                accessibilityRole="button"
                key={mode}
                onPress={() => setSelectedContext(mode)}
                style={[
                  styles.modeButton,
                  { backgroundColor: useBlue ? COLORS.blue : COLORS.yellow },
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: useBlue ? COLORS.white : COLORS.black },
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ComicCard accent="yellow">
          <Text style={styles.sectionLabel}>Flow</Text>
          <Text style={styles.bigText}>{headline}</Text>
          <Text style={styles.body}>
            {selectedContext === "buy" &&
              "Builder fees are disclosed here right before an order is placed."}
            {selectedContext === "stake" &&
              "Delegation moves do not need routing-fee language, only staking details."}
            {selectedContext === "rewards" &&
              "Reward activity lives here so users can understand what they earned and when."}
          </Text>
        </ComicCard>

        <View style={styles.grid}>
          <View style={styles.metricBlue}>
            <Text style={styles.metricLabelBlue}>Slippage</Text>
            <Text style={styles.metricValueBlue}>
              {selectedContext === "buy" ? "0.30%" : "--"}
            </Text>
          </View>
          <View style={styles.metricYellow}>
            <Text style={styles.metricLabelYellow}>Builder fee</Text>
            <Text style={styles.metricValueYellow}>
              {selectedContext === "buy" ? "0.20%" : "None"}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAutoStake((value) => !value)}
            style={styles.metricBlue}
          >
            <Text style={styles.metricLabelBlue}>After fill</Text>
            <Text style={styles.metricValueBlue}>
              {autoStake ? "Auto-stake on" : "Leave liquid"}
            </Text>
          </Pressable>
          <View style={styles.metricYellow}>
            <Text style={styles.metricLabelYellow}>Route</Text>
            <Text style={styles.metricValueYellow}>
              {selectedContext === "rewards" ? "History" : "Spot flow"}
            </Text>
          </View>
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
  modeRow: {
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    borderColor: COLORS.black,
    borderWidth: 3,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
  },
  sectionLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  bigText: {
    color: COLORS.black,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 28,
    marginTop: 8,
  },
  body: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricBlue: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 3,
    minWidth: "47%",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  metricYellow: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    minWidth: "47%",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  metricLabelBlue: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValueBlue: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 6,
  },
  metricLabelYellow: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValueYellow: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 6,
  },
});
