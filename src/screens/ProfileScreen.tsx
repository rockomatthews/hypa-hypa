import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { COLORS } from "../theme";

type ProfileScreenProps = {
  isRevealingRecoveryPhrase?: boolean;
  isSavingProfilePhoto?: boolean;
  onClearProfilePhoto?: () => Promise<void>;
  onCopyAddress?: () => Promise<void>;
  onPickProfilePhoto?: () => Promise<void>;
  onRemoveWallet?: () => void;
  onRevealRecoveryPhrase?: () => void;
  profilePhotoError?: string | null;
  profilePhotoUri?: string | null;
  usesBiometricSecurity?: boolean;
  walletAddress?: `0x${string}`;
};

export function ProfileScreen({
  isRevealingRecoveryPhrase,
  isSavingProfilePhoto,
  onClearProfilePhoto,
  onCopyAddress,
  onPickProfilePhoto,
  onRemoveWallet,
  onRevealRecoveryPhrase,
  profilePhotoError,
  profilePhotoUri,
  usesBiometricSecurity,
  walletAddress,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Profile</Text>
        <Text style={styles.title}>Personalize your private wallet.</Text>

        <View style={styles.photoCard}>
          <ProfileAvatar size={112} uri={profilePhotoUri} />

          <View style={styles.photoCopy}>
            <Text style={styles.photoTitle}>Profile photo</Text>
            <Text style={styles.photoBody}>
              Upload a photo stored only on this device. It appears in the top-right avatar on Home and here in Profile.
            </Text>
          </View>

          <View style={styles.photoActions}>
            {onPickProfilePhoto ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void onPickProfilePhoto()}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {isSavingProfilePhoto ? "Saving photo..." : profilePhotoUri ? "Replace photo" : "Upload photo"}
                </Text>
              </Pressable>
            ) : null}

            {profilePhotoUri && onClearProfilePhoto ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void onClearProfilePhoto()}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Remove photo</Text>
              </Pressable>
            ) : null}

            {profilePhotoError ? <Text style={styles.errorText}>{profilePhotoError}</Text> : null}
          </View>
        </View>

        <View style={styles.walletCard}>
          <Text style={styles.sectionLabel}>Wallet address</Text>
          <AddressWithCopy
            address={walletAddress}
            color="black"
            onCopyAddress={onCopyAddress ?? (() => Promise.resolve())}
            size="lg"
          />
          <Text style={styles.walletMeta}>
            {usesBiometricSecurity
              ? "Recovery phrase access is protected by Face ID or your device passcode."
              : "Recovery phrase access relies on this device without biometric enforcement."}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionLabelDark}>Security</Text>
          <Text style={styles.detailTitle}>Device-only private wallet</Text>
          <Text style={styles.detailBody}>
            This wallet is generated locally on the device. The recovery phrase never depends on email login.
          </Text>
        </View>

        {onRevealRecoveryPhrase ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRevealRecoveryPhrase}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {isRevealingRecoveryPhrase ? "Unlocking phrase..." : "Reveal recovery phrase"}
            </Text>
          </Pressable>
        ) : null}

        {onRemoveWallet ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRemoveWallet}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remove wallet from device</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.black,
    flex: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: 20,
  },
  kicker: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 34,
  },
  photoCard: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    gap: 16,
    padding: 16,
  },
  photoCopy: {
    gap: 8,
  },
  photoTitle: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: "900",
  },
  photoBody: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  photoActions: {
    gap: 10,
  },
  walletCard: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.black,
    borderWidth: 3,
    gap: 10,
    padding: 16,
  },
  sectionLabel: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  walletMeta: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  detailCard: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    gap: 10,
    padding: 16,
  },
  sectionLabelDark: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detailTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
  },
  detailBody: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 3,
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  removeButton: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  removeButtonText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  errorText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
  },
});
