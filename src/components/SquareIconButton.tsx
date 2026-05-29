import { Pressable, StyleSheet, type StyleProp, View, type ViewStyle } from "react-native";

import { COLORS } from "../theme";
import { AppIcon, type AppIconName } from "./AppIcon";

type SquareIconButtonProps = {
  accessibilityLabel: string;
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  iconName: AppIconName;
  iconSize?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SquareIconButton({
  accessibilityLabel,
  backgroundColor = COLORS.yellow,
  borderColor = COLORS.black,
  iconColor = COLORS.black,
  iconName,
  iconSize = 24,
  onPress,
  style,
}: SquareIconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor, borderColor },
        style,
      ]}
    >
      <View style={styles.iconWrap}>
        <AppIcon color={iconColor} name={iconName} size={iconSize} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    aspectRatio: 1,
    borderWidth: 3,
    justifyContent: "center",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
