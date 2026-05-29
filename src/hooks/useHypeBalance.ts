import { useCallback, useEffect, useState } from "react";

import { formatHypeBalance, hyperEvmClient } from "../lib/hyperEvm";

type HypeBalanceState = {
  balanceLabel: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useHypeBalance(
  address?: `0x${string}`,
): HypeBalanceState {
  const [balanceLabel, setBalanceLabel] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setBalanceLabel("0.00");
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balance = await hyperEvmClient.getBalance({ address });
      setBalanceLabel(formatHypeBalance(balance));
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to load HYPE balance.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    balanceLabel,
    isLoading,
    error,
    refresh,
  };
}
