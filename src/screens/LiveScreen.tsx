import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "../components/AppIcon";
import { COLORS } from "../theme";

const liveFeed = [
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

export function LiveScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 30 },
        ]}
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
          {liveFeed.map((item) => {
            const isBlue = item.accent === "blue";

            return (
              <View
                key={`${item.handle}-${item.asset}`}
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
});
