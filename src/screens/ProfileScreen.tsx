import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { type WalletActivityItem, formatActivityDate } from "../lib/activityLog";
import { COLORS } from "../theme";

type ProfileScreenProps = {
  activity?: WalletActivityItem[];
  activityError?: string | null;
  isSavingProfile?: boolean;
  isRevealingRecoveryPhrase?: boolean;
  isSavingProfilePhoto?: boolean;
  onClearProfilePhoto?: () => Promise<void>;
  onCopyAddress?: () => Promise<void>;
  onPickProfilePhoto?: () => Promise<void>;
  onRemoveWallet?: () => void;
  onRevealRecoveryPhrase?: () => void;
  onSaveUsername?: (username: string) => Promise<void>;
  profileError?: string | null;
  profilePhotoError?: string | null;
  profilePhotoUri?: string | null;
  username?: string;
  usesBiometricSecurity?: boolean;
  walletAddress?: `0x${string}`;
};

export function ProfileScreen({
  activity,
  activityError,
  isSavingProfile,
  isRevealingRecoveryPhrase,
  isSavingProfilePhoto,
  onClearProfilePhoto,
  onCopyAddress,
  onPickProfilePhoto,
  onRemoveWallet,
  onRevealRecoveryPhrase,
  onSaveUsername,
  profileError,
  profilePhotoError,
  profilePhotoUri,
  username,
  usesBiometricSecurity,
  walletAddress,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [draftUsername, setDraftUsername] = useState(username ?? "");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftUsername(username ?? "");
  }, [username]);

  const saveUsername = async () => {
    if (!onSaveUsername) {
      return;
    }

    setSaveMessage(null);

    try {
      await onSaveUsername(draftUsername);
      setSaveMessage("Username saved.");
    } catch {
      setSaveMessage(null);
    }
  };

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
        <Text style={styles.title}>{username ? `@${username}` : "Choose your username."}</Text>

        <View style={styles.walletCard}>
          <Text style={styles.sectionLabel}>Username</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setDraftUsername}
            placeholder="Choose username"
            placeholderTextColor="rgba(0, 0, 0, 0.45)"
            style={styles.usernameInput}
            value={draftUsername}
          />
          <Pressable
            accessibilityRole="button"
            disabled={isSavingProfile}
            onPress={() => void saveUsername()}
            style={[styles.primaryButton, isSavingProfile ? styles.disabledButton : null]}
          >
            <Text style={styles.primaryButtonText}>
              {isSavingProfile ? "Saving username..." : "Save username"}
            </Text>
          </Pressable>
          {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
          {saveMessage ? <Text style={styles.walletMeta}>{saveMessage}</Text> : null}
        </View>

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
                disabled={isSavingProfilePhoto}
                onPress={() => void onPickProfilePhoto()}
                style={[styles.primaryButton, isSavingProfilePhoto ? styles.disabledButton : null]}
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

        <View style={styles.walletCard}>
          <Text style={styles.sectionLabel}>Recent wallet activity</Text>
          {activityError ? <Text style={styles.walletMeta}>{activityError}</Text> : null}
          {activity?.length ? (
            activity.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.activityRow}>
                <View style={styles.activityCopy}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityBody}>{item.detail}</Text>
                </View>
                <Text style={styles.activityMeta}>{formatActivityDate(item.createdAt)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.walletMeta}>
              Your send, swap, and staking actions will appear here once you use the live flows.
            </Text>
          )}
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
  usernameInput: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.blue,
    borderWidth: 3,
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    minHeight: 56,
    paddingHorizontal: 12,
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
  disabledButton: {
    opacity: 0.6,
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
  activityRow: {
    borderTopColor: COLORS.black,
    borderTopWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  activityCopy: {
    flex: 1,
    paddingRight: 12,
  },
  activityTitle: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "900",
  },
  activityBody: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 4,
  },
  activityMeta: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
});
