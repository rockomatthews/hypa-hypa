import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../theme";

type AddressWithCopyProps = {
  address?: `0x${string}`;
  color?: "black" | "white" | "blue";
  onCopyAddress: () => Promise<void>;
  size?: "sm" | "md" | "lg";
};

function getSummary(address?: `0x${string}`) {
  if (!address) {
    return "Pending";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AddressWithCopy({
  address,
  color = "black",
  onCopyAddress,
  size = "md",
}: AddressWithCopyProps) {
  const textColor =
    color === "white" ? COLORS.white : color === "blue" ? COLORS.blue : COLORS.black;
  const summary = getSummary(address);
  const disabled = !address;
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.text,
          { color: textColor },
          isSmall ? styles.textSmall : null,
          isLarge ? styles.textLarge : null,
        ]}
      >
        {summary}
      </Text>

      <Pressable
        accessibilityLabel="Copy wallet address"
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => void onCopyAddress()}
        style={[
          styles.button,
          {
            borderColor: textColor,
            opacity: disabled ? 0.45 : 1,
          },
          isSmall ? styles.buttonSmall : null,
        ]}
      >
        <View style={styles.iconWrap}>
          <View style={[styles.iconBack, { borderColor: textColor }]} />
          <View style={[styles.iconFront, { borderColor: textColor }]} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "900",
  },
  textSmall: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 18,
  },
  button: {
    alignItems: "center",
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  buttonSmall: {
    height: 24,
    width: 24,
  },
  iconWrap: {
    height: 14,
    position: "relative",
    width: 14,
  },
  iconBack: {
    borderWidth: 2,
    height: 8,
    left: 1,
    position: "absolute",
    top: 1,
    width: 8,
  },
  iconFront: {
    borderWidth: 2,
    height: 8,
    left: 5,
    position: "absolute",
    top: 5,
    width: 8,
  },
});
