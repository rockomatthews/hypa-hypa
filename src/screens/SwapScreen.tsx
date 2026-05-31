import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { formatEther } from "viem";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "../components/AppIcon";
import { useHypeBalance } from "../hooks/useHypeBalance";
import { useHyperCoreSpot, type SwapTokenOption } from "../hooks/useHyperCoreSpot";
import { type WalletActivityType } from "../lib/activityLog";
import { describePendingCoreAction, placeHyperCoreSpotOrder } from "../lib/hyperCoreActions";
import { moveHypeToHyperCoreSpot } from "../lib/hyperEvmActions";
import { COLORS } from "../theme";

type SwapScreenProps = {
  initialToTokenId?: string | null;
  onRecordActivity?: (entry: {
    amount: string;
    detail: string;
    hash?: `0x${string}`;
    title: string;
    type: WalletActivityType;
  }) => Promise<void>;
  onRefreshWalletBalance?: () => void;
  walletAddress?: `0x${string}`;
};

const QUICK_FRACTIONS = [0.5, 0.75, 1] as const;
const HYPE_GAS_CUSHION = 0.0002;
const HYPE_BALANCE_TOLERANCE = 0.000001;

function clampToDecimals(value: number, decimals: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  const factor = 10 ** Math.max(decimals, 0);
  const floored = Math.floor(value * factor) / factor;
  return floored.toFixed(Math.max(decimals, 0)).replace(/\.?0+$/, "");
}

function formatSpotLimitPrice(value: number, szDecimals: number) {
  const maxFractionDigits = Math.max(0, 8 - szDecimals);
  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: maxFractionDigits,
    maximumSignificantDigits: 5,
    useGrouping: false,
  });

  return formatted.replace(/\.?0+$/, "");
}

function formatOutputEstimate(value: number, symbol: string) {
  if (!Number.isFinite(value) || value <= 0) {
    return `0 ${symbol}`;
  }

  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    minimumFractionDigits: value < 1 ? 4 : 0,
  })} ${symbol}`;
}

function getSpotBalance(option: SwapTokenOption | null) {
  return Number.parseFloat(option?.balance ?? "0");
}

function formatHypeAmount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    minimumFractionDigits: value < 0.01 ? 4 : 0,
  });
}

function isAmountGreaterThanBalance(amount: number, balance: number, tolerance = 0) {
  return Number.isFinite(amount) && Number.isFinite(balance) && amount > balance + tolerance;
}

function getRequiredTopUp(amount: number, balance: number) {
  if (!isAmountGreaterThanBalance(amount, balance, HYPE_BALANCE_TOLERANCE)) {
    return 0;
  }

  return amount - balance;
}

export function SwapScreen({
  initialToTokenId,
  onRecordActivity,
  onRefreshWalletBalance,
  walletAddress,
}: SwapScreenProps) {
  const insets = useSafeAreaInsets();
  const { balanceLabel, balanceWei, refresh: refreshEvmBalance } = useHypeBalance(walletAddress);
  const { balances, error, isLoading, refresh, swapOptions } = useHyperCoreSpot(walletAddress);
  const [selectedFromTokenId, setSelectedFromTokenId] = useState<string | null>(null);
  const [selectedToTokenId, setSelectedToTokenId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!swapOptions.length) {
      return;
    }

    const usdc = swapOptions.find((option) => option.symbol === "USDC") ?? swapOptions[0];
    const fromCandidate =
      swapOptions.find((option) => option.isInWallet && option.symbol !== "USDC") ??
      swapOptions.find((option) => option.symbol === "HYPE") ??
      usdc;
    const toCandidate =
      fromCandidate.symbol === "USDC"
        ? swapOptions.find((option) => option.symbol === "HYPE" && option.tokenId !== fromCandidate.tokenId) ??
          swapOptions.find((option) => option.tokenId !== fromCandidate.tokenId) ??
          fromCandidate
        : usdc;

    setSelectedFromTokenId((currentValue) => currentValue ?? fromCandidate.tokenId);
    setSelectedToTokenId((currentValue) => {
      if (
        initialToTokenId &&
        initialToTokenId !== fromCandidate.tokenId &&
        swapOptions.some((option) => option.tokenId === initialToTokenId)
      ) {
        return initialToTokenId;
      }

      if (currentValue && currentValue !== fromCandidate.tokenId) {
        return currentValue;
      }

      return toCandidate.tokenId;
    });
  }, [initialToTokenId, swapOptions]);

  const selectedFrom = useMemo(
    () => swapOptions.find((option) => option.tokenId === selectedFromTokenId) ?? null,
    [selectedFromTokenId, swapOptions],
  );
  const selectedTo = useMemo(
    () => swapOptions.find((option) => option.tokenId === selectedToTokenId) ?? null,
    [selectedToTokenId, swapOptions],
  );
  const spotHypeBalance = balances.find((balance) => balance.coin === "HYPE")?.total ?? "0";
  const spotHypeBalanceNumber = Number.parseFloat(spotHypeBalance);
  const evmHypeBalanceNumber = Number.parseFloat(formatEther(balanceWei));
  const sourceAmountNumber = Number.parseFloat(amount);
  const sourceBalanceNumber = getSpotBalance(selectedFrom);
  const requiredSpotTopUpAmount = getRequiredTopUp(sourceAmountNumber, spotHypeBalanceNumber);
  const usableEvmHypeBalanceNumber = Math.max(evmHypeBalanceNumber - HYPE_GAS_CUSHION, 0);
  const totalReadyAfterMove =
    selectedFrom?.symbol === "HYPE"
      ? spotHypeBalanceNumber + usableEvmHypeBalanceNumber
      : sourceBalanceNumber;
  const directUsdcRoute =
    selectedFrom &&
    selectedTo &&
    selectedFrom.symbol !== selectedTo.symbol &&
    (selectedFrom.symbol === "USDC" || selectedTo.symbol === "USDC");
  const canPrepHypeToSpot =
    selectedFrom?.symbol === "HYPE" &&
    evmHypeBalanceNumber > 0 &&
    requiredSpotTopUpAmount > 0 &&
    requiredSpotTopUpAmount <= usableEvmHypeBalanceNumber &&
    isAmountGreaterThanBalance(sourceAmountNumber, spotHypeBalanceNumber, HYPE_BALANCE_TOLERANCE);
  const priceNumber = Number.parseFloat(
    (selectedFrom?.symbol === "USDC" ? selectedTo?.midPrice : selectedFrom?.midPrice) ?? "0",
  );
  const estimatedOutputText = useMemo(() => {
    if (!selectedFrom || !selectedTo || !Number.isFinite(sourceAmountNumber) || sourceAmountNumber <= 0) {
      return `0 ${selectedTo?.symbol ?? "USDC"}`;
    }

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return `0 ${selectedTo.symbol}`;
    }

    if (selectedFrom.symbol === "USDC") {
      return formatOutputEstimate(sourceAmountNumber / priceNumber, selectedTo.symbol);
    }

    if (selectedTo.symbol === "USDC") {
      return formatOutputEstimate(sourceAmountNumber * priceNumber, selectedTo.symbol);
    }

    return `Route via USDC to ${selectedTo.symbol}`;
  }, [priceNumber, selectedFrom, selectedTo, sourceAmountNumber]);

  const setQuickAmount = (fraction: number) => {
    const sourceBalance =
      selectedFrom?.symbol === "HYPE"
        ? totalReadyAfterMove
        : sourceBalanceNumber;
    const decimals = selectedFrom?.symbol === "USDC" ? 4 : Math.min(selectedFrom?.szDecimals ?? 4, 6);

    setAmount(clampToDecimals(sourceBalance * fraction, decimals));
  };

  const resetStatus = () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setTxHash(null);
  };

  const waitForCoreRefresh = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 3500);
    });
    await refresh();
  };

  const handleMoveToSpot = async () => {
    resetStatus();

    if (!amount.trim()) {
      setErrorMessage("Enter how much HYPE you want to move into HyperCore spot.");
      return;
    }

    setIsSubmitting(true);

    try {
      const topUpAmount = clampToDecimals(requiredSpotTopUpAmount, 6);

      if (topUpAmount === "0") {
        setErrorMessage("Your Trading HYPE already covers this amount. Tap Swap now.");
        return;
      }

      const transaction = await moveHypeToHyperCoreSpot(topUpAmount);
      setTxHash(transaction.hash);
      setStatusMessage(
        `Moved ${topUpAmount} HYPE into Trading. Your Trading HYPE should update after the next refresh.`,
      );
      await onRecordActivity?.({
        amount: topUpAmount,
        detail: "Moved HYPE from wallet balance into Trading for swaps.",
        hash: transaction.hash,
        title: "Moved HYPE to Trading",
        type: "move_to_spot",
      });
      await Promise.all([refreshEvmBalance(), waitForCoreRefresh()]);
      onRefreshWalletBalance?.();
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to move HYPE into HyperCore spot.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwap = async () => {
    resetStatus();

    if (!selectedFrom || !selectedTo) {
      setErrorMessage("Choose both sides of the swap first.");
      return;
    }

    if (!walletAddress) {
      setErrorMessage("Create or unlock your wallet first.");
      return;
    }

    if (!amount.trim()) {
      setErrorMessage("Enter an amount to swap.");
      return;
    }

    if (!Number.isFinite(sourceAmountNumber) || sourceAmountNumber <= 0) {
      setErrorMessage("Enter a valid swap amount.");
      return;
    }

    if (!directUsdcRoute) {
      setErrorMessage(
        "This build can execute live spot swaps when one side of the route is USDC. Full two-leg token-to-token routing is the next step.",
      );
      return;
    }

    const doesNeedMoreSource =
      selectedFrom.symbol === "HYPE"
        ? isAmountGreaterThanBalance(sourceAmountNumber, sourceBalanceNumber, HYPE_BALANCE_TOLERANCE)
        : isAmountGreaterThanBalance(sourceAmountNumber, sourceBalanceNumber);

    if (doesNeedMoreSource) {
      if (
        selectedFrom.symbol === "HYPE" &&
        isAmountGreaterThanBalance(sourceAmountNumber, totalReadyAfterMove, HYPE_BALANCE_TOLERANCE)
      ) {
        setErrorMessage(
          `You can swap up to about ${formatHypeAmount(totalReadyAfterMove)} HYPE after keeping a tiny fee cushion.`,
        );
        return;
      }

      if (selectedFrom.symbol === "HYPE" && evmHypeBalanceNumber >= sourceAmountNumber) {
        setErrorMessage(
          "That HYPE is still in Wallet HYPE. Move it into Trading HYPE first, then run the swap.",
        );
        return;
      }

      setErrorMessage(`Not enough ${selectedFrom.symbol} ready to swap.`);
      return;
    }

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setErrorMessage("Live market pricing is unavailable right now. Refresh and try again.");
      return;
    }

    const pairOption = selectedFrom.symbol === "USDC" ? selectedTo : selectedFrom;

    if (!pairOption?.spotPairIndex && pairOption?.spotPairIndex !== 0) {
      setErrorMessage("This asset pair does not expose a live spot route yet.");
      return;
    }

    const isBuy = selectedFrom.symbol === "USDC";
    const limitMultiplier = isBuy ? 1.03 : 0.97;
    const limitPrice = formatSpotLimitPrice(
      priceNumber * limitMultiplier,
      pairOption.szDecimals,
    );
    const baseAmount = isBuy
      ? clampToDecimals(sourceAmountNumber / (priceNumber * limitMultiplier), pairOption.szDecimals)
      : clampToDecimals(sourceAmountNumber, pairOption.szDecimals);

    if (baseAmount === "0") {
      setErrorMessage(
        `This amount is too small for ${pairOption.symbol}'s lot size on Hyperliquid spot.`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await placeHyperCoreSpotOrder({
        amount: baseAmount,
        asset: 10000 + pairOption.spotPairIndex,
        isBuy,
        limitPrice,
      });

      setTxHash(result.hash);
      setStatusMessage(describePendingCoreAction(result.hash));
      await onRecordActivity?.({
        amount: baseAmount,
        detail: result.summary,
        hash: result.hash,
        title: `${isBuy ? "Bought" : "Sold"} ${pairOption.symbol}`,
        type: "swap_order",
      });
      await waitForCoreRefresh();
      setAmount("");
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Failed to submit swap.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryActionLabel = canPrepHypeToSpot
    ? isSubmitting
      ? "Moving HYPE..."
      : `Move ${formatHypeAmount(requiredSpotTopUpAmount)} HYPE to Trading`
    : isSubmitting
      ? "Submitting swap..."
      : "Swap now";
  const hypeswapHelpText = (() => {
    if (selectedFrom?.symbol !== "HYPE") {
      return null;
    }

    if (!Number.isFinite(sourceAmountNumber) || sourceAmountNumber <= 0) {
      return `You can swap ${formatHypeAmount(spotHypeBalanceNumber)} HYPE now. You can move up to ${formatHypeAmount(usableEvmHypeBalanceNumber)} more HYPE into Trading.`;
    }

    if (!isAmountGreaterThanBalance(sourceAmountNumber, spotHypeBalanceNumber, HYPE_BALANCE_TOLERANCE)) {
      return `${formatHypeAmount(sourceAmountNumber)} HYPE is ready to swap. Tap Swap now.`;
    }

    if (requiredSpotTopUpAmount <= usableEvmHypeBalanceNumber) {
      return `Move ${formatHypeAmount(requiredSpotTopUpAmount)} HYPE to Trading, then tap Swap now.`;
    }

    return `You can swap up to about ${formatHypeAmount(totalReadyAfterMove)} HYPE after keeping a tiny fee cushion.`;
  })();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <AppIcon color={COLORS.black} name="swap" size={24} />
            </View>
            <View>
              <Text style={styles.title}>Swap</Text>
              <Text style={styles.subtitle}>Live spot swap</Text>
            </View>
          </View>

          <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.refreshButton}>
            <Text style={styles.refreshText}>{isLoading ? "..." : "↻"}</Text>
          </Pressable>
        </View>

        <View style={styles.swapCard}>
          <View style={styles.assetTopRow}>
            <View>
              <Text style={styles.assetTitle}>{selectedFrom?.symbol ?? "FROM"}</Text>
              <Text style={styles.assetMeta}>
                {selectedFrom?.symbol === "HYPE"
                  ? `Wallet ${balanceLabel} / Ready ${selectedFrom.balanceLabel}`
                  : `${selectedFrom?.balanceLabel ?? "0"} ready to swap`}
              </Text>
            </View>

            <View style={styles.quickRow}>
              {QUICK_FRACTIONS.map((fraction, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={`${fraction}`}
                  onPress={() => setQuickAmount(fraction)}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipText}>
                    {index === QUICK_FRACTIONS.length - 1 ? "Max" : `${fraction * 100}%`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(255, 255, 255, 0.65)"
            style={styles.amountInput}
            value={amount}
          />
          <Text style={styles.amountMeta}>
            {selectedFrom?.symbol === "USDC"
              ? "Spend USDC that is ready to swap."
              : `Swap ${selectedFrom?.symbol ?? "token"} into USDC using an IOC order.`}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (selectedFrom && selectedTo) {
              setSelectedFromTokenId(selectedTo.tokenId);
              setSelectedToTokenId(selectedFrom.tokenId);
              setAmount("");
              resetStatus();
            }
          }}
          style={styles.swapTrigger}
        >
          <AppIcon color={COLORS.black} name="swap" size={22} />
        </Pressable>

        <View style={styles.receiveCard}>
          <View style={styles.receiveTopRow}>
            <View>
              <Text style={styles.assetTitle}>{selectedTo?.symbol ?? "TO"}</Text>
              <Text style={styles.assetMeta}>
                {selectedTo?.midPrice ? `Mid $${selectedTo.midPrice}` : "USDC anchor route"}
              </Text>
            </View>

            <View style={styles.receiveRight}>
              <Text style={styles.receiveUnits}>{estimatedOutputText}</Text>
              <Text style={styles.receiveDollar}>
                {selectedFrom?.symbol === "USDC" && Number.isFinite(sourceAmountNumber)
                  ? `$${sourceAmountNumber.toFixed(2)} input`
                  : "IOC execution"}
              </Text>
            </View>
          </View>

          <View style={styles.rateBar}>
            <Text style={styles.rateText}>
              {selectedFrom?.symbol === "USDC" || selectedTo?.symbol === "USDC"
                ? "Live route uses the Hyperliquid spot market."
                : "Multi-leg token to token routing will pass through USDC next."}
            </Text>
          </View>
        </View>

        {selectedFrom?.symbol === "HYPE" && spotHypeBalanceNumber < evmHypeBalanceNumber ? (
          <View style={styles.prepCard}>
            <Text style={styles.prepTitle}>HYPE needed for this swap</Text>
            <Text style={styles.prepBody}>
              Wallet HYPE: {balanceLabel}. Trading HYPE: {selectedFrom.balanceLabel}.
            </Text>
            <Text style={styles.prepBody}>
              {hypeswapHelpText}
            </Text>
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {statusMessage ? <Text style={styles.successText}>{statusMessage}</Text> : null}
        {txHash ? <Text style={styles.hashText}>Latest tx: {txHash}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => void (canPrepHypeToSpot ? handleMoveToSpot() : handleSwap())}
          style={[styles.continueButton, isSubmitting ? styles.buttonDisabled : null]}
        >
          <Text style={styles.continueButtonText}>{primaryActionLabel}</Text>
        </Pressable>

        <Text style={styles.footerText}>
          {error
            ? error
            : directUsdcRoute
              ? "For HYPE swaps, only Trading HYPE can be sold. Move Wallet HYPE into Trading first when needed."
              : "Choose a route that touches USDC to use the live swap path in this build."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.black,
    flex: 1,
  },
  content: {
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
    minHeight: 250,
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
    opacity: 0.78,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickChip: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    justifyContent: "center",
    minWidth: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  quickChipText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "900",
  },
  amountInput: {
    color: COLORS.white,
    fontSize: 66,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 72,
    marginTop: 28,
    paddingVertical: 0,
  },
  amountMeta: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    opacity: 0.76,
  },
  swapTrigger: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 52,
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: -5,
    width: 52,
    zIndex: 2,
  },
  receiveCard: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    marginTop: -5,
    minHeight: 190,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  receiveTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  receiveRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  receiveUnits: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "right",
  },
  receiveDollar: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "800",
    opacity: 0.72,
  },
  rateBar: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 3,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rateText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  prepCard: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    gap: 8,
    marginTop: 18,
    padding: 16,
  },
  prepTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  prepBody: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  errorText: {
    color: COLORS.yellow,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 18,
  },
  successText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 18,
  },
  hashText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 10,
  },
  continueButton: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 62,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  footerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 18,
    opacity: 0.72,
  },
});
