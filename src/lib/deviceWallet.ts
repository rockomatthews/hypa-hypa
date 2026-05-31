import { useCallback, useEffect, useState } from "react";
import { wordlist } from "@scure/bip39/wordlists/english";
import * as SecureStore from "expo-secure-store";
import { type HDAccount, generateMnemonic, mnemonicToAccount } from "viem/accounts";

const WALLET_METADATA_KEY = "hypa_wallet_meta_v1";
const WALLET_MNEMONIC_KEY = "hypa_wallet_mnemonic_v1";

const PUBLIC_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const PROTECTED_OPTIONS: SecureStore.SecureStoreOptions = {
  authenticationPrompt: "Unlock HYPA HYPA to access your recovery phrase.",
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  requireAuthentication: SecureStore.canUseBiometricAuthentication(),
};

function getProtectedOptions(authenticationPrompt: string) {
  return {
    ...PROTECTED_OPTIONS,
    authenticationPrompt,
  } satisfies SecureStore.SecureStoreOptions;
}

export type DeviceWalletMeta = {
  address: `0x${string}`;
  createdAt: string;
  usesBiometricSecurity: boolean;
};

type StoredWalletMeta = {
  address: string;
  createdAt: string;
  usesBiometricSecurity: boolean;
};

type DeviceWalletState = {
  createWallet: () => Promise<void>;
  dismissRecoveryPhrase: () => void;
  error: string | null;
  isCreating: boolean;
  isLoading: boolean;
  isRevealingRecoveryPhrase: boolean;
  recoveryPhrase: string | null;
  removeWallet: () => Promise<void>;
  revealRecoveryPhrase: () => Promise<void>;
  wallet: DeviceWalletMeta | null;
};

function parseWalletMeta(rawValue: string | null): DeviceWalletMeta | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredWalletMeta;

    if (!parsed.address || !parsed.createdAt) {
      return null;
    }

    return {
      address: parsed.address as `0x${string}`,
      createdAt: parsed.createdAt,
      usesBiometricSecurity: Boolean(parsed.usesBiometricSecurity),
    };
  } catch {
    return null;
  }
}

export async function unlockDeviceWalletAccount(
  authenticationPrompt = "Unlock HYPA HYPA to use your wallet.",
): Promise<HDAccount> {
  const storedPhrase = await SecureStore.getItemAsync(
    WALLET_MNEMONIC_KEY,
    getProtectedOptions(authenticationPrompt),
  );

  if (!storedPhrase) {
    throw new Error("Wallet recovery phrase is unavailable on this device.");
  }

  return mnemonicToAccount(storedPhrase);
}

export function useDeviceWallet(): DeviceWalletState {
  const [wallet, setWallet] = useState<DeviceWalletMeta | null>(null);
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevealingRecoveryPhrase, setIsRevealingRecoveryPhrase] = useState(false);

  const loadWallet = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedMeta = await SecureStore.getItemAsync(WALLET_METADATA_KEY, PUBLIC_OPTIONS);
      setWallet(parseWalletMeta(storedMeta));
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to load device wallet.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const createWallet = useCallback(async () => {
    setIsCreating(true);
    setError(null);

    try {
      const mnemonic = generateMnemonic(wordlist);
      const account = mnemonicToAccount(mnemonic);
      const nextWallet: DeviceWalletMeta = {
        address: account.address,
        createdAt: new Date().toISOString(),
        usesBiometricSecurity: SecureStore.canUseBiometricAuthentication(),
      };

      await SecureStore.setItemAsync(
        WALLET_MNEMONIC_KEY,
        mnemonic,
        PROTECTED_OPTIONS,
      );
      await SecureStore.setItemAsync(
        WALLET_METADATA_KEY,
        JSON.stringify(nextWallet),
        PUBLIC_OPTIONS,
      );

      setWallet(nextWallet);
      setRecoveryPhrase(mnemonic);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to create your device wallet.",
      );
    } finally {
      setIsCreating(false);
    }
  }, []);

  const revealRecoveryPhrase = useCallback(async () => {
    setIsRevealingRecoveryPhrase(true);
    setError(null);

    try {
      const storedPhrase = await SecureStore.getItemAsync(
        WALLET_MNEMONIC_KEY,
        PROTECTED_OPTIONS,
      );

      if (!storedPhrase) {
        throw new Error("Recovery phrase is unavailable on this device.");
      }

      setRecoveryPhrase(storedPhrase);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to unlock your recovery phrase.",
      );
    } finally {
      setIsRevealingRecoveryPhrase(false);
    }
  }, []);

  const dismissRecoveryPhrase = useCallback(() => {
    setRecoveryPhrase(null);
  }, []);

  const removeWallet = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_MNEMONIC_KEY, PROTECTED_OPTIONS);
      await SecureStore.deleteItemAsync(WALLET_METADATA_KEY, PUBLIC_OPTIONS);
      setWallet(null);
      setRecoveryPhrase(null);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to remove device wallet.",
      );
    }
  }, []);

  return {
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
  };
}
