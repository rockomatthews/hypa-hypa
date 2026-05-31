import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const VALIDATOR_BOOK_KEY = "hypa_validator_book_v1";
const MAX_VALIDATORS = 12;

const STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type SavedValidator = {
  address: `0x${string}`;
  lastUsedAt: string;
};

function parseValidatorBook(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as SavedValidator[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveValidatorBook(validators: SavedValidator[]) {
  await SecureStore.setItemAsync(
    VALIDATOR_BOOK_KEY,
    JSON.stringify(validators.slice(0, MAX_VALIDATORS)),
    STORE_OPTIONS,
  );
}

export async function getSavedValidators() {
  const rawValue = await SecureStore.getItemAsync(VALIDATOR_BOOK_KEY, STORE_OPTIONS);
  return parseValidatorBook(rawValue);
}

export async function rememberValidator(address: `0x${string}`) {
  const existing = await getSavedValidators();
  const normalized = address.toLowerCase() as `0x${string}`;
  const next = [
    {
      address: normalized,
      lastUsedAt: new Date().toISOString(),
    },
    ...existing.filter((entry) => entry.address.toLowerCase() !== normalized),
  ];
  await saveValidatorBook(next);
  return next;
}

type ValidatorBookState = {
  savedValidators: SavedValidator[];
  refresh: () => Promise<void>;
};

export function useValidatorBook(): ValidatorBookState {
  const [savedValidators, setSavedValidators] = useState<SavedValidator[]>([]);

  const refresh = useCallback(async () => {
    setSavedValidators(await getSavedValidators());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    refresh,
    savedValidators,
  };
}
