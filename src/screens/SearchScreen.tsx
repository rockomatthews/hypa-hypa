import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "../components/AppIcon";
import { useHyperCoreSpot } from "../hooks/useHyperCoreSpot";
import { COLORS } from "../theme";

type SearchScreenProps = {
  onOpenSwap: () => void;
  walletAddress?: `0x${string}`;
};

const quickFilters = ["HYPE", "USDC", "BTC", "SOL"] as const;

export function SearchScreen({ onOpenSwap, walletAddress }: SearchScreenProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const { error, isLoading, swapOptions } = useHyperCoreSpot(walletAddress);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return swapOptions.slice(0, 20);
    }

    return swapOptions.filter((option) => {
      const haystacks = [option.symbol, option.displayName, option.tokenId];
      return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query, swapOptions]);

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
          <View style={styles.titleRow}>
            <View style={styles.headerIcon}>
              <AppIcon color={COLORS.black} name="search" size={24} />
            </View>
            <View>
              <Text style={styles.title}>Search</Text>
              <Text style={styles.subtitle}>Discover tokens on Hyperliquid</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchBar}>
          <AppIcon color={COLORS.black} name="search" size={20} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Search token or ticker"
            placeholderTextColor={COLORS.black}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <View style={styles.quickRow}>
          {quickFilters.map((filter) => (
            <Pressable
              accessibilityRole="button"
              key={filter}
              onPress={() => setQuery(filter)}
              style={styles.quickChip}
            >
              <Text style={styles.quickChipText}>{filter}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.statusText}>
          {isLoading
            ? "Loading live spot universe..."
            : error
              ? error
              : `${swapOptions.length} live swap routes are loaded.`}
        </Text>

        <View style={styles.list}>
          {filteredOptions.map((option) => (
            <Pressable
              accessibilityRole="button"
              key={option.tokenId}
              onPress={onOpenSwap}
              style={styles.row}
            >
              <View style={styles.rowBadge}>
                <Text style={styles.rowBadgeText}>{option.symbol.slice(0, 1)}</Text>
              </View>

              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{option.symbol}</Text>
                <Text style={styles.rowSubtitle}>{option.displayName}</Text>
              </View>

              <View style={styles.rowMeta}>
                <Text style={styles.rowValue}>{option.midPrice ? `$${option.midPrice}` : "Live"}</Text>
                <Text style={styles.rowDetail}>
                  {option.balanceLabel !== "0" ? `${option.balanceLabel} in wallet` : "Tap to swap"}
                </Text>
              </View>
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
    justifyContent: "space-between",
  },
  titleRow: {
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
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase",
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: COLORS.black,
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  quickChip: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statusText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 18,
    opacity: 0.72,
  },
  list: {
    marginTop: 18,
  },
  row: {
    alignItems: "center",
    borderBottomColor: COLORS.yellow,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: 12,
    minHeight: 82,
    paddingVertical: 12,
  },
  rowBadge: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  rowBadgeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
  rowSubtitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    opacity: 0.62,
  },
  rowMeta: {
    alignItems: "flex-end",
    maxWidth: "42%",
  },
  rowValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },
  rowDetail: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "right",
    textTransform: "uppercase",
  },
});
