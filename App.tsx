import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HomeScreen } from "./src/screens/HomeScreen";
import { PortfolioScreen } from "./src/screens/PortfolioScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { TradeScreenSimple } from "./src/screens/TradeScreenSimple";
import { COLORS } from "./src/theme";

type TabKey = "home" | "portfolio" | "trade" | "profile";
type TradeContext = "buy" | "stake" | "rewards";

const tabs: { key: TabKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "portfolio", label: "Portfolio" },
  { key: "trade", label: "Trade" },
  { key: "profile", label: "Profile" },
];

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [tradeContext, setTradeContext] = useState<TradeContext>("buy");
  const insets = useSafeAreaInsets();

  const openTrade = (context: TradeContext = "buy") => {
    setTradeContext(context);
    setActiveTab("trade");
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "portfolio":
        return <PortfolioScreen onOpenTrade={openTrade} />;
      case "trade":
        return <TradeScreenSimple initialContext={tradeContext} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.content}>{renderScreen()}</View>

      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, 12) + 10 },
        ]}
      >
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <Pressable
              accessibilityRole="button"
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.navItem,
                { backgroundColor: active ? COLORS.blue : COLORS.yellow },
              ]}
            >
              <View
                style={[
                  styles.navMarker,
                  {
                    backgroundColor: active ? COLORS.white : COLORS.black,
                  },
                ]}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: active ? COLORS.white : COLORS.black },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    backgroundColor: COLORS.black,
    borderTopColor: COLORS.yellow,
    borderTopWidth: 4,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  navItem: {
    alignItems: "center",
    borderColor: COLORS.black,
    borderWidth: 3,
    flex: 1,
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  navMarker: {
    height: 10,
    width: 28,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "900",
  },
});
