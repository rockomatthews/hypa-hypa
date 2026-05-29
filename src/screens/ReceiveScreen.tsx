import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { AppIcon } from "../components/AppIcon";
import { COLORS } from "../theme";

type ReceiveScreenProps = {
  onClose: () => void;
  onCopyAddress: () => Promise<void>;
  walletAddress?: `0x${string}`;
};

const qrPattern = [
  "1110010111001",
  "1001011001011",
  "1011110101111",
  "0010101110001",
  "1110001011101",
  "1001110100111",
  "0110101011010",
  "1011011100101",
  "1100100111011",
  "0011111000101",
  "1110010111001",
  "1001011001011",
  "1011110101111",
] as const;

export function ReceiveScreen({
  onClose,
  onCopyAddress,
  walletAddress,
}: ReceiveScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <AppIcon color={COLORS.black} name="receive" size={24} />
            </View>
            <Text style={styles.headerTitle}>Receive</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>
        </View>

        <View style={styles.identityBlock}>
          <Text style={styles.identityTitle}>HYPA HYPA wallet</Text>
          <AddressWithCopy
            address={walletAddress}
            color="white"
            onCopyAddress={onCopyAddress}
            size="lg"
          />
        </View>

        <View style={styles.qrFrame}>
          <View style={styles.qrCode}>
            {qrPattern.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.qrRow}>
                {row.split("").map((cell, cellIndex) => (
                  <View
                    key={`cell-${rowIndex}-${cellIndex}`}
                    style={[
                      styles.qrCell,
                      { backgroundColor: cell === "1" ? COLORS.white : "transparent" },
                    ]}
                  />
                ))}
              </View>
            ))}
            <View style={styles.qrCenterBadge}>
              <Text style={styles.qrCenterText}>H</Text>
            </View>
          </View>
        </View>

        <View style={styles.networkRow}>
          <View style={styles.networkBadge}>
            <Text style={styles.networkBadgeText}>HYPE</Text>
          </View>
          <Text style={styles.networkText}>Receive HYPE on HyperEVM</Text>
        </View>

        <Text style={styles.supportText}>
          This wallet address supports HYPE on HyperEVM. Copy the address or scan the QR to fund the wallet directly.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => void onCopyAddress()}
          style={styles.copyButton}
        >
          <Text style={styles.copyButtonText}>Copy wallet address</Text>
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
  headerRow: {
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
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
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
  identityBlock: {
    gap: 10,
    marginTop: 34,
  },
  identityTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },
  qrFrame: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    marginTop: 26,
    padding: 16,
  },
  qrCode: {
    alignItems: "center",
    backgroundColor: COLORS.black,
    justifyContent: "center",
    padding: 14,
    position: "relative",
  },
  qrRow: {
    flexDirection: "row",
  },
  qrCell: {
    height: 16,
    margin: 1,
    width: 16,
  },
  qrCenterBadge: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    height: 68,
    justifyContent: "center",
    position: "absolute",
    width: 68,
  },
  qrCenterText: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "900",
  },
  networkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 20,
  },
  networkBadge: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  networkBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
  networkText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  supportText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 18,
    opacity: 0.72,
    textAlign: "center",
  },
  copyButton: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    marginTop: 24,
    minHeight: 62,
    justifyContent: "center",
  },
  copyButtonText: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
