import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "../theme";

type ProfileAvatarProps = {
  accessibilityLabel?: string;
  onPress?: () => void;
  size?: number;
  uri?: string | null;
};

export function ProfileAvatar({
  accessibilityLabel = "Open profile",
  onPress,
  size = 48,
  uri,
}: ProfileAvatarProps) {
  const frame = (
    <View style={[styles.frame, { height: size, width: size }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <Text style={[styles.placeholder, { fontSize: Math.max(18, size * 0.34) }]}>P</Text>
      )}
    </View>
  );

  if (!onPress) {
    return frame;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.pressable}
    >
      {frame}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    height: "100%",
    resizeMode: "cover",
    width: "100%",
  },
  placeholder: {
    color: COLORS.white,
    fontWeight: "900",
  },
});
