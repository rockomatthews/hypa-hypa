import { Pressable, StyleSheet, Text, View } from "react-native";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { BrandHeader } from "../components/BrandHeader";
import { ComicCard } from "../components/ComicCard";
import { COLORS } from "../theme";

type PortfolioScreenProps = {
  hypeBalance: string;
  isBalanceLoading: boolean;
  onCopyAddress: () => Promise<void>;
  onOpenSwap: () => void;
  walletAddress?: `0x${string}`;
};

export function PortfolioScreen({
  hypeBalance,
  isBalanceLoading,
  onCopyAddress,
  onOpenSwap,
  walletAddress,
}: PortfolioScreenProps) {
  const holdings = [
    {
      accent: "yellow",
      symbol: "HYPE",
      name: "HyperEVM balance",
      amount: isBalanceLoading ? "Loading..." : hypeBalance,
      value: walletAddress ? "Live wallet" : "Not funded",
    },
    {
      accent: "blue",
      symbol: "ADDR",
      name: "Receive wallet",
      amount: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Pending",
      value: "Private",
    },
    {
      accent: "blue",
      symbol: "stHYPE",
      name: "Delegated position",
      amount: "Coming next",
      value: "HyperCore",
    },
  ] as const;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <BrandHeader />

        <Text style={styles.pageTitle}>Portfolio</Text>
        <Text style={styles.pageMeta}>Live device wallet status plus HyperCore next steps.</Text>

        <View style={styles.list}>
          {holdings.map((holding) => (
            <Pressable
              accessibilityRole="button"
              key={holding.symbol}
              onPress={onOpenSwap}
            >
              <ComicCard accent={holding.accent} style={styles.rowCard}>
                <View style={styles.rowTop}>
                  <View>
                    <Text
                      style={[
                        styles.symbol,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.symbol}
                    </Text>
                    <Text
                      style={[
                        styles.name,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.name}
                    </Text>
                  </View>
                  <View style={styles.alignEnd}>
                    <Text
                      style={[
                        styles.value,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.value}
                    </Text>
                    <Text
                      style={[
                        styles.amount,
                        holding.accent === "blue" ? styles.blueText : null,
                      ]}
                    >
                      {holding.symbol === "ADDR" ? "" : holding.amount}
                    </Text>
                    {holding.symbol === "ADDR" ? (
                      <AddressWithCopy
                        address={walletAddress}
                        color={holding.accent === "blue" ? "white" : "black"}
                        onCopyAddress={onCopyAddress}
                        size="sm"
                      />
                    ) : null}
                  </View>
                </View>
              </ComicCard>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    flex: 1,
    gap: 12,
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
  list: {
    gap: 10,
    marginTop: 6,
  },
  rowCard: {
    paddingVertical: 16,
  },
  rowTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  symbol: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "900",
  },
  name: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  value: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "900",
  },
  amount: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    minHeight: 18,
  },
  blueText: {
    color: COLORS.white,
  },
});
