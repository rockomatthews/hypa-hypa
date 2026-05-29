import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../theme";

export type AppIconName =
  | "deposit"
  | "home"
  | "live"
  | "menu"
  | "receive"
  | "search"
  | "send"
  | "swap";

type AppIconProps = {
  color?: string;
  name: AppIconName;
  size?: number;
};

export function AppIcon({
  color = COLORS.black,
  name,
  size = 24,
}: AppIconProps) {
  const stroke = Math.max(2, Math.round(size * 0.11));

  switch (name) {
    case "deposit":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          <View style={[styles.plusVertical, { backgroundColor: color, width: stroke, height: size }]} />
          <View style={[styles.plusHorizontal, { backgroundColor: color, height: stroke, width: size }]} />
        </View>
      );
    case "home":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          <Text style={[styles.glyph, { color, fontSize: size * 0.95 }]}>⌂</Text>
        </View>
      );
    case "live":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          <View
            style={[
              styles.liveRingOuter,
              { borderColor: color, borderWidth: stroke, height: size, width: size },
            ]}
          />
          <View
            style={[
              styles.liveRingInner,
              { borderColor: color, borderWidth: stroke, height: size * 0.62, width: size * 0.62 },
            ]}
          />
          <View
            style={[
              styles.liveDot,
              { backgroundColor: color, height: size * 0.18, width: size * 0.18 },
            ]}
          />
        </View>
      );
    case "menu":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.menuLine,
                {
                  backgroundColor: color,
                  height: stroke,
                  top: size * (0.2 + index * 0.25),
                  width: size * 0.78,
                },
              ]}
            />
          ))}
        </View>
      );
    case "receive":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          <View style={[styles.corner, { borderColor: color, borderLeftWidth: stroke, borderTopWidth: stroke, height: size * 0.34, left: 0, top: 0, width: size * 0.34 }]} />
          <View style={[styles.corner, { borderColor: color, borderRightWidth: stroke, borderTopWidth: stroke, height: size * 0.34, right: 0, top: 0, width: size * 0.34 }]} />
          <View style={[styles.corner, { borderColor: color, borderLeftWidth: stroke, borderBottomWidth: stroke, bottom: 0, height: size * 0.34, left: 0, width: size * 0.34 }]} />
          <View style={[styles.corner, { borderColor: color, borderRightWidth: stroke, borderBottomWidth: stroke, bottom: 0, height: size * 0.34, right: 0, width: size * 0.34 }]} />
          <View
            style={[
              styles.receiveCore,
              {
                borderColor: color,
                borderWidth: stroke,
                height: size * 0.34,
                width: size * 0.34,
              },
            ]}
          />
        </View>
      );
    case "search":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          <View
            style={[
              styles.searchCircle,
              {
                borderColor: color,
                borderWidth: stroke,
                height: size * 0.58,
                width: size * 0.58,
              },
            ]}
          />
          <View
            style={[
              styles.searchHandle,
              {
                backgroundColor: color,
                height: stroke,
                width: size * 0.34,
              },
            ]}
          />
        </View>
      );
    case "send":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          <Text style={[styles.glyph, { color, fontSize: size * 0.88 }]}>➤</Text>
        </View>
      );
    case "swap":
      return (
        <View style={[styles.canvas, { height: size, width: size }]}>
          <Text style={[styles.glyph, { color, fontSize: size * 0.92 }]}>⇄</Text>
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  canvas: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  plusVertical: {
    position: "absolute",
  },
  plusHorizontal: {
    position: "absolute",
  },
  glyph: {
    fontWeight: "900",
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  liveRingOuter: {
    borderRadius: 999,
    position: "absolute",
  },
  liveRingInner: {
    borderRadius: 999,
    position: "absolute",
  },
  liveDot: {
    borderRadius: 999,
    position: "absolute",
  },
  menuLine: {
    borderRadius: 999,
    position: "absolute",
  },
  corner: {
    position: "absolute",
  },
  receiveCore: {
    position: "absolute",
  },
  searchCircle: {
    borderRadius: 999,
    left: "12%",
    position: "absolute",
    top: "12%",
  },
  searchHandle: {
    borderRadius: 999,
    position: "absolute",
    right: "10%",
    top: "68%",
    transform: [{ rotate: "45deg" }],
  },
});
