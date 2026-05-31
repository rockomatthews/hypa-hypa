import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { AppIcon } from "../components/AppIcon";
import { useHypeBalance } from "../hooks/useHypeBalance";
import { COLORS } from "../theme";

type DepositScreenProps = {
  onClose: () => void;
  onCopyAddress: () => Promise<void>;
  onOpenReceive: () => void;
  onRefreshBalance?: () => void;
  walletAddress?: `0x${string}`;
};

const fundingSources = [
  {
    description: "You already hold HYPE or another asset in a different self-custody wallet.",
    key: "wallet",
    steps: [
      "Copy your HYPA HYPA HyperEVM address.",
      "Paste it into the sending wallet and confirm the network is HyperEVM.",
      "Send native HYPE, then refresh after the transaction lands.",
    ],
    title: "Another wallet",
  },
  {
    description: "You are withdrawing from a centralized exchange account.",
    key: "exchange",
    steps: [
      "Use your HYPA HYPA address as the withdrawal destination.",
      "Make sure the exchange supports native HYPE withdrawals to HyperEVM.",
      "Start with a small test withdrawal before sending a larger amount.",
    ],
    title: "Exchange withdrawal",
  },
  {
    description: "Someone else is sending you funds directly.",
    key: "friend",
    steps: [
      "Open the receive QR so they can scan your address cleanly.",
      "Ask them to send native HYPE on HyperEVM only.",
      "Refresh your balance once they share the transaction hash.",
    ],
    title: "Friend transfer",
  },
] as const;

export function DepositScreen({
  onClose,
  onCopyAddress,
  onOpenReceive,
  onRefreshBalance,
  walletAddress,
}: DepositScreenProps) {
  const insets = useSafeAreaInsets();
  const { balanceLabel, error, isLoading, refresh } = useHypeBalance(walletAddress);
  const [selectedSourceKey, setSelectedSourceKey] =
    useState<(typeof fundingSources)[number]["key"]>("wallet");
  const selectedSource =
    fundingSources.find((source) => source.key === selectedSourceKey) ?? fundingSources[0];

  const handleRefresh = async () => {
    await refresh();
    onRefreshBalance?.();
  };

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
          <Text style={styles.segmentLabel}>Funding source</Text>
          <View style={styles.segmentChoiceRow}>
            {fundingSources.map((source) => {
              const isActive = source.key === selectedSourceKey;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={source.key}
                  onPress={() => setSelectedSourceKey(source.key)}
                  style={[
                    styles.segmentChoice,
                    isActive ? styles.segmentActive : styles.segmentInactive,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={isActive ? styles.segmentActiveText : styles.segmentInactiveText}
                  >
                    {source.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountValue}>{isLoading ? "..." : `${balanceLabel} HYPE`}</Text>
          <Text style={styles.amountMeta}>Current wallet balance on HyperEVM</Text>
          <Pressable accessibilityRole="button" onPress={() => void handleRefresh()} style={styles.refreshChip}>
            <Text style={styles.refreshChipText}>Refresh balance</Text>
          </Pressable>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.assetRow}>
          <View style={styles.assetBadge}>
            <Text style={styles.assetBadgeText}>H</Text>
          </View>

          <View style={styles.assetCopy}>
            <Text style={styles.assetTitle}>HYPE</Text>
            <Text style={styles.assetSubtitle}>Native HyperEVM deposit only</Text>
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
          <Text style={styles.addressHelp}>
            Copy this address from another wallet or exchange, or open the receive QR for an easier scan flow.
          </Text>
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsLabel}>{selectedSource.title}</Text>
          <Text style={styles.stepIntro}>{selectedSource.description}</Text>
          {selectedSource.steps.map((step, index) => (
            <Text key={`${selectedSource.key}-${index}`} style={styles.stepLine}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void onCopyAddress()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Copy address</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onOpenReceive} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Open receive QR</Text>
          </Pressable>
        </View>

        <Text style={styles.supportText}>
          HYPA HYPA supports direct HYPE funding on HyperEVM now. This handoff keeps the deposit flow honest even before native fiat on-ramp and exchange deep links are built.
        </Text>
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
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    gap: 10,
    marginTop: 24,
    minHeight: 58,
    padding: 12,
  },
  segmentLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  segmentChoiceRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentChoice: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  segmentActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
  },
  segmentInactive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 3,
  },
  segmentActiveText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
  },
  segmentInactiveText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
  },
  amountBlock: {
    alignItems: "center",
    marginTop: 38,
  },
  amountValue: {
    color: COLORS.white,
    fontSize: 46,
    fontWeight: "900",
    lineHeight: 50,
    textAlign: "center",
  },
  amountMeta: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    opacity: 0.68,
    textAlign: "center",
  },
  refreshChip: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshChipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  errorText: {
    color: COLORS.yellow,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    marginTop: 10,
    textAlign: "center",
  },
  assetRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
  addressHelp: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    opacity: 0.76,
  },
  stepsCard: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    gap: 8,
    marginTop: 22,
    padding: 14,
  },
  stepsLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  stepIntro: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  stepLine: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    flex: 1,
    justifyContent: "center",
    minHeight: 64,
  },
  primaryButtonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    flex: 1,
    justifyContent: "center",
    minHeight: 64,
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  supportText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 18,
    opacity: 0.72,
  },
});
