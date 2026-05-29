import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../theme";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  errorMessage: string | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      errorMessage: error.message || "Unknown startup error.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("HYPA HYPA startup error", error, info);
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <View style={styles.screen}>
          <Text style={styles.kicker}>Startup error</Text>
          <Text style={styles.title}>The app hit a runtime error before the wallet could open.</Text>
          <Text style={styles.body}>{this.state.errorMessage}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.black,
    flex: 1,
    gap: 12,
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
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 32,
  },
  body: {
    color: COLORS.yellow,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    opacity: 0.86,
  },
});
