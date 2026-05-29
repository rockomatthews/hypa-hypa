import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { AppIcon } from "../components/AppIcon";
import { COLORS } from "../theme";

type SendScreenProps = {
  onClose: () => void;
  onCopyAddress: () => Promise<void>;
  walletAddress?: `0x${string}`;
};

const keypadRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "<"],
] as const;

export function SendScreen({
  onClose,
  onCopyAddress,
  walletAddress,
}: SendScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <AppIcon color={COLORS.black} name="send" size={22} />
            </View>
            <Text style={styles.headerTitle}>Send</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>
        </View>

        <View style={styles.recipientCard}>
          <Text style={styles.label}>From</Text>
          <AddressWithCopy
            address={walletAddress}
            color="white"
            onCopyAddress={onCopyAddress}
            size="md"
          />
          <Text style={styles.labelSecondary}>Destination</Text>
          <Text style={styles.placeholder}>Paste or scan a HyperEVM wallet address</Text>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountValue}>$0</Text>
          <Text style={styles.amountMeta}>0 HYPE</Text>
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

        <Pressable accessibilityRole="button" style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Continue</Text>
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
  recipientCard: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    gap: 8,
    marginTop: 26,
    padding: 16,
  },
  label: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  labelSecondary: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 12,
    textTransform: "uppercase",
  },
  placeholder: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  amountBlock: {
    alignItems: "center",
    marginTop: 46,
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
  sendButton: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 62,
    justifyContent: "center",
    marginTop: 24,
  },
  sendButtonText: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
