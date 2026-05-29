import { useCallback, useEffect, useState } from "react";

import {
  type Delegation,
  type DelegatorHistoryItem,
  type DelegatorReward,
  type DelegatorSummary,
  type UserFeesResponse,
  postHyperCoreInfo,
} from "../lib/hyperCore";

type HyperCoreStakingState = {
  delegations: Delegation[];
  error: string | null;
  history: DelegatorHistoryItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  rewards: DelegatorReward[];
  summary: DelegatorSummary | null;
  userFees: UserFeesResponse | null;
};

export function useHyperCoreStaking(address?: `0x${string}`): HyperCoreStakingState {
  const [summary, setSummary] = useState<DelegatorSummary | null>(null);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [rewards, setRewards] = useState<DelegatorReward[]>([]);
  const [history, setHistory] = useState<DelegatorHistoryItem[]>([]);
  const [userFees, setUserFees] = useState<UserFeesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setSummary(null);
      setDelegations([]);
      setRewards([]);
      setHistory([]);
      setUserFees(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextSummary, nextDelegations, nextRewards, nextHistory, nextUserFees] =
        await Promise.all([
          postHyperCoreInfo<DelegatorSummary>({ type: "delegatorSummary", user: address }),
          postHyperCoreInfo<Delegation[]>({ type: "delegations", user: address }),
          postHyperCoreInfo<DelegatorReward[]>({ type: "delegatorRewards", user: address }),
          postHyperCoreInfo<DelegatorHistoryItem[]>({ type: "delegatorHistory", user: address }),
          postHyperCoreInfo<UserFeesResponse>({ type: "userFees", user: address }),
        ]);

      setSummary(nextSummary);
      setDelegations(nextDelegations);
      setRewards(nextRewards);
      setHistory(nextHistory);
      setUserFees(nextUserFees);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load HyperCore staking data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    delegations,
    error,
    history,
    isLoading,
    refresh,
    rewards,
    summary,
    userFees,
  };
}
