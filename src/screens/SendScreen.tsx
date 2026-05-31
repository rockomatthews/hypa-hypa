import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { isAddress } from "viem";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressWithCopy } from "../components/AddressWithCopy";
import { AppIcon } from "../components/AppIcon";
import { useHypeBalance } from "../hooks/useHypeBalance";
import { type WalletActivityType } from "../lib/activityLog";
import { getHypurrscanTxUrl } from "../lib/hyperEvm";
import { sendNativeHype } from "../lib/hyperEvmActions";
import { COLORS } from "../theme";

type SendScreenProps = {
  onClose: () => void;
  onCopyAddress: () => Promise<void>;
  onRecordActivity?: (entry: {
    amount: string;
    detail: string;
    hash?: `0x${string}`;
    title: string;
    type: WalletActivityType;
  }) => Promise<void>;
  onSent?: () => void;
  walletAddress?: `0x${string}`;
};

function formatHash(hash?: `0x${string}` | null) {
  if (!hash) {
    return null;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function SendScreen({
  onClose,
  onCopyAddress,
  onRecordActivity,
  onSent,
  walletAddress,
}: SendScreenProps) {
  const insets = useSafeAreaInsets();
  const { balanceLabel, error: balanceError, isLoading, refresh } = useHypeBalance(walletAddress);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipientLooksValid = recipient.trim().length > 0 && isAddress(recipient.trim());
  const submitLabel = isSubmitting ? "Sending..." : "Send HYPE";

  const handleSend = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setTxHash(null);

    if (!walletAddress) {
      setErrorMessage("Create or unlock your wallet first.");
      return;
    }

    if (!recipientLooksValid) {
      setErrorMessage("Enter a valid HyperEVM wallet address.");
      return;
    }

    if (recipient.trim().toLowerCase() === walletAddress.toLowerCase()) {
      setErrorMessage("Choose a different address than your own wallet.");
      return;
    }

    if (!amount.trim()) {
      setErrorMessage("Enter how much HYPE you want to send.");
      return;
    }

    setIsSubmitting(true);

    try {
      const transaction = await sendNativeHype({
        amount,
        to: recipient.trim() as `0x${string}`,
      });

      setTxHash(transaction.hash);
      setStatusMessage(
        `Sent ${amount.trim()} HYPE successfully. View the transaction on Hypurrscan: ${getHypurrscanTxUrl(transaction.hash)}`,
      );
      await onRecordActivity?.({
        amount: amount.trim(),
        detail: `Sent HYPE to ${recipient.trim()}.`,
        hash: transaction.hash,
        title: "Sent HYPE",
        type: "send_hype",
      });
      setAmount("");
      setRecipient("");
      await refresh();
      onSent?.();
    } catch (caughtError) {
      setErrorMessage(
        caughtError instanceof Error ? caughtError.message : "Failed to send HYPE.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <AppIcon color={COLORS.black} name="send" size={22} />
            </View>
            <Text style={styles.headerTitle}>Send</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>From</Text>
          <AddressWithCopy
            address={walletAddress}
            color="white"
            onCopyAddress={onCopyAddress}
            size="md"
          />
          <Text style={styles.balanceText}>
            {isLoading ? "Loading..." : `${balanceLabel} HYPE available`}
          </Text>
          {balanceError ? <Text style={styles.errorText}>{balanceError}</Text> : null}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.labelDark}>Destination</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setRecipient}
            placeholder="0x..."
            placeholderTextColor="rgba(5, 5, 5, 0.55)"
            style={styles.input}
            value={recipient}
          />
          <Text style={styles.helperText}>
            Send native HYPE on HyperEVM to any valid wallet address.
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.amountHeader}>
            <Text style={styles.labelDark}>Amount</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAmount(balanceLabel.replace(/,/g, ""))}
              style={styles.maxButton}
            >
              <Text style={styles.maxButtonText}>Max</Text>
            </Pressable>
          </View>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(5, 5, 5, 0.55)"
            style={styles.input}
            value={amount}
          />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Ready checks</Text>
          <Text style={styles.statusLine}>
            {recipient.length === 0
              ? "Enter a destination address."
              : recipientLooksValid
                ? "Destination address looks valid."
                : "Destination address is invalid."}
          </Text>
          <Text style={styles.statusLine}>
            {amount.trim().length === 0
              ? "Enter a HYPE amount."
              : "Network gas is paid in HYPE, so keep a small balance behind."}
          </Text>
          {txHash ? (
            <Text style={styles.statusLine}>Latest tx: {formatHash(txHash)}</Text>
          ) : null}
        </View>

        {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}
        {statusMessage ? <Text style={styles.successBanner}>{statusMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => void handleSend()}
          style={[styles.sendButton, isSubmitting ? styles.buttonDisabled : null]}
        >
          <Text style={styles.sendButtonText}>{submitLabel}</Text>
        </Pressable>
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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
  },
  closeButton: {
    alignItems: "center",
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  closeText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },
  card: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    gap: 10,
    marginTop: 24,
    padding: 16,
  },
  label: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  balanceText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
  },
  formSection: {
    marginTop: 20,
  },
  labelDark: {
    color: COLORS.yellow,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    color: COLORS.black,
    fontSize: 18,
    fontWeight: "800",
    minHeight: 58,
    paddingHorizontal: 14,
  },
  helperText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 10,
    opacity: 0.72,
  },
  amountHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  maxButton: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  maxButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statusCard: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    gap: 8,
    marginTop: 24,
    padding: 16,
  },
  statusTitle: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  statusLine: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  errorBanner: {
    color: COLORS.yellow,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 18,
  },
  successBanner: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 18,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    height: 62,
    justifyContent: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: COLORS.black,
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  errorText: {
    color: COLORS.yellow,
    fontSize: 12,
    fontWeight: "800",
  },
});
