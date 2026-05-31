import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandHeader } from "../components/BrandHeader";
import { ComicCard } from "../components/ComicCard";
import { useHyperCoreSpot } from "../hooks/useHyperCoreSpot";
import { useHyperCoreStaking } from "../hooks/useHyperCoreStaking";
import { type WalletActivityType } from "../lib/activityLog";
import { formatCompactAmount, formatUtcDate } from "../lib/hyperCore";
import {
  depositSpotHypeToStaking,
  describePendingCoreAction,
  tokenDelegate,
  withdrawStakingToSpotQueue,
} from "../lib/hyperCoreActions";
import { getHypurrscanTxUrl } from "../lib/hyperEvm";
import { rememberValidator, useValidatorBook } from "../lib/validatorBook";
import { COLORS } from "../theme";

type StakeScreenProps = {
  onRecordActivity?: (entry: {
    amount: string;
    detail: string;
    hash?: `0x${string}`;
    title: string;
    type: WalletActivityType;
  }) => Promise<void>;
  walletAddress?: `0x${string}`;
};

function formatHash(hash?: `0x${string}` | null) {
  if (!hash) {
    return null;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function StakeScreen({ onRecordActivity, walletAddress }: StakeScreenProps) {
  const insets = useSafeAreaInsets();
  const { balances, refresh: refreshSpot } = useHyperCoreSpot(walletAddress);
  const {
    delegations,
    error,
    history,
    isLoading,
    refresh,
    rewards,
    summary,
    userFees,
  } = useHyperCoreStaking(walletAddress);
  const { refresh: refreshValidatorBook, savedValidators } = useValidatorBook();
  const [depositAmount, setDepositAmount] = useState("");
  const [delegateAmount, setDelegateAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [validatorAddress, setValidatorAddress] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hypeSpotBalance = balances.find((balance) => balance.coin === "HYPE")?.total ?? "0";
  const undelegatedBalance = summary?.undelegated ?? "0";
  const recentRewards = rewards.slice(0, 2);
  const recentHistory = history.slice(0, 2);
  const validatorSuggestions = useMemo(() => {
    const values = new Set<string>();

    savedValidators.forEach((entry) => values.add(entry.address));
    delegations.forEach((delegation) => values.add(delegation.validator));
    rewards.forEach((reward) => values.add(reward.delta.rewards.validator));

    return Array.from(values).slice(0, 4);
  }, [delegations, rewards, savedValidators]);

  useEffect(() => {
    if (validatorAddress || !validatorSuggestions.length) {
      return;
    }

    setValidatorAddress(validatorSuggestions[0]);
  }, [validatorAddress, validatorSuggestions]);

  const clearMessages = () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setTxHash(null);
  };

  const refreshAll = async () => {
    await Promise.all([refreshSpot(), refresh()]);
  };

  const handleDeposit = async () => {
    clearMessages();

    if (!depositAmount.trim()) {
      setErrorMessage("Enter how much spot HYPE to move into staking.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await depositSpotHypeToStaking({ amount: depositAmount });
      setTxHash(result.hash);
      setStatusMessage(
        `${result.summary} ${describePendingCoreAction(result.hash)} ${getHypurrscanTxUrl(result.hash)}`,
      );
      await onRecordActivity?.({
        amount: depositAmount.trim(),
        detail: result.summary,
        hash: result.hash,
        title: "Moved HYPE into staking",
        type: "stake_deposit",
      });
      setDepositAmount("");
      await refreshAll();
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Failed to move HYPE into staking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelegate = async (isUndelegate: boolean) => {
    clearMessages();

    if (!delegateAmount.trim()) {
      setErrorMessage(`Enter how much HYPE you want to ${isUndelegate ? "undelegate" : "delegate"}.`);
      return;
    }

    if (!validatorAddress.trim()) {
      setErrorMessage("Enter a validator address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await tokenDelegate({
        amount: delegateAmount,
        isUndelegate,
        validator: validatorAddress.trim() as `0x${string}`,
      });
      await rememberValidator(validatorAddress.trim() as `0x${string}`);
      await refreshValidatorBook();
      setTxHash(result.hash);
      setStatusMessage(
        `${result.summary} ${describePendingCoreAction(result.hash)} ${getHypurrscanTxUrl(result.hash)}`,
      );
      await onRecordActivity?.({
        amount: delegateAmount.trim(),
        detail: result.summary,
        hash: result.hash,
        title: isUndelegate ? "Undelegated stake" : "Delegated stake",
        type: isUndelegate ? "undelegate" : "delegate",
      });
      setDelegateAmount("");
      await refreshAll();
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error
          ? caughtError.message
          : `Failed to ${isUndelegate ? "undelegate" : "delegate"} stake.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    clearMessages();

    if (!withdrawAmount.trim()) {
      setErrorMessage("Enter how much undelegated HYPE to queue back to spot.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await withdrawStakingToSpotQueue({ amount: withdrawAmount });
      setTxHash(result.hash);
      setStatusMessage(
        `${result.summary} ${describePendingCoreAction(result.hash)} ${getHypurrscanTxUrl(result.hash)}`,
      );
      await onRecordActivity?.({
        amount: withdrawAmount.trim(),
        detail: result.summary,
        hash: result.hash,
        title: "Queued withdrawal",
        type: "withdraw_queue",
      });
      setWithdrawAmount("");
      await refreshAll();
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Failed to queue staking withdrawal.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 10), paddingBottom: 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader />

        <Text style={styles.pageTitle}>Stake</Text>
        <Text style={styles.pageMeta}>
          HyperCore staking with real deposit, delegate, undelegate, and withdrawal queue actions.
        </Text>

        <View style={styles.summaryRow}>
          <ComicCard accent="yellow" style={styles.summaryCard}>
            <Text style={styles.sectionLabel}>Spot HYPE</Text>
            <Text style={styles.bigText}>{formatCompactAmount(hypeSpotBalance)}</Text>
            <Text style={styles.body}>HyperCore spot balance available to move into staking.</Text>
          </ComicCard>

          <ComicCard accent="blue" style={styles.summaryCard}>
            <Text style={styles.sectionLabelBlue}>Delegated now</Text>
            <Text style={styles.bigTextBlue}>
              {summary ? formatCompactAmount(summary.delegated) : isLoading ? "Loading..." : "0"}
            </Text>
            <Text style={styles.bodyBlue}>Live delegations across validators.</Text>
          </ComicCard>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBlue}>
            <Text style={styles.metricLabelBlue}>Undelegated staking</Text>
            <Text style={styles.metricValueBlue}>{formatCompactAmount(undelegatedBalance)}</Text>
          </View>
          <View style={styles.metricYellow}>
            <Text style={styles.metricLabelYellow}>Back to spot</Text>
            <Text style={styles.metricValueYellow}>7 day queue</Text>
          </View>
          <View style={styles.metricBlue}>
            <Text style={styles.metricLabelBlue}>Pending withdrawals</Text>
            <Text style={styles.metricValueBlue}>
              {summary ? `${summary.nPendingWithdrawals} / 5` : "0 / 5"}
            </Text>
          </View>
          <View style={styles.metricYellow}>
            <Text style={styles.metricLabelYellow}>Rewards</Text>
            <Text style={styles.metricValueYellow}>Minutely, paid daily</Text>
          </View>
        </View>

        <ComicCard accent="yellow">
          <Text style={styles.sectionLabel}>Take action</Text>
          <Text style={styles.bigText}>Move HYPE through the full staking lifecycle.</Text>
          <Text style={styles.body}>
            Step 1 moves spot HYPE into your staking account. Step 2 delegates or undelegates against a validator.
            Step 3 queues undelegated HYPE back to spot, which completes after the seven day withdrawal timer.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>1. Spot to staking</Text>
            <View style={styles.inlineInputRow}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setDepositAmount}
                placeholder="0.00 HYPE"
                placeholderTextColor="rgba(5,5,5,0.55)"
                style={styles.input}
                value={depositAmount}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setDepositAmount(hypeSpotBalance)}
                style={styles.sideButton}
              >
                <Text style={styles.sideButtonText}>Max</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void handleDeposit()}
              style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Submitting..." : "Move into staking"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>2. Delegate or undelegate</Text>
            {savedValidators.length ? (
              <Text style={styles.helperLine}>
                Saved validators are shown first so you can quickly return to addresses you already used.
              </Text>
            ) : null}
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setValidatorAddress}
              placeholder="Validator address"
              placeholderTextColor="rgba(5,5,5,0.55)"
              style={styles.input}
              value={validatorAddress}
            />
            {validatorSuggestions.length ? (
              <View style={styles.validatorRow}>
                {validatorSuggestions.map((validator) => (
                  <Pressable
                    accessibilityRole="button"
                    key={validator}
                    onPress={() => setValidatorAddress(validator)}
                    style={styles.validatorChip}
                  >
                    <Text style={styles.validatorChipText}>
                      {validator.slice(0, 6)}...{validator.slice(-4)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <View style={styles.inlineInputRow}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setDelegateAmount}
                placeholder="0.00 HYPE"
                placeholderTextColor="rgba(5,5,5,0.55)"
                style={styles.input}
                value={delegateAmount}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setDelegateAmount(undelegatedBalance)}
                style={styles.sideButton}
              >
                <Text style={styles.sideButtonText}>Avail</Text>
              </Pressable>
            </View>
            <View style={styles.doubleButtonRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => void handleDelegate(false)}
                style={[styles.primaryButtonBlue, isSubmitting ? styles.buttonDisabled : null]}
              >
                <Text style={styles.primaryButtonBlueText}>Delegate</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => void handleDelegate(true)}
                style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
              >
                <Text style={styles.primaryButtonText}>Undelegate</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>3. Queue staking withdrawal to spot</Text>
            <View style={styles.inlineInputRow}>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setWithdrawAmount}
                placeholder="0.00 HYPE"
                placeholderTextColor="rgba(5,5,5,0.55)"
                style={styles.input}
                value={withdrawAmount}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setWithdrawAmount(undelegatedBalance)}
                style={styles.sideButton}
              >
                <Text style={styles.sideButtonText}>Max</Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void handleWithdraw()}
              style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
            >
              <Text style={styles.primaryButtonText}>Queue back to spot</Text>
            </Pressable>
          </View>
        </ComicCard>

        {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}
        {statusMessage ? <Text style={styles.successBanner}>{statusMessage}</Text> : null}
        {txHash ? <Text style={styles.hashText}>Latest tx: {formatHash(txHash)}</Text> : null}

        <ComicCard accent="blue">
          <Text style={styles.sectionLabelBlue}>Mechanics</Text>
          <Text style={styles.bodyBlue}>
            Spot to staking transfers are instant. Validator delegations then lock for one day. After
            undelegating, funds become immediately undelegated inside staking, but moving back to spot
            starts a separate seven day unstaking queue.
          </Text>
          <Text style={styles.bodyBlue}>
            CoreWriter actions execute after the HyperEVM block. If this wallet is brand new, it needs to
            exist on HyperCore before the write action is processed.
          </Text>
        </ComicCard>

        <View style={styles.timelineGrid}>
          <ComicCard accent="yellow" style={styles.timelineCard}>
            <Text style={styles.sectionLabel}>Consensus epochs</Text>
            <Text style={styles.body}>
              Staking epochs are 100k rounds, roughly 90 minutes on mainnet. Minimum stake during an epoch matters for reward accounting.
            </Text>
          </ComicCard>
          <ComicCard accent="blue" style={styles.timelineCard}>
            <Text style={styles.sectionLabelBlue}>Validator risk</Text>
            <Text style={styles.bodyBlue}>
              Jailed validators stop producing rewards for delegators. Jailing is separate from slashing, which is reserved for provably malicious behavior.
            </Text>
          </ComicCard>
        </View>

        <ComicCard accent="blue">
          <Text style={styles.sectionLabelBlue}>Live staking account</Text>
          <Text style={styles.bodyBlue}>
            {error
              ? error
              : summary
                ? `Undelegated: ${formatCompactAmount(summary.undelegated)} HYPE. Pending withdrawal queue: ${formatCompactAmount(summary.totalPendingWithdrawal)} HYPE.`
                : "No live staking summary returned yet for this address."}
          </Text>
          <Text style={styles.bodyBlue}>
            {userFees?.activeStakingDiscount
              ? `Active staking discount: ${typeof userFees.activeStakingDiscount === "string" ? userFees.activeStakingDiscount : userFees.activeStakingDiscount.discount}.`
              : "No active staking discount is currently shown for this wallet."}
          </Text>
        </ComicCard>

        {delegations.length ? (
          <ComicCard accent="yellow">
            <Text style={styles.sectionLabel}>Delegations</Text>
            {delegations.slice(0, 4).map((delegation) => (
              <View key={`${delegation.validator}-${delegation.lockedUntilTimestamp}`} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>
                    {formatCompactAmount(delegation.amount)} HYPE
                  </Text>
                  <Text style={styles.listBody}>{delegation.validator}</Text>
                </View>
                <Text style={styles.listMeta}>
                  Locked until{"\n"}
                  {formatUtcDate(delegation.lockedUntilTimestamp)}
                </Text>
              </View>
            ))}
          </ComicCard>
        ) : null}

        {recentRewards.length ? (
          <ComicCard accent="blue">
            <Text style={styles.sectionLabelBlue}>Recent rewards</Text>
            {recentRewards.map((reward) => (
              <View key={reward.hash} style={styles.listRowBlue}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitleBlue}>
                    +{formatCompactAmount(reward.delta.rewards.amount)} HYPE
                  </Text>
                  <Text style={styles.listBodyBlue}>{reward.delta.rewards.validator}</Text>
                </View>
                <Text style={styles.listMetaBlue}>{formatUtcDate(reward.time)}</Text>
              </View>
            ))}
          </ComicCard>
        ) : null}

        {recentHistory.length ? (
          <ComicCard accent="yellow">
            <Text style={styles.sectionLabel}>Recent actions</Text>
            {recentHistory.map((entry) => {
              const delegate = entry.delta.delegate;
              const actionLabel = delegate
                ? delegate.isUndelegate
                  ? "Undelegate"
                  : "Delegate"
                : entry.delta.unstake
                  ? "Withdraw queue"
                  : "Queue update";

              return (
                <View key={entry.hash} style={styles.listRow}>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{actionLabel}</Text>
                    <Text style={styles.listBody}>
                      {delegate
                        ? `${formatCompactAmount(delegate.amount)} HYPE -> ${delegate.validator}`
                        : entry.delta.unstake
                          ? `${formatCompactAmount(entry.delta.unstake.amount)} HYPE`
                          : entry.hash}
                    </Text>
                  </View>
                  <Text style={styles.listMeta}>{formatUtcDate(entry.time)}</Text>
                </View>
              );
            })}
          </ComicCard>
        ) : null}

        <Text onPress={() => void refreshAll()} style={styles.refreshLink}>
          {isLoading ? "Refreshing live staking data..." : "Refresh staking data"}
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
    gap: 12,
    paddingHorizontal: 18,
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
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minHeight: 140,
  },
  metricsGrid: {
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
    lineHeight: 20,
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
    lineHeight: 20,
    marginTop: 6,
  },
  sectionLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sectionLabelBlue: {
    color: COLORS.white,
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
  bigTextBlue: {
    color: COLORS.white,
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
  bodyBlue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
  },
  formGroup: {
    gap: 10,
    marginTop: 18,
  },
  inputLabel: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  helperLine: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: -2,
  },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
    borderWidth: 3,
    color: COLORS.black,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    minHeight: 54,
    paddingHorizontal: 12,
  },
  inlineInputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  sideButton: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 54,
    minWidth: 72,
    paddingHorizontal: 10,
  },
  sideButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  primaryButtonBlue: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 3,
    flex: 1,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 12,
  },
  primaryButtonBlueText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  doubleButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  validatorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  validatorChip: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  validatorChipText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
  errorBanner: {
    color: COLORS.yellow,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  successBanner: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  hashText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  timelineGrid: {
    gap: 10,
  },
  timelineCard: {
    minHeight: 120,
  },
  listRow: {
    borderTopColor: COLORS.black,
    borderTopWidth: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
  },
  listRowBlue: {
    borderTopColor: COLORS.white,
    borderTopWidth: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
  },
  listCopy: {
    flex: 1,
    paddingRight: 12,
  },
  listTitle: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "900",
  },
  listTitleBlue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
  },
  listBody: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  listBodyBlue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  listMeta: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
  },
  listMetaBlue: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
  },
  refreshLink: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "900",
    paddingVertical: 8,
    textTransform: "uppercase",
  },
});
