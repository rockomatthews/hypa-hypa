import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { AppIcon, type AppIconName } from "./components/AppIcon";
import { BrandMark } from "./components/BrandMark";
import { SquareIconButton } from "./components/SquareIconButton";
import { DepositScreen } from "./screens/DepositScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LiveScreen } from "./screens/LiveScreen";
import { useHypeBalance } from "./hooks/useHypeBalance";
import { useDeviceWallet } from "./lib/deviceWallet";
import { useProfilePhoto } from "./lib/profilePhoto";
import { PrivateWalletOnboardingScreen } from "./screens/PrivateWalletOnboardingScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { ReceiveScreen } from "./screens/ReceiveScreen";
import { RecoveryPhraseScreen } from "./screens/RecoveryPhraseScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { SendScreen } from "./screens/SendScreen";
import { StakeScreen } from "./screens/StakeScreen";
import { SwapScreen } from "./screens/SwapScreen";
import { COLORS } from "./theme";

type TabKey = "home" | "search" | "swap" | "live" | "stake" | "profile";
type ModalKey = "deposit" | "receive" | "send";
type DrawerAction = { label: string; tab: TabKey };

const tabs: Array<{ key: Extract<TabKey, "home" | "search" | "swap" | "live">; icon: AppIconName }> = [
  { icon: "home", key: "home" },
  { icon: "search", key: "search" },
  { icon: "swap", key: "swap" },
  { icon: "live", key: "live" },
];

const drawerActions: DrawerAction[] = [
  { label: "Home", tab: "home" },
  { label: "Buy HYPE", tab: "swap" },
  { label: "Stake", tab: "stake" },
  { label: "Rewards", tab: "stake" },
  { label: "Search", tab: "search" },
  { label: "Live", tab: "live" },
  { label: "Profile", tab: "profile" },
];

function WalletGate() {
  const {
    createWallet,
    dismissRecoveryPhrase,
    error,
    isCreating,
    isLoading,
    isRevealingRecoveryPhrase,
    recoveryPhrase,
    removeWallet,
    revealRecoveryPhrase,
    wallet,
  } = useDeviceWallet();
  const walletAddress = wallet?.address;
  const {
    balanceLabel,
    error: balanceError,
    isLoading: isBalanceLoading,
    refresh,
  } = useHypeBalance(walletAddress);

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <BrandMark size={124} />
        <Text style={styles.centerKicker}>HYPA HYPA</Text>
        <Text style={styles.centerTitle}>Loading your private wallet...</Text>
      </View>
    );
  }

  if (!wallet) {
    return (
      <PrivateWalletOnboardingScreen
        error={error}
        isCreating={isCreating}
        onCreateWallet={createWallet}
      />
    );
  }

  if (recoveryPhrase) {
    return <RecoveryPhraseScreen onContinue={dismissRecoveryPhrase} phrase={recoveryPhrase} />;
  }

  return (
    <AppShell
      balanceError={balanceError}
      balanceLabel={balanceLabel}
      isBalanceLoading={isBalanceLoading}
      isRevealingRecoveryPhrase={isRevealingRecoveryPhrase}
      onCopyAddress={() =>
        walletAddress
          ? Clipboard.setStringAsync(walletAddress).then(() => undefined)
          : Promise.resolve()
      }
      onRefreshBalance={() => void refresh()}
      onRemoveWallet={() => void removeWallet()}
      onRevealRecoveryPhrase={() => void revealRecoveryPhrase()}
      usesBiometricSecurity={wallet.usesBiometricSecurity}
      walletAddress={walletAddress}
      walletError={error}
    />
  );
}

type AppShellProps = {
  balanceError: string | null;
  balanceLabel: string;
  isBalanceLoading: boolean;
  isRevealingRecoveryPhrase: boolean;
  onCopyAddress: () => Promise<void>;
  onRefreshBalance: () => void;
  onRemoveWallet: () => void;
  onRevealRecoveryPhrase: () => void;
  usesBiometricSecurity: boolean;
  walletAddress?: `0x${string}`;
  walletError: string | null;
};

function AppShell({
  balanceError,
  balanceLabel,
  isBalanceLoading,
  isRevealingRecoveryPhrase,
  onCopyAddress,
  onRefreshBalance,
  onRemoveWallet,
  onRevealRecoveryPhrase,
  usesBiometricSecurity,
  walletAddress,
  walletError,
}: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const {
    clearProfilePhoto,
    error: profilePhotoError,
    isSaving: isSavingProfilePhoto,
    pickProfilePhoto,
    profilePhotoUri,
  } = useProfilePhoto();

  const openTab = (tab: TabKey) => {
    setActiveTab(tab);
    setActiveModal(null);
    setDrawerOpen(false);
  };

  const openModal = (modal: ModalKey) => {
    setActiveModal(modal);
    setDrawerOpen(false);
  };

  const renderTabScreen = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            balanceError={balanceError}
            hypeBalance={balanceLabel}
            isBalanceLoading={isBalanceLoading}
            onCopyAddress={onCopyAddress}
            onOpenDeposit={() => openModal("deposit")}
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenProfile={() => openTab("profile")}
            onOpenReceive={() => openModal("receive")}
            onOpenSearch={() => openTab("search")}
            onOpenSend={() => openModal("send")}
            onOpenSwap={() => openTab("swap")}
            profilePhotoUri={profilePhotoUri}
            walletAddress={walletAddress}
            walletError={walletError}
          />
        );
      case "search":
        return <SearchScreen onOpenSwap={() => openTab("swap")} walletAddress={walletAddress} />;
      case "swap":
        return <SwapScreen walletAddress={walletAddress} />;
      case "live":
        return <LiveScreen />;
      case "stake":
        return <StakeScreen walletAddress={walletAddress} />;
      case "profile":
        return (
          <ProfileScreen
            isRevealingRecoveryPhrase={isRevealingRecoveryPhrase}
            isSavingProfilePhoto={isSavingProfilePhoto}
            onClearProfilePhoto={clearProfilePhoto}
            onCopyAddress={onCopyAddress}
            onPickProfilePhoto={pickProfilePhoto}
            onRemoveWallet={onRemoveWallet}
            onRevealRecoveryPhrase={onRevealRecoveryPhrase}
            profilePhotoError={profilePhotoError}
            profilePhotoUri={profilePhotoUri}
            usesBiometricSecurity={usesBiometricSecurity}
            walletAddress={walletAddress}
          />
        );
      default:
        return null;
    }
  };

  const renderModalScreen = () => {
    switch (activeModal) {
      case "deposit":
        return (
          <DepositScreen
            onClose={() => setActiveModal(null)}
            onCopyAddress={onCopyAddress}
            onOpenReceive={() => setActiveModal("receive")}
            walletAddress={walletAddress}
          />
        );
      case "receive":
        return (
          <ReceiveScreen
            onClose={() => setActiveModal(null)}
            onCopyAddress={onCopyAddress}
            walletAddress={walletAddress}
          />
        );
      case "send":
        return (
          <SendScreen
            onClose={() => setActiveModal(null)}
            onCopyAddress={onCopyAddress}
            walletAddress={walletAddress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.content}>{activeModal ? renderModalScreen() : renderTabScreen()}</View>

      {drawerOpen && !activeModal ? (
        <View style={styles.drawerOverlay}>
          <Pressable
            accessibilityLabel="Close menu"
            accessibilityRole="button"
            onPress={() => setDrawerOpen(false)}
            style={styles.drawerBackdrop}
          />

          <View
            style={[
              styles.sideDrawer,
              { paddingTop: Math.max(insets.top, 18) + 12 },
            ]}
          >
            <Text style={styles.sideDrawerKicker}>Menu</Text>
            <Text style={styles.sideDrawerTitle}>HYPA HYPA</Text>

            <View style={styles.sideDrawerList}>
              {drawerActions.map((action) => (
                <Pressable
                  accessibilityRole="button"
                  key={action.label}
                  onPress={() => openTab(action.tab)}
                  style={styles.sideDrawerItem}
                >
                  <Text style={styles.sideDrawerText}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      {!activeModal ? (
        <View
          style={[
            styles.tabBar,
            { paddingBottom: Math.max(insets.bottom, 12), paddingTop: 12 },
          ]}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <SquareIconButton
                accessibilityLabel={tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
                backgroundColor={isActive ? COLORS.blue : COLORS.yellow}
                borderColor={isActive ? COLORS.yellow : COLORS.black}
                iconColor={isActive ? COLORS.white : COLORS.black}
                iconName={tab.icon}
                iconSize={24}
                key={tab.key}
                onPress={() => openTab(tab.key)}
                style={styles.tabButton}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export function WalletApp() {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <WalletGate />
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.black,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  centerState: {
    alignItems: "flex-start",
    backgroundColor: COLORS.black,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  centerKicker: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  centerTitle: {
    color: COLORS.yellow,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 34,
  },
  drawerOverlay: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(5,5,5,0.72)",
  },
  sideDrawer: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderRightWidth: 3,
    bottom: 0,
    left: 0,
    paddingHorizontal: 18,
    position: "absolute",
    top: 0,
    width: "76%",
  },
  sideDrawerKicker: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sideDrawerTitle: {
    color: COLORS.black,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 6,
  },
  sideDrawerList: {
    gap: 10,
    marginTop: 28,
  },
  sideDrawerItem: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 3,
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  sideDrawerText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  tabBar: {
    backgroundColor: COLORS.black,
    borderTopColor: COLORS.yellow,
    borderTopWidth: 3,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
  },
  tabButton: {
    flex: 1,
  },
});
