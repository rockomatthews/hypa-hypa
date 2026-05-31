import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import { COLORS } from "../theme";

type CoinMarkProps = {
  initials?: string;
  size?: number;
  symbol: string;
};

const glyphBySymbol: Record<string, string> = {
  ADA: "A",
  APT: "A",
  AVAX: "A",
  BCH: "B",
  BNB: "B",
  DOGE: "Ð",
  FARTCOIN: "F",
  HYPE: "H",
  JUP: "J",
  LINK: "L",
  LTC: "Ł",
  PUMP: "P",
  SUI: "S",
  TRX: "T",
  USDC: "$",
  XLM: "X",
  XMR: "M",
  XRP: "X",
  ZEC: "Z",
};

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function SolMark({ size }: { size: number }) {
  const width = size * 0.72;
  const height = Math.max(5, size * 0.12);
  const x = size * 0.14;

  return (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
      {[0, 1, 2].map((index) => (
        <Rect
          fill={index === 1 ? COLORS.blue : COLORS.yellow}
          height={height}
          key={index}
          rx={0}
          transform={`skewX(-16)`}
          width={width}
          x={x + index * 2}
          y={size * (0.28 + index * 0.2)}
        />
      ))}
    </Svg>
  );
}

function EthMark({ size }: { size: number }) {
  return (
    <Svg height={size} width={size} viewBox="0 0 64 64">
      <Path d="M32 4L12 34L32 46L52 34L32 4Z" fill={COLORS.yellow} />
      <Path d="M32 4V46L52 34L32 4Z" fill={COLORS.blue} />
      <Path d="M12 38L32 60L52 38L32 50L12 38Z" fill={COLORS.yellow} />
    </Svg>
  );
}

function DotMark({ size, symbol }: { size: number; symbol: string }) {
  const isStable = symbol === "USDC";

  return (
    <View style={[styles.dotMark, { height: size, width: size }]}>
      <CircleMark size={size} />
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[
          styles.dotGlyph,
          {
            color: isStable ? COLORS.black : COLORS.white,
            fontSize: size * 0.54,
          },
        ]}
      >
        {glyphBySymbol[symbol] ?? symbol.slice(0, 1)}
      </Text>
    </View>
  );
}

function CircleMark({ size }: { size: number }) {
  return (
    <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} fill={COLORS.yellow} r={size * 0.42} />
      <Circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={size * 0.28}
        stroke={COLORS.blue}
        strokeWidth={size * 0.07}
      />
    </Svg>
  );
}

export function CoinMark({ initials, size = 52, symbol }: CoinMarkProps) {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (normalizedSymbol === "SOL") {
    return (
      <View style={[styles.mark, { height: size, width: size }]}>
        <SolMark size={size} />
      </View>
    );
  }

  if (normalizedSymbol === "ETH") {
    return (
      <View style={[styles.mark, { height: size, width: size }]}>
        <EthMark size={size} />
      </View>
    );
  }

  if (normalizedSymbol === "BTC") {
    return (
      <View style={[styles.mark, { height: size, width: size }]}>
        <Text style={[styles.bitcoin, { fontSize: size * 0.8, lineHeight: size }]}>₿</Text>
      </View>
    );
  }

  const glyph = glyphBySymbol[normalizedSymbol];

  if (glyph) {
    return <DotMark size={size} symbol={normalizedSymbol} />;
  }

  return (
    <View style={[styles.fallbackMark, { height: size, width: size }]}>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.fallbackText, { fontSize: size * 0.32 }]}
      >
        {(initials || normalizedSymbol.slice(0, 2)).slice(0, 3)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: "center",
    justifyContent: "center",
  },
  bitcoin: {
    color: COLORS.yellow,
    fontWeight: "900",
    includeFontPadding: false,
    textAlign: "center",
  },
  dotMark: {
    alignItems: "center",
    justifyContent: "center",
  },
  dotGlyph: {
    fontWeight: "900",
    includeFontPadding: false,
    position: "absolute",
    textAlign: "center",
  },
  fallbackMark: {
    alignItems: "center",
    borderColor: COLORS.blue,
    borderWidth: 3,
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
  },
  fallbackText: {
    color: COLORS.white,
    fontWeight: "900",
    includeFontPadding: false,
    textAlign: "center",
    transform: [{ rotate: "-45deg" }],
  },
});
