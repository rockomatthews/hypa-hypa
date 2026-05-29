import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../theme";

type BrandHeaderProps = {
  badgeLabel?: string;
  onBadgePress?: () => void;
  onMenuPress?: () => void;
};

export function BrandHeader({
  badgeLabel = "Profile",
  onBadgePress,
  onMenuPress,
}: BrandHeaderProps) {
  return (
    <View style={styles.row}>
      {onMenuPress ? (
        <Pressable
          accessibilityLabel="Open menu"
          accessibilityRole="button"
          onPress={onMenuPress}
          style={styles.menuButton}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </Pressable>
      ) : null}

      <View style={styles.copy}>
        <Text style={styles.kicker}>Wallet</Text>
        <Text style={styles.title}>HYPA HYPA</Text>
        <Text style={styles.subtitle}>Buy, stake, and track HYPE in one place.</Text>
      </View>

      <Pressable
        accessibilityLabel={badgeLabel}
        accessibilityRole={onBadgePress ? "button" : undefined}
        disabled={!onBadgePress}
        onPress={onBadgePress}
        style={styles.badge}
      >
        <Text style={styles.badgeText}>{badgeLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 3,
    gap: 5,
    justifyContent: "center",
    marginRight: 12,
    minHeight: 48,
    paddingHorizontal: 11,
  },
  menuLine: {
    backgroundColor: COLORS.white,
    height: 4,
    width: 18,
  },
  copy: {
    flex: 1,
    gap: 2,
    paddingRight: 10,
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
