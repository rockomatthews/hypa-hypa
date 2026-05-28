import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { COLORS, type Accent } from "../theme";

type ComicCardProps = {
  accent: Accent;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ComicCard({ accent, children, style }: ComicCardProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: COLORS[accent], borderColor: COLORS.black },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardEyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    borderWidth: 3,
    overflow: "hidden",
    padding: 16,
  },
  eyebrow: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.black,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 26,
    marginBottom: 8,
  },
  body: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
});
