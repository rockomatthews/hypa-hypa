import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BrandHeader } from "../components/BrandHeader";
import { ComicCard } from "../components/ComicCard";
import { useHyperCoreSpot } from "../hooks/useHyperCoreSpot";
import { useHyperCoreStaking } from "../hooks/useHyperCoreStaking";
import { formatCompactAmount, formatUtcDate } from "../lib/hyperCore";
import { COLORS } from "../theme";

type StakeScreenProps = {
  walletAddress?: `0x${string}`;
};

export function StakeScreen({ walletAddress }: StakeScreenProps) {
  const {
    balances,
  } = useHyperCoreSpot(walletAddress);
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

  const hypeSpotBalance =
    balances.find((balance) => balance.coin === "HYPE")?.total ?? "0";
  const recentRewards = rewards.slice(0, 2);
  const recentHistory = history.slice(0, 2);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BrandHeader />

        <Text style={styles.pageTitle}>Stake</Text>
        <Text style={styles.pageMeta}>
          HyperCore staking with lockups, queue timing, validator risk, and auto-compounding rewards.
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
            <Text style={styles.metricLabelBlue}>Lock per validator</Text>
            <Text style={styles.metricValueBlue}>1 day</Text>
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
          <Text style={styles.sectionLabel}>Mechanics</Text>
          <Text style={styles.bigText}>Hyperliquid staking is more layered than a simple lock-and-wait flow.</Text>
          <Text style={styles.body}>
            Spot to staking transfers are instant. Validator delegations then lock for one day. After
            undelegating, funds become immediately undelegated inside staking, but moving back to spot
            starts a separate seven day unstaking queue.
          </Text>
        </ComicCard>

        <View style={styles.timelineGrid}>
          <ComicCard accent="blue" style={styles.timelineCard}>
            <Text style={styles.sectionLabelBlue}>Rewards cadence</Text>
            <Text style={styles.bodyBlue}>
              Rewards accrue every minute, distribute daily, and are automatically redelegated to the same validator.
            </Text>
          </ComicCard>
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
          <ComicCard accent="yellow" style={styles.timelineCard}>
            <Text style={styles.sectionLabel}>Commission guardrail</Text>
            <Text style={styles.body}>
              Validator commission cannot be increased unless the new commission is less than or equal to one percent.
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
              ? `Active staking discount: ${userFees.activeStakingDiscount}.`
              : "No active staking discount is currently shown for this wallet."}
          </Text>
          {userFees?.stakingLink ? (
            <Text style={styles.bodyBlue}>Staking tier link: {userFees.stakingLink}</Text>
          ) : null}
        </ComicCard>

        {delegations.length ? (
          <ComicCard accent="yellow">
            <Text style={styles.sectionLabel}>Delegations</Text>
            {delegations.slice(0, 3).map((delegation) => (
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
                : "Queue update";

              return (
                <View key={entry.hash} style={styles.listRow}>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{actionLabel}</Text>
                    <Text style={styles.listBody}>
                      {delegate
                        ? `${formatCompactAmount(delegate.amount)} HYPE -> ${delegate.validator}`
                        : entry.hash}
                    </Text>
                  </View>
                  <Text style={styles.listMeta}>{formatUtcDate(entry.time)}</Text>
                </View>
              );
            })}
          </ComicCard>
        ) : null}

        <Text onPress={() => void refresh()} style={styles.refreshLink}>
          {isLoading ? "Refreshing live staking data..." : "Refresh staking data"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
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
  timelineGrid: {
    gap: 10,
  },
  timelineCard: {
    minHeight: 120,
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
    fontSize: 15,
    fontWeight: "900",
  },
  listBody: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 4,
  },
  listMeta: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
    textAlign: "right",
  },
  listTitleBlue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },
  listBodyBlue: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 4,
  },
  listMetaBlue: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
    textAlign: "right",
  },
  refreshLink: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "900",
    paddingBottom: 8,
    paddingTop: 4,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
