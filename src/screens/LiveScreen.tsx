import { useCallback, useMemo, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "../components/AppIcon";
import { COLORS } from "../theme";

const feedTemplates = [
  {
    accent: "yellow",
    asset: "HYPE",
    handle: "@northstarflow",
    price: "$42.18",
    size: "Bought 1,420 HYPE",
    time: "12s ago",
  },
  {
    accent: "blue",
    asset: "BTC",
    handle: "@perpvision",
    price: "$109,882",
    size: "Rotated 88k USDC into BTC",
    time: "41s ago",
  },
  {
    accent: "yellow",
    asset: "SOL",
    handle: "@spotcartel",
    price: "$233.14",
    size: "Bought 320 SOL",
    time: "2m ago",
  },
  {
    accent: "blue",
    asset: "USDC",
    handle: "@volumewhale",
    price: "$1.00",
    size: "Moved 240k into dry powder",
    time: "3m ago",
  },
] as const;

const feedHandles = [
  "@northstarflow",
  "@perpvision",
  "@spotcartel",
  "@volumewhale",
  "@hypewatch",
  "@vaultpulse",
  "@liquiditymax",
  "@bookrunner",
] as const;
const feedAssets = ["HYPE", "BTC", "SOL", "PURR", "ETH", "USDC", "HFUN", "UBTC"] as const;
const PAGE_SIZE = 6;
const MAX_FEED_ITEMS = 48;

function buildLiveFeed(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const template = feedTemplates[index % feedTemplates.length];
    const asset = feedAssets[index % feedAssets.length];
    const handle = feedHandles[index % feedHandles.length];
    const isBuy = index % 3 !== 1;
    const size = isBuy
      ? `Bought ${(index + 2) * 140} ${asset}`
      : `Sold ${(index + 1) * 75} ${asset}`;

    return {
      ...template,
      asset,
      handle,
      price: template.price,
      size,
      time: index < 4 ? template.time : `${index + 2}m ago`,
    };
  });
}

export function LiveScreen() {
  const insets = useSafeAreaInsets();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleFeed = useMemo(() => buildLiveFeed(visibleCount), [visibleCount]);
  const hasMoreFeed = visibleCount < MAX_FEED_ITEMS;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hasMoreFeed) {
        return;
      }

      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom < 180) {
        setVisibleCount((currentCount) =>
          Math.min(currentCount + PAGE_SIZE, MAX_FEED_ITEMS),
        );
      }
    },
    [hasMoreFeed],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 30 },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={160}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <AppIcon color={COLORS.white} name="live" size={24} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Live</Text>
            <Text style={styles.subtitle}>Popular traders buying now</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          This is the live social tape for HYPA HYPA. Real feed integration can slot into this model later without changing the layout.
        </Text>

        <View style={styles.feed}>
          {visibleFeed.map((item, index) => {
            const isBlue = item.accent === "blue";

            return (
              <View
                key={`${item.handle}-${item.asset}-${index}`}
                style={[
                  styles.feedCard,
                  isBlue ? styles.feedCardBlue : styles.feedCardYellow,
                ]}
              >
                <View style={styles.feedTop}>
                  <View style={[styles.avatar, isBlue ? styles.avatarYellow : styles.avatarBlue]}>
                    <Text style={[styles.avatarText, isBlue ? styles.avatarTextDark : null]}>
                      {item.handle.slice(1, 2).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.feedCopy}>
                    <Text style={[styles.handle, isBlue ? styles.textWhite : styles.textBlack]}>
                      {item.handle}
                    </Text>
                    <Text style={[styles.time, isBlue ? styles.textWhiteMuted : styles.textBlackMuted]}>
                      {item.time}
                    </Text>
                  </View>

                  <View style={styles.assetPill}>
                    <Text style={styles.assetPillText}>{item.asset}</Text>
                  </View>
                </View>

                <Text style={[styles.size, isBlue ? styles.textWhite : styles.textBlack]}>
                  {item.size}
                </Text>
                <Text style={[styles.price, isBlue ? styles.textWhiteMuted : styles.textBlackMuted]}>
                  Route context: {item.price}
                </Text>
              </View>
            );
          })}

          {hasMoreFeed ? (
            <View style={styles.loadMoreCard}>
              <Text style={styles.loadMoreText}>Scroll to refresh the live tape</Text>
            </View>
          ) : null}
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
  headerCopy: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase",
  },
  intro: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 20,
    opacity: 0.72,
  },
  feed: {
    gap: 14,
    marginTop: 18,
  },
  feedCard: {
    borderWidth: 3,
    padding: 16,
  },
  feedCardYellow: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
  },
  feedCardBlue: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
  },
  feedTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  avatar: {
    alignItems: "center",
    borderWidth: 3,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  avatarBlue: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
  },
  avatarYellow: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
  avatarTextDark: {
    color: COLORS.black,
  },
  feedCopy: {
    flex: 1,
    marginLeft: 12,
  },
  handle: {
    fontSize: 17,
    fontWeight: "900",
  },
  time: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
  },
  assetPill: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  assetPillText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },
  size: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
    marginTop: 14,
  },
  price: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 8,
  },
  textWhite: {
    color: COLORS.white,
  },
  textWhiteMuted: {
    color: COLORS.white,
    opacity: 0.72,
  },
  textBlack: {
    color: COLORS.black,
  },
  textBlackMuted: {
    color: COLORS.black,
    opacity: 0.72,
  },
  loadMoreCard: {
    alignItems: "center",
    borderColor: COLORS.blue,
    borderWidth: 3,
    minHeight: 54,
    justifyContent: "center",
  },
  loadMoreText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
