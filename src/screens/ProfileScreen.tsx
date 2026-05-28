import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandHeader } from "../components/BrandHeader";
import { COLORS } from "../theme";

const settings = [
  {
    title: "Wallet and recovery",
    detail: "Export recovery, view wallet address, and manage connected sessions.",
  },
  {
    title: "Recurring buy settings",
    detail: "Change the day, amount, or auto-stake behavior for scheduled buys.",
  },
  {
    title: "Validator preferences",
    detail: "Choose the default validator basket used after staking actions.",
  },
  {
    title: "Notifications",
    detail: "Toggle updates for fills, rewards, and recurring-plan reminders.",
  },
  {
    title: "Security",
    detail: "Review passcode, Face ID, and session timeout behavior.",
  },
] as const;

export function ProfileScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = settings[selectedIndex];

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <BrandHeader />

        <Text style={styles.pageTitle}>Profile</Text>
        <Text style={styles.pageMeta}>Security, recurring buys, and wallet preferences.</Text>

        <View style={styles.list}>
          {settings.map((item, index) => {
            const active = index === selectedIndex;

            return (
              <Pressable
                accessibilityRole="button"
                key={item.title}
                onPress={() => setSelectedIndex(index)}
                style={[
                  styles.row,
                  { backgroundColor: active ? COLORS.blue : COLORS.yellow },
                ]}
              >
                <Text
                  style={[
                    styles.rowText,
                    { color: active ? COLORS.white : COLORS.black },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.rowArrow,
                    { color: active ? COLORS.white : COLORS.black },
                  ]}
                >
                  ›
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.detailPanel}>
          <Text style={styles.detailLabel}>Selected</Text>
          <Text style={styles.detailTitle}>{selected.title}</Text>
          <Text style={styles.detailBody}>{selected.detail}</Text>
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
    borderColor: COLORS.black,
    borderWidth: 3,
    marginTop: 10,
  },
  row: {
    alignItems: "center",
    borderBottomColor: COLORS.black,
    borderBottomWidth: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  rowText: {
    fontSize: 15,
    fontWeight: "800",
  },
  rowArrow: {
    fontSize: 20,
    fontWeight: "900",
  },
  detailPanel: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 3,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailLabel: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detailTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 8,
  },
  detailBody: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
  },
});
