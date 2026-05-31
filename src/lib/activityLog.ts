import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { formatEther } from "viem";

import {
  HYPERCORE_CORE_WRITER_ADDRESS,
  HYPERCORE_HYPE_SYSTEM_ADDRESS,
} from "./hyperEvm";

const ACTIVITY_LOG_KEY = "hypa_activity_log_v1";
const MAX_ACTIVITY_ITEMS = 30;
const HYPERSCAN_API_URL = "https://www.hyperscan.com/api";

const STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type WalletActivityType =
  | "receive_hype"
  | "send_hype"
  | "move_to_spot"
  | "swap_order"
  | "stake_deposit"
  | "delegate"
  | "undelegate"
  | "withdraw_queue";

export type WalletActivityItem = {
  amount: string;
  createdAt: string;
  detail: string;
  hash?: `0x${string}`;
  id: string;
  title: string;
  type: WalletActivityType;
};

type HyperscanTransaction = {
  from: string;
  hash: `0x${string}`;
  input: string;
  isError?: string;
  methodId?: string;
  timeStamp: string;
  to: string;
  txreceipt_status?: string;
  value: string;
};

type HyperscanAccountResponse = {
  message?: string;
  result?: HyperscanTransaction[];
  status?: string;
};

function getActivityLogKey(address?: `0x${string}`) {
  return address ? `${ACTIVITY_LOG_KEY}_${address.toLowerCase()}` : ACTIVITY_LOG_KEY;
}

function shortenAddress(address: string) {
  if (!address || address.length < 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normalizeAddress(address?: string) {
  return address?.toLowerCase() ?? "";
}

function formatHype(valueWei: string) {
  try {
    const value = Number.parseFloat(formatEther(BigInt(valueWei)));

    if (!Number.isFinite(value)) {
      return "0 HYPE";
    }

    return `${value.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: value < 0.01 ? 4 : 0,
    })} HYPE`;
  } catch {
    return "0 HYPE";
  }
}

function transactionTimestampToIso(timestamp: string) {
  const seconds = Number.parseInt(timestamp, 10);

  if (!Number.isFinite(seconds)) {
    return new Date().toISOString();
  }

  return new Date(seconds * 1000).toISOString();
}

function mapTransactionToActivity(
  transaction: HyperscanTransaction,
  walletAddress: `0x${string}`,
): WalletActivityItem | null {
  const from = normalizeAddress(transaction.from);
  const to = normalizeAddress(transaction.to);
  const wallet = walletAddress.toLowerCase();
  const valueWei = BigInt(transaction.value || "0");
  const succeeded = transaction.txreceipt_status !== "0" && transaction.isError !== "1";
  const amountLabel = formatHype(transaction.value);
  const createdAt = transactionTimestampToIso(transaction.timeStamp);
  const baseItem = {
    createdAt,
    hash: transaction.hash,
    id: `chain-${transaction.hash}`,
  };

  if (!succeeded) {
    return {
      ...baseItem,
      amount: amountLabel,
      detail: "Transaction failed onchain.",
      title: "Failed transaction",
      type: "send_hype",
    };
  }

  if (from === wallet && to === normalizeAddress(HYPERCORE_HYPE_SYSTEM_ADDRESS)) {
    return {
      ...baseItem,
      amount: `-${amountLabel}`,
      detail: "Moved from Wallet HYPE into Trading HYPE.",
      title: "Moved HYPE to Trading",
      type: "move_to_spot",
    };
  }

  if (from === wallet && to === normalizeAddress(HYPERCORE_CORE_WRITER_ADDRESS)) {
    return {
      ...baseItem,
      amount: "Order",
      detail: "Submitted a Hyperliquid spot action.",
      title: "Swap order submitted",
      type: "swap_order",
    };
  }

  if (to === wallet && valueWei > 0n) {
    return {
      ...baseItem,
      amount: `+${amountLabel}`,
      detail: `From ${shortenAddress(transaction.from)}`,
      title: "Received HYPE",
      type: "receive_hype",
    };
  }

  if (from === wallet && valueWei > 0n) {
    return {
      ...baseItem,
      amount: `-${amountLabel}`,
      detail: `To ${shortenAddress(transaction.to)}`,
      title: "Sent HYPE",
      type: "send_hype",
    };
  }

  if (from === wallet) {
    return {
      ...baseItem,
      amount: "Action",
      detail: `To ${shortenAddress(transaction.to)}`,
      title: "Wallet action",
      type: "swap_order",
    };
  }

  return null;
}

function parseActivityLog(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as WalletActivityItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveWalletActivityLog(
  address: `0x${string}` | undefined,
  items: WalletActivityItem[],
) {
  await SecureStore.setItemAsync(
    getActivityLogKey(address),
    JSON.stringify(items.slice(0, MAX_ACTIVITY_ITEMS)),
    STORE_OPTIONS,
  );
}

export async function getWalletActivityLog(address?: `0x${string}`) {
  const rawValue = await SecureStore.getItemAsync(getActivityLogKey(address), STORE_OPTIONS);
  const addressScopedItems = parseActivityLog(rawValue);

  if (addressScopedItems.length || !address) {
    return addressScopedItems;
  }

  const legacyRawValue = await SecureStore.getItemAsync(ACTIVITY_LOG_KEY, STORE_OPTIONS);
  return parseActivityLog(legacyRawValue);
}

export async function appendWalletActivity(
  item: Omit<WalletActivityItem, "createdAt" | "id">,
  address?: `0x${string}`,
) {
  const existing = await getWalletActivityLog(address);
  const nextItem: WalletActivityItem = {
    ...item,
    createdAt: new Date().toISOString(),
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };
  await saveWalletActivityLog(address, [nextItem, ...existing]);
  return nextItem;
}

async function fetchHyperEvmActivity(address: `0x${string}`) {
  const response = await fetch(
    `${HYPERSCAN_API_URL}?module=account&action=txlist&address=${address}&sort=desc`,
  );

  if (!response.ok) {
    throw new Error(`Hyperscan activity request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as HyperscanAccountResponse;

  if (data.status !== "1" || !Array.isArray(data.result)) {
    return [];
  }

  return data.result
    .map((transaction) => mapTransactionToActivity(transaction, address))
    .filter((item): item is WalletActivityItem => item !== null);
}

function mergeActivityItems(items: WalletActivityItem[]) {
  const seenHashes = new Set<string>();
  const seenIds = new Set<string>();
  const merged: WalletActivityItem[] = [];

  items.forEach((item) => {
    if (item.hash) {
      const hash = item.hash.toLowerCase();

      if (seenHashes.has(hash)) {
        return;
      }

      seenHashes.add(hash);
    } else if (seenIds.has(item.id)) {
      return;
    }

    seenIds.add(item.id);
    merged.push(item);
  });

  return merged
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, MAX_ACTIVITY_ITEMS);
}

export function formatActivityDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

type ActivityLogState = {
  activity: WalletActivityItem[];
  error: string | null;
  refresh: () => Promise<void>;
};

export function useWalletActivityLog(address?: `0x${string}`): ActivityLogState {
  const [activity, setActivity] = useState<WalletActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const localActivity = await getWalletActivityLog(address);
      const chainActivity = address ? await fetchHyperEvmActivity(address) : [];
      setActivity(mergeActivityItems([...localActivity, ...chainActivity]));
      setError(null);
    } catch (caughtError) {
      const localActivity = await getWalletActivityLog(address);
      setActivity(localActivity);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load wallet activity.",
      );
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    activity,
    error,
    refresh,
  };
}
