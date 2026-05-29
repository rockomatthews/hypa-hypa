import { Pressable, StyleSheet, Text, View } from "react-native";

import { ComicCard } from "../components/ComicCard";
import { COLORS } from "../theme";

type RecoveryPhraseScreenProps = {
  onContinue: () => void;
  phrase: string;
};

export function RecoveryPhraseScreen({
  onContinue,
  phrase,
}: RecoveryPhraseScreenProps) {
  const words = phrase.trim().split(/\s+/);

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.kicker}>Recovery phrase</Text>
        <Text style={styles.title}>Write these words down in order.</Text>
        <Text style={styles.subtitle}>
          Anyone with this phrase can control your wallet. HYPA HYPA will not show this
          automatically again.
        </Text>

        <ComicCard accent="yellow">
          <Text style={styles.panelLabel}>Backup now</Text>
          <View style={styles.wordGrid}>
            {words.map((word, index) => (
              <View key={`${index + 1}-${word}`} style={styles.wordChip}>
                <Text style={styles.wordIndex}>{index + 1}</Text>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </View>
        </ComicCard>

        <Pressable accessibilityRole="button" onPress={onContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>I wrote it down</Text>
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
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 36,
  },
  subtitle: {
    color: COLORS.yellow,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    opacity: 0.88,
  },
  panelLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  wordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  wordChip: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 3,
    minWidth: "47%",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  wordIndex: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  wordText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
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
});
