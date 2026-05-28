import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandHeader } from "../components/BrandHeader";
import { ComicCard } from "../components/ComicCard";
import { COLORS } from "../theme";

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.heroSection,
          { paddingTop: Math.max(insets.top, 18) + 8 },
        ]}
      >
        <BrandHeader />

        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Total balance</Text>
          <Text style={styles.balanceValue}>$18,420.66</Text>
          <Text style={styles.balanceMeta}>+$382.14 today</Text>
        </View>
      </View>

      <View style={styles.drawer}>
        <View style={styles.handle} />

        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Overview</Text>
          <Text style={styles.drawerMeta}>USDC ready: $2,460.00</Text>
        </View>

        <View style={styles.primaryRow}>
          <ComicCard accent="blue" style={[styles.primaryCard, styles.primaryBlock]}>
            <Text style={[styles.shortcutTitle, styles.blueText]}>Staked HYPE</Text>
            <Text style={[styles.shortcutValue, styles.blueText]}>4,280.00</Text>
            <Text style={[styles.shortcutMeta, styles.blueText]}>Northstar validator</Text>
          </ComicCard>

          <ComicCard accent="yellow" style={[styles.primaryCard, styles.primaryBlock]}>
            <Text style={styles.shortcutTitle}>Rewards</Text>
            <Text style={styles.shortcutValue}>+42.80 HYPE</Text>
            <Text style={styles.shortcutMeta}>Auto-restake is on</Text>
          </ComicCard>
        </View>

        <ComicCard accent="blue" style={styles.rewardsCard}>
          <Text style={[styles.shortcutTitle, styles.blueText]}>Next recurring buy</Text>
          <Text style={[styles.shortcutValue, styles.blueText]}>Friday at 4:00 PM</Text>
          <Text style={[styles.shortcutMeta, styles.blueText]}>
            $150 USDC converts to HYPE and stakes automatically.
          </Text>
        </ComicCard>

        <View style={styles.reviewPanel}>
          <ComicCard accent="yellow" style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>Order review</Text>
            <Text style={styles.reviewTitle}>Buy HYPE, then stake automatically.</Text>

            <View style={styles.reviewStats}>
              <View style={styles.reviewPill}>
                <Text style={styles.reviewPillLabel}>Spend</Text>
                <Text style={styles.reviewPillValue}>240 USDC</Text>
              </View>
              <View style={styles.reviewPill}>
                <Text style={styles.reviewPillLabel}>Receive</Text>
                <Text style={styles.reviewPillValue}>29.41 HYPE</Text>
              </View>
            </View>

            <Text style={styles.reviewBody}>
              Trading, portfolio, and profile live in the tab bar below.
            </Text>
          </ComicCard>
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
  heroSection: {
    flex: 0.42,
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  balanceBlock: {
    gap: 4,
    paddingTop: 18,
  },
  balanceLabel: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  balanceValue: {
    color: COLORS.yellow,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.8,
    lineHeight: 46,
  },
  balanceMeta: {
    color: COLORS.blue,
    fontSize: 15,
    fontWeight: "800",
  },
  drawer: {
    backgroundColor: COLORS.yellow,
    borderTopColor: COLORS.black,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 4,
    flex: 0.58,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: COLORS.black,
    height: 6,
    marginBottom: 12,
    opacity: 0.25,
    width: 60,
  },
  drawerHeader: {
    marginBottom: 12,
  },
  drawerTitle: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  drawerMeta: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
    opacity: 0.8,
  },
  primaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  primaryBlock: {
    flex: 1,
  },
  primaryCard: {
    minHeight: 118,
    paddingVertical: 14,
  },
  rewardsCard: {
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 92,
  },
  shortcutTitle: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 18,
  },
  shortcutValue: {
    color: COLORS.black,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 26,
    marginTop: 10,
  },
  shortcutMeta: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
  blueText: {
    color: COLORS.white,
  },
  reviewPanel: {
    marginTop: 2,
  },
  reviewCard: {
    minHeight: 196,
  },
  reviewLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  reviewTitle: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 24,
    marginTop: 8,
  },
  reviewStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  reviewPill: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderRadius: 0,
    borderWidth: 3,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewPillLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  reviewPillValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },
  reviewBody: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 12,
  },
});
