import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Polyline } from "react-native-svg";

import { CoinMark } from "../components/CoinMark";
import {
  type CandleRange,
  getCachedHyperCoreCandles,
  getCachedHyperCoreTokenDetails,
  type SwapTokenOption,
  useHyperCoreSpot,
} from "../hooks/useHyperCoreSpot";
import { type CandleSnapshotItem, formatCompactAmount, type TokenDetailsResponse } from "../lib/hyperCore";
import { COLORS } from "../theme";

type CoinDetailScreenProps = {
  onBack: () => void;
  onOpenSwap: (tokenId?: string | null) => void;
  tokenId: string | null;
  walletAddress?: `0x${string}`;
};

const ranges: CandleRange[] = ["1H", "1D", "1W", "1M", "ALL"];

function truncateAddress(address?: string) {
  if (!address) {
    return "Unknown";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatUsd(rawValue?: string | number | null, compact = false) {
  const value = typeof rawValue === "number" ? rawValue : Number.parseFloat(rawValue ?? "");

  if (!Number.isFinite(value)) {
    return "Unknown";
  }

  if (compact) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(value >= 10_000_000_000 ? 1 : 2)}B`;
    }

    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(value >= 100_000_000 ? 1 : 2)}M`;
    }

    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(value >= 100_000 ? 1 : 2)}K`;
    }
  }

  return value.toLocaleString(undefined, {
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 4 : 8,
    minimumFractionDigits: value >= 1 ? 2 : 2,
    style: "currency",
  });
}

function formatTokenNumber(rawValue?: string | null) {
  if (!rawValue) {
    return "Unknown";
  }

  return formatCompactAmount(rawValue, 2);
}

function calculateMarketCap(details: TokenDetailsResponse | null, fallbackPrice?: string | null) {
  const supply = Number.parseFloat(details?.circulatingSupply ?? details?.totalSupply ?? "");
  const price = Number.parseFloat(details?.midPx ?? details?.markPx ?? fallbackPrice ?? "");

  if (!Number.isFinite(supply) || !Number.isFinite(price)) {
    return null;
  }

  return supply * price;
}

function formatAge(deployTime?: string) {
  if (!deployTime) {
    return "Unknown";
  }

  const deployedAt = new Date(deployTime).getTime();

  if (!Number.isFinite(deployedAt)) {
    return "Unknown";
  }

  const days = Math.max(0, Math.floor((Date.now() - deployedAt) / (24 * 60 * 60 * 1000)));

  if (days >= 365) {
    return `${(days / 365).toFixed(1)}y`;
  }

  if (days >= 30) {
    return `${Math.floor(days / 30)}mo`;
  }

  return `${days}d`;
}

function countGenesisHolders(details: TokenDetailsResponse | null) {
  return (
    details?.genesis?.userBalances?.filter(([, amount]) => Number.parseFloat(amount) > 0).length ??
    null
  );
}

function chartPoints(candles: CandleSnapshotItem[], width: number, height: number) {
  const prices = candles
    .map((candle) => Number.parseFloat(candle.c))
    .filter((price) => Number.isFinite(price));

  if (prices.length < 2) {
    return "";
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = max - min || 1;

  return prices
    .map((price, index) => {
      const x = (index / Math.max(prices.length - 1, 1)) * width;
      const y = height - ((price - min) / spread) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function DetailChart({ candles }: { candles: CandleSnapshotItem[] }) {
  const width = 330;
  const height = 210;
  const points = chartPoints(candles, width, height);
  const lastPoint = points.split(" ").at(-1)?.split(",").map(Number) ?? null;

  return (
    <View style={styles.chartWrap}>
      {points ? (
        <Svg height={height} width="100%" viewBox={`0 0 ${width} ${height}`}>
          <Polyline
            fill="none"
            points={points}
            stroke={COLORS.yellow}
            strokeLinecap="square"
            strokeLinejoin="round"
            strokeWidth={5}
          />
          {lastPoint ? (
            <Circle cx={lastPoint[0]} cy={lastPoint[1]} fill={COLORS.blue} r={7} />
          ) : null}
        </Svg>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>Chart loads when HyperCore candles are available.</Text>
        </View>
      )}
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statDots} />
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function CoinDetailScreen({
  onBack,
  onOpenSwap,
  tokenId,
  walletAddress,
}: CoinDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { swapOptions } = useHyperCoreSpot(walletAddress);
  const [range, setRange] = useState<CandleRange>("1D");
  const [details, setDetails] = useState<TokenDetailsResponse | null>(null);
  const [candles, setCandles] = useState<CandleSnapshotItem[]>([]);

  const option = useMemo<SwapTokenOption | null>(() => {
    if (!tokenId) {
      return null;
    }

    return swapOptions.find((item) => item.tokenId === tokenId) ?? null;
  }, [swapOptions, tokenId]);

  useEffect(() => {
    let isMounted = true;

    if (!option?.tokenId) {
      setDetails(null);
      return;
    }

    void getCachedHyperCoreTokenDetails(option.tokenId).then((nextDetails) => {
      if (isMounted) {
        setDetails(nextDetails);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [option?.tokenId]);

  useEffect(() => {
    let isMounted = true;

    if (!option?.candleCoin) {
      setCandles([]);
      return;
    }

    void getCachedHyperCoreCandles(option.candleCoin, range).then((nextCandles) => {
      if (isMounted) {
        setCandles(nextCandles);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [option?.candleCoin, range]);

  const symbol = option?.symbol ?? "Coin";
  const displayName = option?.displayName ?? symbol;
  const price = details?.midPx ?? details?.markPx ?? option?.midPrice ?? null;
  const marketCapValue = calculateMarketCap(details, option?.midPrice);
  const marketCap = marketCapValue ? formatUsd(marketCapValue, true) : option?.marketCapLabel?.replace(" MC", "") ?? "Unknown";
  const volume = option?.dailyVolume ? formatUsd(option.dailyVolume, true) : "Unknown";
  const holderCount = countGenesisHolders(details);
  const aboutText = details
    ? `${displayName} (${symbol}) trades on Hyperliquid spot. HYPA HYPA pulls this page from HyperCore token details, spot context, and candle data.`
    : `HYPA HYPA is loading deeper HyperCore metadata for ${symbol}. Price and route data are available from the live spot universe.`;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 10, paddingBottom: 156 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <CoinMark initials={option?.initials} size={54} symbol={symbol} />

          <View style={styles.headerCopy}>
            <Text style={styles.headerSymbol}>{symbol}</Text>
            <Text style={styles.headerAddress}>{truncateAddress(option?.tokenId)}</Text>
          </View>

          <Text style={styles.star}>☆</Text>
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text adjustsFontSizeToFit numberOfLines={1} style={styles.price}>
          {formatUsd(price)}
        </Text>

        <View style={styles.marketRow}>
          <Text
            style={[
              styles.changeText,
              (option?.priceChangePercent ?? 0) < 0 ? styles.changeNegative : styles.changePositive,
            ]}
          >
            {option?.priceChangeLabel ?? "24H --"}
          </Text>
          <Text style={styles.marketText}>1d</Text>
          <Text style={styles.marketText}>{marketCap} Mkt Cap</Text>
          <Text style={styles.marketText}>{volume} 24h Vol</Text>
        </View>

        <DetailChart candles={candles} />

        <View style={styles.rangeRow}>
          {ranges.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item}
              onPress={() => setRange(item)}
              style={[styles.rangeChip, range === item ? styles.rangeChipActive : null]}
            >
              <Text style={[styles.rangeText, range === item ? styles.rangeTextActive : null]}>
                {item === "ALL" ? "All" : item}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ownerPill}>
          <Text style={styles.ownerText}>
            {option?.candleCoin ? `Route ${option.candleCoin}` : "Spot route metadata"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>{aboutText}</Text>

        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsCard}>
          <StatRow label="Token age" value={formatAge(details?.deployTime)} />
          <StatRow label="Market cap" value={marketCap} />
          <StatRow label="Total supply" value={formatTokenNumber(details?.totalSupply)} />
          <StatRow label="Circulating supply" value={formatTokenNumber(details?.circulatingSupply)} />
          <StatRow label="Genesis holders" value={holderCount ? holderCount.toLocaleString() : "Unknown"} />
          <StatRow label="Liquidity seed" value={formatUsd(details?.seededUsdc, true)} />
          <StatRow label="Volume (24h)" value={volume} />
          <StatRow label="Deployer" value={truncateAddress(details?.deployer)} />
        </View>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenSwap(option?.tokenId ?? tokenId)}
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionText}>Buy</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenSwap(option?.tokenId ?? tokenId)}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>Sell</Text>
          </Pressable>
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
    gap: 12,
  },
  backButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 28,
  },
  backText: {
    color: COLORS.white,
    fontSize: 46,
    fontWeight: "700",
    lineHeight: 48,
  },
  headerCopy: {
    flex: 1,
  },
  headerSymbol: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "900",
  },
  headerAddress: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
    opacity: 0.62,
  },
  star: {
    color: COLORS.yellow,
    fontSize: 40,
    fontWeight: "900",
  },
  name: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 28,
  },
  price: {
    color: COLORS.white,
    fontSize: 54,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 62,
    marginTop: 8,
  },
  marketRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  changeText: {
    fontSize: 15,
    fontWeight: "900",
  },
  changePositive: {
    color: COLORS.blue,
  },
  changeNegative: {
    color: COLORS.yellow,
  },
  marketText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    opacity: 0.72,
  },
  chartWrap: {
    height: 230,
    justifyContent: "center",
    marginTop: 30,
  },
  emptyChart: {
    alignItems: "center",
    borderColor: COLORS.blue,
    borderWidth: 3,
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  emptyChartText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  rangeChip: {
    alignItems: "center",
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  rangeChipActive: {
    backgroundColor: COLORS.yellow,
  },
  rangeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },
  rangeTextActive: {
    color: COLORS.black,
  },
  ownerPill: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.blue,
    marginTop: 26,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ownerText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 34,
  },
  aboutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
    marginTop: 12,
    opacity: 0.82,
  },
  statsCard: {
    marginTop: 14,
  },
  statRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 34,
  },
  statLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    opacity: 0.68,
  },
  statDots: {
    borderBottomColor: "rgba(255,255,255,0.22)",
    borderBottomWidth: 2,
    flex: 1,
    marginHorizontal: 8,
    transform: [{ translateY: 4 }],
  },
  statValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    maxWidth: "42%",
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 34,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    flex: 1,
    minHeight: 58,
    justifyContent: "center",
  },
  primaryActionText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "900",
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    flex: 1,
    minHeight: 58,
    justifyContent: "center",
  },
  secondaryActionText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
});
