import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { useVideoPlayer, VideoView } from "expo-video";

import { COLORS } from "../theme";

const launchVideo = require("../../assets/hypa-launch.mov");
const launchLogo = require("../../assets/hypa-hypa-full-logo.png");

type LaunchScreenProps = {
  onResume: () => void;
};

function MegaphoneIcon({ muted }: { muted: boolean }) {
  return (
    <Svg height={128} viewBox="0 0 180 128" width={180}>
      <Path d="M16 57H45L120 22V106L45 71H16Z" fill={COLORS.yellow} />
      <Path d="M48 72L62 119H34L23 72Z" fill={COLORS.yellow} />
      <Rect fill={COLORS.yellow} height={104} rx={8} width={16} x={124} y={12} />
      <Path d="M141 50C155 51 164 60 164 64C164 68 155 77 141 78Z" fill={COLORS.yellow} />
      <Path d="M8 54H30V74H8C2 74 0 70 0 64C0 58 2 54 8 54Z" fill={COLORS.yellow} />
      {muted ? (
        <Path d="M154 32L174 96M174 32L154 96" stroke={COLORS.blue} strokeLinecap="square" strokeWidth={10} />
      ) : null}
    </Svg>
  );
}

export function LaunchScreen({ onResume }: LaunchScreenProps) {
  const insets = useSafeAreaInsets();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [soundOn, setSoundOn] = useState(false);
  const player = useVideoPlayer(launchVideo, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  useEffect(() => {
    player.muted = !soundOn;
  }, [soundOn, player]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        duration: 1800,
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.videoFrame,
          {
            marginBottom: Math.max(insets.bottom, 18) + 12,
            marginTop: Math.max(insets.top, 24) + 70,
          },
        ]}
      >
        <VideoView
          contentFit="cover"
          nativeControls={false}
          player={player}
          playsInline
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.tint} />

        <Animated.View style={[styles.logoFrame, { transform: [{ rotate: spin }] }]}>
          <Image source={launchLogo} style={styles.logoImage} />
        </Animated.View>

        <Pressable accessibilityRole="button" onPress={onResume} style={styles.resumeButton}>
          <Text style={styles.resumeText}>RESUME</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={soundOn ? "Turn sound off" : "Turn sound on"}
          accessibilityRole="button"
          onPress={() => setSoundOn((currentValue) => !currentValue)}
          style={styles.soundButton}
        >
          <MegaphoneIcon muted={!soundOn} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.black,
    zIndex: 100,
  },
  videoFrame: {
    borderColor: COLORS.black,
    borderWidth: 0,
    flex: 1,
    marginHorizontal: 22,
    overflow: "hidden",
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(18, 70, 216, 0.12)",
  },
  logoFrame: {
    alignSelf: "center",
    height: 150,
    marginTop: "32%",
    overflow: "hidden",
    width: 150,
  },
  logoImage: {
    height: "100%",
    resizeMode: "cover",
    width: "100%",
  },
  resumeButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.black,
    borderWidth: 2,
    justifyContent: "center",
    marginTop: "23%",
    minHeight: 110,
    width: "86%",
  },
  resumeText: {
    color: COLORS.yellow,
    fontSize: 54,
    fontWeight: "900",
    letterSpacing: 1,
  },
  soundButton: {
    alignItems: "center",
    alignSelf: "center",
    bottom: 34,
    height: 134,
    justifyContent: "center",
    position: "absolute",
    width: 190,
  },
});
