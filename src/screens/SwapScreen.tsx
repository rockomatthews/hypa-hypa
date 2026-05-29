import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "../components/AppIcon";
import { useHyperCoreSpot } from "../hooks/useHyperCoreSpot";
import { COLORS } from "../theme";

type SwapScreenProps = {
  walletAddress?: `0x${string}`;
};

const keypadRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "<"],
] as const;

export function SwapScreen({ walletAddress }: SwapScreenProps) {
  const insets = useSafeAreaInsets();
  const { balances, error, isLoading, refresh, swapOptions } = useHyperCoreSpot(walletAddress);
  const [selectedFromTokenId, setSelectedFromTokenId] = useState<string | null>(null);
  const [selectedToTokenId, setSelectedToTokenId] = useState<string | null>(null);

  useEffect(() => {
    if (!swapOptions.length) {
      return;
    }

    const fromCandidate =
      swapOptions.find((option) => option.isInWallet) ??
      swapOptions.find((option) => option.symbol === "HYPE") ??
      swapOptions[0];
    const toCandidate =
      swapOptions.find(
        (option) => option.symbol === "USDC" && option.tokenId !== fromCandidate.tokenId,
      ) ??
      swapOptions.find((option) => option.tokenId !== fromCandidate.tokenId) ??
      fromCandidate;

    setSelectedFromTokenId((currentValue) => currentValue ?? fromCandidate.tokenId);
    setSelectedToTokenId((currentValue) => {
      if (currentValue && currentValue !== fromCandidate.tokenId) {
        return currentValue;
      }

      return toCandidate.tokenId;
    });
  }, [swapOptions]);

  const selectedFrom = useMemo(
    () => swapOptions.find((option) => option.tokenId === selectedFromTokenId) ?? null,
    [selectedFromTokenId, swapOptions],
  );
  const selectedTo = useMemo(
    () => swapOptions.find((option) => option.tokenId === selectedToTokenId) ?? null,
    [selectedToTokenId, swapOptions],
  );
  const walletAssetsCount = balances.filter((balance) => Number.parseFloat(balance.total) > 0).length;

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <AppIcon color={COLORS.black} name="swap" size={24} />
            </View>
            <View>
              <Text style={styles.title}>Swap</Text>
              <Text style={styles.subtitle}>Any wallet asset into any Hyperliquid coin</Text>
            </View>
          </View>

          <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.refreshButton}>
            <Text style={styles.refreshText}>{isLoading ? "..." : "↻"}</Text>
          </Pressable>
        </View>

        <View style={styles.swapCard}>
          <View style={styles.assetTopRow}>
            <View>
              <Text style={styles.assetTitle}>{selectedFrom ? selectedFrom.symbol : "HYPE"}</Text>
              <Text style={styles.assetMeta}>
                {selectedFrom?.midPrice ? `$${selectedFrom.midPrice}` : "Live market"}
              </Text>
            </View>

            <View style={styles.quickRow}>
              {["50%", "75%", "Max"].map((quickAmount) => (
                <View key={quickAmount} style={styles.quickChip}>
                  <Text style={styles.quickChipText}>{quickAmount}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.amountHero}>
            <Text style={styles.amountValue}>$0</Text>
            <Text style={styles.amountMeta}>0 {selectedFrom?.symbol ?? "HYPE"}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (selectedFrom && selectedTo) {
              setSelectedFromTokenId(selectedTo.tokenId);
              setSelectedToTokenId(selectedFrom.tokenId);
            }
          }}
          style={styles.swapTrigger}
        >
          <AppIcon color={COLORS.black} name="swap" size={22} />
        </Pressable>

        <View style={styles.receiveCard}>
          <View style={styles.receiveTopRow}>
            <View>
              <Text style={styles.assetTitle}>{selectedTo ? selectedTo.symbol : "USDC"}</Text>
              <Text style={styles.assetMeta}>
                {selectedTo?.midPrice ? `$${selectedTo.midPrice}` : "Choose output"}
              </Text>
            </View>

            <View style={styles.receiveRight}>
              <Text style={styles.receiveUnits}>0</Text>
              <Text style={styles.receiveDollar}>$0.00</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (selectedFrom && selectedTo) {
                setSelectedFromTokenId(selectedTo.tokenId);
                setSelectedToTokenId(selectedFrom.tokenId);
              }
            }}
            style={styles.rateBar}
          >
            <Text style={styles.rateText}>
              {selectedFrom && selectedTo?.midPrice
                ? `1 ${selectedFrom.symbol} ~= ${selectedTo.midPrice} USDC`
                : "Tap to reverse route"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void refresh()}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>
            {isLoading
              ? "Refreshing market"
              : error
                ? "Reload market data"
                : walletAssetsCount > 0
                  ? "Continue"
                  : "Fund wallet to continue"}
          </Text>
        </Pressable>

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

        <Text style={styles.footerText}>
          {error
            ? error
            : walletAssetsCount > 0
              ? `Live spot universe loaded: ${swapOptions.length} assets. The execution layer is next.`
              : "This swap screen is wired to live Hyperliquid spot metadata, but the signed order path still needs to be connected."}
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
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase",
  },
  refreshButton: {
    alignItems: "center",
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  refreshText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },
  swapCard: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    marginTop: 24,
    minHeight: 260,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  assetTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assetTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "900",
  },
  assetMeta: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    opacity: 0.72,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickChip: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    justifyContent: "center",
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  quickChipText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "900",
  },
  amountHero: {
    alignItems: "center",
    marginTop: 40,
  },
  amountValue: {
    color: COLORS.white,
    fontSize: 78,
    fontWeight: "900",
    lineHeight: 82,
  },
  amountMeta: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    opacity: 0.72,
  },
  swapTrigger: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 52,
    justifyContent: "center",
    marginTop: -3,
    width: 52,
    zIndex: 2,
  },
  receiveCard: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    marginTop: -3,
    minHeight: 178,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  receiveTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  receiveRight: {
    alignItems: "flex-end",
  },
  receiveUnits: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: "900",
  },
  receiveDollar: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    opacity: 0.72,
  },
  rateBar: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 3,
    marginTop: 22,
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  rateText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
  continueButton: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 62,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  keypad: {
    gap: 18,
    marginTop: 24,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  keypadKey: {
    color: COLORS.white,
    fontSize: 50,
    fontWeight: "300",
    minWidth: 70,
    textAlign: "center",
  },
  footerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 20,
    opacity: 0.72,
    textAlign: "center",
  },
});
