import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { AppIcon } from "../components/AppIcon";
import { COLORS } from "../theme";

type DepositScreenProps = {
  onClose: () => void;
  onCopyAddress: () => Promise<void>;
  onOpenReceive: () => void;
  walletAddress?: `0x${string}`;
};

const keypadRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "<"],
] as const;

export function DepositScreen({
  onClose,
  onCopyAddress,
  onOpenReceive,
  walletAddress,
}: DepositScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <AppIcon color={COLORS.white} name="deposit" size={24} />
            </View>
            <Text style={styles.headerTitle}>Deposit</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>
        </View>

        <View style={styles.segment}>
          <Text style={styles.segmentLabel}>Fund with</Text>
          <View style={styles.segmentActive}>
            <Text style={styles.segmentActiveText}>Wallet</Text>
          </View>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountValue}>$0</Text>
          <Text style={styles.amountMeta}>0 HYPE</Text>
        </View>

        <View style={styles.assetRow}>
          <View style={styles.assetBadge}>
            <Text style={styles.assetBadgeText}>H</Text>
          </View>

          <View style={styles.assetCopy}>
            <Text style={styles.assetTitle}>HYPE</Text>
            <Text style={styles.assetSubtitle}>Native HyperEVM deposit</Text>
          </View>
        </View>

        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Deposit address</Text>
          <AddressWithCopy
            address={walletAddress}
            color="white"
            onCopyAddress={onCopyAddress}
            size="lg"
          />
        </View>

        <View style={styles.keypad}>
          {keypadRows.map((row) => (
            <View key={row.join("-")} style={styles.keypadRow}>
              {row.map((key) => (
                <Text key={key} style={styles.keypadKey}>
                  {key}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={onOpenReceive} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Open receive QR</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.black,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
  },
  closeButton: {
    alignItems: "center",
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  closeText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },
  segment: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  segmentLabel: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  segmentActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  segmentActiveText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  amountBlock: {
    alignItems: "center",
    marginTop: 44,
  },
  amountValue: {
    color: COLORS.white,
    fontSize: 80,
    fontWeight: "900",
    lineHeight: 84,
  },
  amountMeta: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    opacity: 0.68,
  },
  assetRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  assetBadge: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  assetBadgeText: {
    color: COLORS.black,
    fontSize: 26,
    fontWeight: "900",
  },
  assetCopy: {
    flex: 1,
  },
  assetTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },
  assetSubtitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    opacity: 0.66,
  },
  addressCard: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    gap: 10,
    marginTop: 18,
    padding: 14,
  },
  addressLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  keypad: {
    gap: 18,
    marginTop: 34,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  keypadKey: {
    color: COLORS.white,
    fontSize: 52,
    fontWeight: "300",
    minWidth: 70,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    justifyContent: "center",
    marginTop: 26,
    minHeight: 64,
  },
  primaryButtonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
