import { Image, StyleSheet, View } from "react-native";

type BrandMarkProps = {
  size?: number;
};

const brandImage = require("../../assets/hypa-hypa-mark.png");

export function BrandMark({ size = 72 }: BrandMarkProps) {
  return (
    <View style={[styles.frame, { height: size, width: size }]}>
      <Image source={brandImage} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
  image: {
    height: "100%",
    resizeMode: "contain",
    width: "100%",
  },
});
