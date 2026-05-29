import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandMark } from "../components/BrandMark";
import { ComicCard } from "../components/ComicCard";
import { COLORS } from "../theme";

type PrivateWalletOnboardingScreenProps = {
  error: string | null;
  isCreating: boolean;
  onCreateWallet: () => Promise<void>;
};

export function PrivateWalletOnboardingScreen({
  error,
  isCreating,
  onCreateWallet,
}: PrivateWalletOnboardingScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <BrandMark size={128} />
        <Text style={styles.kicker}>Private wallet</Text>
        <Text style={styles.title}>Create a device-first HYPA HYPA wallet.</Text>
        <Text style={styles.subtitle}>
          No email. No hosted account. Your wallet is generated on this device and protected by
          iPhone security.
        </Text>

        <ComicCard accent="yellow">
          <Text style={styles.panelLabel}>What happens next</Text>
          <Text style={styles.panelTitle}>You will get a recovery phrase.</Text>
          <Text style={styles.panelBody}>
            HYPA HYPA will show your phrase once, then store it behind Face ID or your device
            passcode whenever possible.
          </Text>
        </ComicCard>

        <View style={styles.grid}>
          <ComicCard accent="blue" style={styles.gridCard}>
            <Text style={styles.blueLabel}>Privacy</Text>
            <Text style={styles.blueBody}>No email required to create your wallet.</Text>
          </ComicCard>

          <ComicCard accent="yellow" style={styles.gridCard}>
            <Text style={styles.panelLabel}>Recovery</Text>
            <Text style={styles.panelBody}>Write the phrase down before you continue.</Text>
          </ComicCard>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => void onCreateWallet()}
          style={[styles.primaryButton, isCreating ? styles.buttonDim : null]}
        >
          <Text style={styles.primaryButtonText}>
            {isCreating ? "Creating wallet..." : "Create private wallet"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.black,
    flex: 1,
  },
  content: {
    alignItems: "flex-start",
    flex: 1,
    gap: 14,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  kicker: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.yellow,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.4,
    lineHeight: 40,
  },
  subtitle: {
    color: COLORS.yellow,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    opacity: 0.88,
  },
  panelLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  panelTitle: {
    color: COLORS.black,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 26,
    marginTop: 8,
  },
  panelBody: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    gap: 10,
  },
  gridCard: {
    flex: 1,
    minHeight: 120,
  },
  blueLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  blueBody: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 8,
  },
  errorText: {
    color: COLORS.yellow,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 3,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  buttonDim: {
    opacity: 0.72,
  },
});
