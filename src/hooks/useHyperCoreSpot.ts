import { useCallback, useEffect, useState } from "react";

import {
  type SpotBalance,
  type SpotMetaAndAssetCtxsResponse,
  type SpotMetaToken,
  formatCompactAmount,
  postHyperCoreInfo,
  type SpotClearinghouseStateResponse,
} from "../lib/hyperCore";

export type SwapTokenOption = {
  balance: string;
  balanceLabel: string;
  dailyVolume: string | null;
  displayName: string;
  isInWallet: boolean;
  midPrice: string | null;
  spotPairIndex: number;
  symbol: string;
  tokenId: string;
  tokenIndex: number;
};

type HyperCoreSpotState = {
  balances: SpotBalance[];
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  swapOptions: SwapTokenOption[];
};

function buildSwapOptions(
  spotMeta: SpotMetaAndAssetCtxsResponse[0],
  assetContexts: SpotMetaAndAssetCtxsResponse[1],
  balances: SpotBalance[],
) {
  const balanceByToken = new Map<number, SpotBalance>();

  balances.forEach((balance) => {
    balanceByToken.set(balance.token, balance);
  });

  return spotMeta.universe
    .map((pair) => {
      const [baseTokenIndex, quoteTokenIndex] = pair.tokens;

      if (quoteTokenIndex !== 0) {
        return null;
      }

      const token = spotMeta.tokens.find((entry) => entry.index === baseTokenIndex);

      if (!token) {
        return null;
      }

      const assetContext = assetContexts[pair.index];
      const spotBalance = balanceByToken.get(baseTokenIndex);

      return {
        balance: spotBalance?.total ?? "0",
        balanceLabel: formatCompactAmount(spotBalance?.total ?? "0"),
        dailyVolume: assetContext?.dayNtlVlm ?? null,
        displayName: token.fullName ?? token.name,
        isInWallet: Number.parseFloat(spotBalance?.total ?? "0") > 0,
        midPrice: assetContext?.midPx ?? assetContext?.markPx ?? null,
        spotPairIndex: pair.index,
        symbol: token.name,
        tokenId: token.tokenId,
        tokenIndex: token.index,
      } satisfies SwapTokenOption;
    })
    .filter((entry): entry is SwapTokenOption => Boolean(entry))
    .sort((left, right) => {
      if (left.isInWallet !== right.isInWallet) {
        return left.isInWallet ? -1 : 1;
      }

      return left.symbol.localeCompare(right.symbol);
    });
}

export function useHyperCoreSpot(address?: `0x${string}`): HyperCoreSpotState {
  const [balances, setBalances] = useState<SpotBalance[]>([]);
  const [swapOptions, setSwapOptions] = useState<SwapTokenOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [spotMetaAndAssetCtxs, spotState] = await Promise.all([
        postHyperCoreInfo<SpotMetaAndAssetCtxsResponse>({ type: "spotMetaAndAssetCtxs" }),
        address
          ? postHyperCoreInfo<SpotClearinghouseStateResponse>({
              type: "spotClearinghouseState",
              user: address,
            })
          : Promise.resolve({ balances: [] } satisfies SpotClearinghouseStateResponse),
      ]);

      const [spotMeta, assetContexts] = spotMetaAndAssetCtxs;
      setBalances(spotState.balances);
      setSwapOptions(buildSwapOptions(spotMeta, assetContexts, spotState.balances));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load HyperCore spot data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    balances,
    error,
    isLoading,
    refresh,
    swapOptions,
  };
}
