import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { AppIcon } from "../components/AppIcon";
import { BrandMark } from "../components/BrandMark";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { SquareIconButton } from "../components/SquareIconButton";
import { useHyperCoreSpot } from "../hooks/useHyperCoreSpot";
import { COLORS } from "../theme";

type HomeScreenProps = {
  balanceError: string | null;
  hypeBalance: string;
  isBalanceLoading: boolean;
  onCopyAddress: () => Promise<void>;
  onOpenDeposit: () => void;
  onOpenDrawer: () => void;
  onOpenProfile: () => void;
  onOpenReceive: () => void;
  onOpenSearch: () => void;
  onOpenSend: () => void;
  onOpenSwap: () => void;
  profilePhotoUri?: string | null;
  walletAddress?: `0x${string}`;
  walletError: string | null;
};

const actionItems = [
  { icon: "deposit", key: "deposit", label: "Deposit" },
  { icon: "receive", key: "receive", label: "Receive" },
  { icon: "send", key: "send", label: "Send" },
  { icon: "swap", key: "swap", label: "Swap" },
] as const;

type ActionKey = (typeof actionItems)[number]["key"];

export function HomeScreen({
  balanceError,
  hypeBalance,
  isBalanceLoading,
  onCopyAddress,
  onOpenDeposit,
  onOpenDrawer,
  onOpenProfile,
  onOpenReceive,
  onOpenSearch,
  onOpenSend,
  onOpenSwap,
  profilePhotoUri,
  walletAddress,
  walletError,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { balances, error: spotError, swapOptions } = useHyperCoreSpot(walletAddress);

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

  const coinRows = [
    {
      context: "HyperEVM",
      symbol: "HYPE",
      value: isBalanceLoading ? "Loading..." : `${hypeBalance} HYPE`,
    },
    ...swapOptions
      .filter((option) => option.isInWallet)
      .slice(0, 4)
      .map((option) => ({
        context: option.dailyVolume ? `Vol ${option.dailyVolume}` : option.displayName,
        symbol: option.symbol,
        value: `${option.balanceLabel} ${option.symbol}`,
      })),
  ];

  const hasSpotFunds = balances.some((balance) => Number.parseFloat(balance.total) > 0);
  const statusText =
    walletError ??
    balanceError ??
    spotError ??
    (hasSpotFunds
      ? "Your spot wallet is live. Use Swap to route into other Hyperliquid assets."
      : "Your private wallet can already receive and hold HYPE on HyperEVM.");

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 28 },
        ]}
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
              <Text style={styles.headerSubtitle}>HYPA HYPA</Text>
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
          <BrandMark size={76} />
          <View style={styles.heroCopy}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.balanceValue}
            >
              {isBalanceLoading ? "Loading..." : hypeBalance} HYPE
            </Text>
            <Text style={styles.balanceSubcopy}>Private HyperEVM wallet balance</Text>
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

        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerIconText}>H</Text>
          </View>

          <View style={styles.bannerCopy}>
            <Text style={styles.bannerTitle}>Hold HYPE. Route into staking when you are ready.</Text>
            <Text style={styles.bannerBody}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.segmentRow}>
          <Text style={styles.segmentActive}>Coins</Text>
          <Text style={styles.segmentText}>Collectibles</Text>
          <Text style={styles.segmentText}>Activity</Text>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>HyperEVM</Text>
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>Wallet</Text>
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>Live</Text>
          </View>
        </View>

        <View style={styles.assetList}>
          {coinRows.map((row, index) => (
            <Pressable
              accessibilityRole="button"
              key={`${row.symbol}-${index}`}
              onPress={onOpenSwap}
              style={styles.assetRow}
            >
              <View style={styles.assetBadge}>
                {row.symbol === "HYPE" ? (
                  <Text style={styles.assetBadgeText}>H</Text>
                ) : (
                  <AppIcon color={COLORS.black} name="swap" size={18} />
                )}
              </View>

              <View style={styles.assetCopy}>
                <Text style={styles.assetTitle}>{row.symbol}</Text>
                <Text style={styles.assetSubtitle}>{row.context}</Text>
              </View>

              <Text numberOfLines={1} style={styles.assetValue}>
                {row.value}
              </Text>
            </Pressable>
          ))}
        </View>
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
    gap: 16,
    marginTop: 28,
  },
  heroCopy: {
    gap: 10,
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
    opacity: 0.68,
  },
  addressWrap: {
    gap: 6,
    marginTop: 4,
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
  banner: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    flexDirection: "row",
    gap: 14,
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  bannerIcon: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  bannerIconText: {
    color: COLORS.black,
    fontSize: 28,
    fontWeight: "900",
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },
  bannerBody: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 8,
    opacity: 0.72,
  },
  segmentRow: {
    borderBottomColor: COLORS.yellow,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: 24,
    marginTop: 28,
    paddingBottom: 10,
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
    opacity: 0.48,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  filterPill: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  assetList: {
    marginTop: 16,
  },
  assetRow: {
    alignItems: "center",
    borderBottomColor: COLORS.blue,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    paddingVertical: 12,
  },
  assetBadge: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  assetBadgeText: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: "900",
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
  assetValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
    maxWidth: "38%",
    textAlign: "right",
  },
});
