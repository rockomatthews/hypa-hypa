import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const PROFILE_KEY_PREFIX = "hypa_wallet_profile_v1";

const STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type WalletProfile = {
  username: string;
  updatedAt: string;
};

type WalletProfileState = {
  error: string | null;
  isSaving: boolean;
  profile: WalletProfile;
  refresh: () => Promise<void>;
  saveUsername: (username: string) => Promise<void>;
};

const emptyProfile: WalletProfile = {
  updatedAt: "",
  username: "",
};

function getProfileKey(address?: `0x${string}`) {
  return `${PROFILE_KEY_PREFIX}_${address?.toLowerCase() ?? "no_wallet"}`;
}

function parseProfile(rawValue: string | null): WalletProfile {
  if (!rawValue) {
    return emptyProfile;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<WalletProfile>;

    return {
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      username: typeof parsed.username === "string" ? parsed.username : "",
    };
  } catch {
    return emptyProfile;
  }
}

function normalizeUsername(username: string) {
  return username.trim().replace(/\s+/g, " ").slice(0, 24);
}

export async function getWalletProfile(address?: `0x${string}`) {
  const rawValue = await SecureStore.getItemAsync(getProfileKey(address), STORE_OPTIONS);
  return parseProfile(rawValue);
}

export async function saveWalletUsername(address: `0x${string}` | undefined, username: string) {
  if (!address) {
    throw new Error("Create or unlock your wallet first.");
  }

  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername.length < 2) {
    throw new Error("Username must be at least 2 characters.");
  }

  const profile: WalletProfile = {
    updatedAt: new Date().toISOString(),
    username: normalizedUsername,
  };

  await SecureStore.setItemAsync(getProfileKey(address), JSON.stringify(profile), STORE_OPTIONS);
  return profile;
}

export function useWalletProfile(address?: `0x${string}`): WalletProfileState {
  const [profile, setProfile] = useState<WalletProfile>(emptyProfile);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const nextProfile = await getWalletProfile(address);
      setProfile(nextProfile);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load wallet profile.",
      );
    }
  }, [address]);

  const saveUsername = useCallback(
    async (username: string) => {
      setIsSaving(true);
      setError(null);

      try {
        const nextProfile = await saveWalletUsername(address, username);
        setProfile(nextProfile);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to save username.",
        );
        throw caughtError;
      } finally {
        setIsSaving(false);
      }
    },
    [address],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    error,
    isSaving,
    profile,
    refresh,
    saveUsername,
  };
}
