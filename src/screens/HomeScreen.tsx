import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { CoinMark } from "../components/CoinMark";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { SquareIconButton } from "../components/SquareIconButton";
import { useHyperCoreSpot } from "../hooks/useHyperCoreSpot";
import { type WalletActivityItem, formatActivityDate } from "../lib/activityLog";
import { COLORS } from "../theme";

type HomeScreenProps = {
  balanceError: string | null;
  evmHypeAmount: string;
  hypeBalance: string;
  isBalanceLoading: boolean;
  onCopyAddress: () => Promise<void>;
  onOpenDeposit: () => void;
  onOpenDrawer: () => void;
  onOpenCoinDetails: (tokenId: string) => void;
  onOpenProfile: () => void;
  onOpenReceive: () => void;
  onRefreshActivity?: () => Promise<void>;
  onRefreshBalances: () => Promise<void>;
  onOpenSearch: () => void;
  onOpenSend: () => void;
  onOpenSwap: (tokenId?: string | null) => void;
  profilePhotoUri?: string | null;
  username?: string;
  walletAddress?: `0x${string}`;
  walletActivity?: WalletActivityItem[];
  walletActivityError?: string | null;
  walletError: string | null;
};

const actionItems = [
  { icon: "deposit", key: "deposit", label: "Deposit" },
  { icon: "receive", key: "receive", label: "Receive" },
  { icon: "send", key: "send", label: "Send" },
  { icon: "swap", key: "swap", label: "Swap" },
] as const;

type ActionKey = (typeof actionItems)[number]["key"];

function formatUsd(value: number) {
  return value.toLocaleString(undefined, {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  });
}

function isPositiveAmount(amount: string) {
  return amount.trim().startsWith("+");
}

function isNegativeAmount(amount: string) {
  return amount.trim().startsWith("-");
}

export function HomeScreen({
  balanceError,
  evmHypeAmount,
  hypeBalance,
  isBalanceLoading,
  onCopyAddress,
  onOpenDeposit,
  onOpenDrawer,
  onOpenCoinDetails,
  onOpenProfile,
  onOpenReceive,
  onRefreshActivity,
  onRefreshBalances,
  onOpenSearch,
  onOpenSend,
  onOpenSwap,
  profilePhotoUri,
  username,
  walletAddress,
  walletActivity,
  walletActivityError,
  walletError,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeSegment, setActiveSegment] = useState<"coins" | "activity">("coins");
  const {
    error: spotError,
    isLoading: isSpotLoading,
    refresh: refreshSpot,
    swapOptions,
  } = useHyperCoreSpot(walletAddress);

  const isRefreshing = isBalanceLoading || isSpotLoading;
  const handleRefresh = async () => {
    await Promise.all([
      onRefreshBalances(),
      refreshSpot({ force: true }),
      onRefreshActivity?.() ?? Promise.resolve(),
    ]);
  };

  const handleActionPress = (action: ActionKey) => {
    switch (action) {
      case "deposit":
        onOpenDeposit();
        break;
      case "receive":
        onOpenReceive();
        break;
      case "send":
        onOpenSend();
        break;
      case "swap":
        onOpenSwap();
        break;
      default:
        break;
    }
  };

  const hypeSpotOption = swapOptions.find((option) => option.symbol === "HYPE") ?? null;
  const hypeMidPrice = Number.parseFloat(hypeSpotOption?.midPrice ?? "0") || 0;
  const evmHypeValueUsd = Number.parseFloat(evmHypeAmount || "0") * hypeMidPrice;
  const spotPortfolioValueUsd = swapOptions
    .filter((option) => option.isInWallet)
    .reduce((total, option) => {
      const amount = Number.parseFloat(option.balance);
      const price =
        option.symbol === "USDC"
          ? 1
          : Number.parseFloat(option.midPrice ?? "0");

      if (!Number.isFinite(amount) || !Number.isFinite(price) || price <= 0) {
        return total;
      }

      return total + amount * price;
    }, 0);
  const portfolioValueUsd = evmHypeValueUsd + spotPortfolioValueUsd;

  const coinRows = [
    {
      context: "Sendable wallet balance",
      initials: "WH",
      priceLabel: hypeSpotOption?.priceChangeLabel ?? "24H",
      symbol: "HYPE",
      title: "Wallet HYPE",
      tokenId: hypeSpotOption?.tokenId ?? "HYPE",
      value: isBalanceLoading ? "Loading..." : `${hypeBalance} HYPE`,
    },
    ...swapOptions
      .filter((option) => option.isInWallet)
      .map((option) => ({
        context:
          option.symbol === "HYPE"
            ? "Ready to swap"
            : option.marketCapLabel ?? option.displayName,
        initials: option.symbol === "HYPE" ? "TH" : option.initials,
        priceLabel: option.priceChangeLabel ?? "24H",
        symbol: option.symbol,
        title: option.symbol === "HYPE" ? "Trading HYPE" : option.symbol,
        tokenId: option.tokenId,
        value: `${option.balanceLabel} ${option.symbol}`,
      })),
  ];

  const statusText = walletError ?? balanceError ?? spotError ?? null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 28 },
        ]}
        refreshControl={
          <RefreshControl
            colors={[COLORS.blue]}
            onRefresh={() => {
              void handleRefresh();
            }}
            progressBackgroundColor={COLORS.yellow}
            refreshing={isRefreshing}
            tintColor={COLORS.yellow}
            title="Refreshing HYPA HYPA"
            titleColor={COLORS.yellow}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <SquareIconButton
              accessibilityLabel="Open menu"
              backgroundColor={COLORS.blue}
              borderColor={COLORS.yellow}
              iconColor={COLORS.white}
              iconName="menu"
              iconSize={24}
              onPress={onOpenDrawer}
              style={styles.headerAction}
            />

            <View>
              <Text style={styles.headerTitle}>Home</Text>
              <Text style={styles.headerSubtitle}>{username ? `@${username}` : "Set username"}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <SquareIconButton
              accessibilityLabel="Open search"
              backgroundColor={COLORS.black}
              borderColor={COLORS.blue}
              iconColor={COLORS.white}
              iconName="search"
              iconSize={22}
              onPress={onOpenSearch}
              style={styles.headerAction}
            />
            <ProfileAvatar onPress={onOpenProfile} size={52} uri={profilePhotoUri} />
          </View>
        </View>

        <View style={styles.hero}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.balanceValue}>
            {isBalanceLoading ? "Loading..." : formatUsd(portfolioValueUsd)}
          </Text>
          <Text style={styles.balanceSubcopy}>Total portfolio balance across all listed coins</Text>
          <View style={styles.addressWrap}>
            <Text style={styles.addressLabel}>Wallet address</Text>
            <AddressWithCopy
              address={walletAddress}
              color="white"
              onCopyAddress={onCopyAddress}
              size="md"
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          {actionItems.map((item) => (
            <SquareIconButton
              accessibilityLabel={item.label}
              backgroundColor={COLORS.blue}
              borderColor={COLORS.yellow}
              iconColor={COLORS.white}
              iconName={item.icon}
              iconSize={30}
              key={item.key}
              onPress={() => handleActionPress(item.key)}
              style={styles.actionTile}
            />
          ))}
        </View>

        <Text style={styles.portfolioMeta}>
          {statusText
            ? statusText
            : `${coinRows.length} coins are included in this total. Tap any coin to research it first.`}
        </Text>

        <View style={styles.segmentRow}>
          <Pressable accessibilityRole="button" onPress={() => setActiveSegment("coins")}>
            <Text style={activeSegment === "coins" ? styles.segmentActive : styles.segmentText}>Coins</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setActiveSegment("activity")}>
            <Text style={activeSegment === "activity" ? styles.segmentActive : styles.segmentText}>Activity</Text>
          </Pressable>
        </View>

        {activeSegment === "coins" ? (
          <View style={styles.assetList}>
            {coinRows.map((row, index) => (
              <Pressable
                accessibilityRole="button"
                key={`${row.symbol}-${index}`}
                onPress={() => onOpenCoinDetails(row.tokenId)}
                style={styles.assetRow}
              >
                <CoinMark
                  initials={row.initials}
                  size={50}
                  symbol={row.title === "Wallet HYPE" || row.title === "Trading HYPE" ? row.title : row.symbol}
                />

                <View style={styles.assetCopy}>
                  <Text style={styles.assetTitle}>{row.title}</Text>
                  <Text style={styles.assetSubtitle}>{row.context}</Text>
                </View>

                <View style={styles.assetMeta}>
                  <Text numberOfLines={1} style={styles.assetValue}>
                    {row.value}
                  </Text>
                  <Text style={styles.assetPriceLabel}>{row.priceLabel}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.assetList}>
            {walletActivityError ? <Text style={styles.activityError}>{walletActivityError}</Text> : null}
            {walletActivity?.length ? (
              walletActivity.map((item) => (
                <View key={item.id} style={styles.activityRow}>
                  <View style={styles.activityMark}>
                    <Text style={styles.activityMarkText}>
                      {item.type === "receive_hype" ? "+" : item.type === "send_hype" ? "-" : "↔"}
                    </Text>
                  </View>

                  <View style={styles.assetCopy}>
                    <Text style={styles.assetTitle}>{item.title}</Text>
                    <Text style={styles.assetSubtitle}>{item.detail}</Text>
                    <Text style={styles.activityDate}>{formatActivityDate(item.createdAt)}</Text>
                  </View>

                  <Text
                    style={[
                      styles.activityAmount,
                      isPositiveAmount(item.amount) ? styles.activityAmountPositive : null,
                      isNegativeAmount(item.amount) ? styles.activityAmountNegative : null,
                    ]}
                  >
                    {item.amount}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyActivity}>
                No wallet activity yet. Deposits, sends, swaps, and moves to Trading will appear here.
              </Text>
            )}
          </View>
        )}
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
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  headerAction: {
    height: 52,
    width: 52,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase",
  },
  hero: {
    marginTop: 28,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: -3,
    lineHeight: 76,
  },
  balanceSubcopy: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    opacity: 0.68,
  },
  addressWrap: {
    gap: 6,
    marginTop: 14,
  },
  addressLabel: {
    color: COLORS.yellow,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 26,
  },
  actionTile: {
    flex: 1,
  },
  portfolioMeta: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 18,
    opacity: 0.72,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 28,
    marginTop: 24,
  },
  segmentActive: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
  segmentText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    opacity: 0.5,
  },
  assetList: {
    marginTop: 12,
  },
  assetRow: {
    alignItems: "center",
    borderBottomColor: COLORS.yellow,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: 12,
    minHeight: 82,
    paddingVertical: 12,
  },
  assetCopy: {
    flex: 1,
  },
  assetTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
  assetSubtitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    opacity: 0.62,
  },
  assetMeta: {
    alignItems: "flex-end",
    maxWidth: "44%",
  },
  assetValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  assetPriceLabel: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
    textTransform: "uppercase",
  },
  activityAmount: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
    maxWidth: "32%",
    textAlign: "right",
  },
  activityAmountNegative: {
    color: COLORS.white,
  },
  activityAmountPositive: {
    color: COLORS.blue,
  },
  activityDate: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 5,
    textTransform: "uppercase",
  },
  activityError: {
    color: COLORS.yellow,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 12,
  },
  activityMark: {
    alignItems: "center",
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  activityMarkText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },
  activityRow: {
    alignItems: "center",
    borderBottomColor: COLORS.yellow,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: 12,
    minHeight: 82,
    paddingVertical: 12,
  },
  emptyActivity: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 12,
    opacity: 0.72,
  },
});
