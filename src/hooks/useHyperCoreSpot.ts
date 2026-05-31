import { useCallback, useEffect, useState } from "react";

import {
  type CandleSnapshotItem,
  type SpotBalance,
  type SpotMetaAndAssetCtxsResponse,
  formatCompactAmount,
  postHyperCoreInfo,
  type SpotClearinghouseStateResponse,
  type TokenDetailsResponse,
} from "../lib/hyperCore";

export type SwapTokenOption = {
  balance: string;
  balanceLabel: string;
  candleCoin: string | null;
  dailyVolume: string | null;
  displayName: string;
  initials: string;
  isInWallet: boolean;
  marketCapLabel: string | null;
  marketCapUsd: number | null;
  midPrice: string | null;
  priceChangePercent: number | null;
  priceChangeLabel: string | null;
  spotPairIndex: number | null;
  symbol: string;
  szDecimals: number;
  tokenId: string;
  tokenIndex: number;
  weiDecimals: number;
};

const tokenDetailsCache = new Map<string, Promise<TokenDetailsResponse | null>>();
const candleCache = new Map<string, Promise<CandleSnapshotItem[]>>();
const spotMetaCache: {
  data: SpotMetaAndAssetCtxsResponse;
  fetchedAt: number;
} = {
  data: [{ tokens: [], universe: [] }, []],
  fetchedAt: 0,
};
const spotStateCache = new Map<
  string,
  {
    data: SpotClearinghouseStateResponse;
    fetchedAt: number;
    request: Promise<SpotClearinghouseStateResponse> | null;
  }
>();
const spotOptionsCache = new Map<string, SwapTokenOption[]>();
let spotMetaRequest: Promise<SpotMetaAndAssetCtxsResponse> | null = null;
const SPOT_META_CACHE_MS = 30_000;
const SPOT_STATE_CACHE_MS = 15_000;
const DISPLAY_SYMBOL_OVERRIDES: Record<string, { displayName: string; symbol: string }> = {
  UADA: { displayName: "Cardano", symbol: "ADA" },
  UAPT: { displayName: "Aptos", symbol: "APT" },
  UAVAX: { displayName: "Avalanche", symbol: "AVAX" },
  UBCH: { displayName: "Bitcoin Cash", symbol: "BCH" },
  UBNB: { displayName: "BNB", symbol: "BNB" },
  UBTC: { displayName: "Bitcoin", symbol: "BTC" },
  UDOGE: { displayName: "Dogecoin", symbol: "DOGE" },
  UETH: { displayName: "Ethereum", symbol: "ETH" },
  UFART: { displayName: "Fartcoin", symbol: "FARTCOIN" },
  UJUP: { displayName: "Jupiter", symbol: "JUP" },
  ULINK: { displayName: "Chainlink", symbol: "LINK" },
  ULTC: { displayName: "Litecoin", symbol: "LTC" },
  UPUMP: { displayName: "Pump.fun", symbol: "PUMP" },
  USOL: { displayName: "Solana", symbol: "SOL" },
  USUI: { displayName: "Sui", symbol: "SUI" },
  UTRX: { displayName: "TRON", symbol: "TRX" },
  UXLM: { displayName: "Stellar", symbol: "XLM" },
  UXMR: { displayName: "Monero", symbol: "XMR" },
  UXRP: { displayName: "XRP", symbol: "XRP" },
  UZEC: { displayName: "Zcash", symbol: "ZEC" },
  XMR1: { displayName: "Monero", symbol: "XMR" },
};

type HyperCoreSpotState = {
  balances: SpotBalance[];
  error: string | null;
  isLoading: boolean;
  refresh: (options?: { force?: boolean }) => Promise<void>;
  swapOptions: SwapTokenOption[];
};

export type CandleRange = "1H" | "1D" | "1W" | "1M" | "ALL";

const candleRangeConfig: Record<CandleRange, { interval: string; lookbackMs: number }> = {
  "1H": { interval: "1m", lookbackMs: 60 * 60 * 1000 },
  "1D": { interval: "15m", lookbackMs: 24 * 60 * 60 * 1000 },
  "1W": { interval: "4h", lookbackMs: 7 * 24 * 60 * 60 * 1000 },
  "1M": { interval: "1d", lookbackMs: 30 * 24 * 60 * 60 * 1000 },
  ALL: { interval: "1d", lookbackMs: 365 * 24 * 60 * 60 * 1000 },
};

function isInternalRouteName(name: string) {
  return /^@\d+$/.test(name.trim());
}

function deriveSymbol(tokenName: string, tokenDetails?: TokenDetailsResponse | null) {
  const detailsName = tokenDetails?.name?.trim();

  if (detailsName && !isInternalRouteName(detailsName)) {
    return detailsName;
  }

  return tokenName.trim();
}

function normalizeDisplaySymbol(symbol: string, fallbackDisplayName: string | null | undefined) {
  const override = DISPLAY_SYMBOL_OVERRIDES[symbol.toUpperCase()];

  if (override) {
    return override;
  }

  return {
    displayName: fallbackDisplayName?.trim() || symbol,
    symbol,
  };
}

function formatMarketCap(value: number | null) {
  if (!Number.isFinite(value ?? Number.NaN) || value === null || value <= 0) {
    return null;
  }

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(value >= 10_000_000_000 ? 1 : 2)}B MC`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value >= 100_000_000 ? 1 : 2)}M MC`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(value >= 100_000 ? 1 : 2)}K MC`;
  }

  return `$${value.toFixed(2)} MC`;
}

function calculatePriceChange(currentPrice: string | null | undefined, previousPrice: string | null | undefined) {
  const current = Number.parseFloat(currentPrice ?? "");
  const previous = Number.parseFloat(previousPrice ?? "");

  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatPriceChange(change: number | null) {
  if (!Number.isFinite(change ?? Number.NaN) || change === null) {
    return null;
  }

  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function getInitials(symbol: string, displayName: string) {
  const source = displayName && !isInternalRouteName(displayName) ? displayName : symbol;
  const words = source
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return symbol.slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function sortSwapOptions(options: SwapTokenOption[]) {
  return options.sort((left, right) => {
    if (left.isInWallet !== right.isInWallet) {
      return left.isInWallet ? -1 : 1;
    }

    const leftVolume = Number.parseFloat(left.dailyVolume ?? "0");
    const rightVolume = Number.parseFloat(right.dailyVolume ?? "0");

    if (leftVolume !== rightVolume) {
      return rightVolume - leftVolume;
    }

    return (right.marketCapUsd ?? 0) - (left.marketCapUsd ?? 0);
  });
}

function calculateMarketCap(details: TokenDetailsResponse | null | undefined, fallbackPrice: string | null) {
  const supply = Number.parseFloat(details?.circulatingSupply ?? details?.totalSupply ?? "");
  const price = Number.parseFloat(details?.midPx ?? details?.markPx ?? fallbackPrice ?? "");

  if (!Number.isFinite(supply) || !Number.isFinite(price) || supply <= 0 || price <= 0) {
    return null;
  }

  return supply * price;
}

async function getTokenDetails(tokenId: string) {
  const cached = tokenDetailsCache.get(tokenId);

  if (cached) {
    return cached;
  }

  const request = postHyperCoreInfo<TokenDetailsResponse>({
    type: "tokenDetails",
    tokenId,
  }).catch(() => {
    tokenDetailsCache.delete(tokenId);
    return null;
  });

  tokenDetailsCache.set(tokenId, request);
  return request;
}

export function getCachedHyperCoreTokenDetails(tokenId: string) {
  return getTokenDetails(tokenId);
}

export function getCachedHyperCoreCandles(coin: string, range: CandleRange) {
  const config = candleRangeConfig[range];
  const endTime = Date.now();
  const startTime = endTime - config.lookbackMs;
  const cacheKey = `${coin}:${range}:${Math.floor(endTime / 60_000)}`;
  const cached = candleCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const request = postHyperCoreInfo<CandleSnapshotItem[]>({
    type: "candleSnapshot",
    req: {
      coin,
      interval: config.interval,
      startTime,
      endTime,
    },
  }).catch(() => []);

  candleCache.set(cacheKey, request);
  return request;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getTokenDetailsMap(tokenIds: string[]) {
  const entries: Array<readonly [string, TokenDetailsResponse | null]> = [];

  for (let index = 0; index < tokenIds.length; index += 4) {
    const batch = tokenIds.slice(index, index + 4);
    const batchEntries = await Promise.all(
      batch.map(async (tokenId) => [tokenId, await getTokenDetails(tokenId)] as const),
    );

    entries.push(...batchEntries);

    if (index + 4 < tokenIds.length) {
      await wait(150);
    }
  }

  return new Map(entries);
}

async function getSpotMetaAndAssetContexts(force = false) {
  const now = Date.now();

  if (!force && spotMetaCache.data[0].tokens.length && now - spotMetaCache.fetchedAt < SPOT_META_CACHE_MS) {
    return spotMetaCache.data;
  }

  if (!force && spotMetaRequest) {
    return spotMetaRequest;
  }

  spotMetaRequest = postHyperCoreInfo<SpotMetaAndAssetCtxsResponse>({
    type: "spotMetaAndAssetCtxs",
  })
    .then((data) => {
      spotMetaCache.data = data;
      spotMetaCache.fetchedAt = Date.now();
      return data;
    })
    .finally(() => {
      spotMetaRequest = null;
    });

  return spotMetaRequest;
}

async function getSpotState(address?: `0x${string}`, force = false) {
  if (!address) {
    return { balances: [] } satisfies SpotClearinghouseStateResponse;
  }

  const cached = spotStateCache.get(address);
  const now = Date.now();

  if (!force && cached?.data && now - cached.fetchedAt < SPOT_STATE_CACHE_MS) {
    return cached.data;
  }

  if (!force && cached?.request) {
    return cached.request;
  }

  const request = postHyperCoreInfo<SpotClearinghouseStateResponse>({
    type: "spotClearinghouseState",
    user: address,
  })
    .then((data) => {
      spotStateCache.set(address, {
        data,
        fetchedAt: Date.now(),
        request: null,
      });
      return data;
    })
    .catch((caughtError) => {
      if (cached?.data) {
        return cached.data;
      }

      throw caughtError;
    });

  spotStateCache.set(address, {
    data: cached?.data ?? { balances: [] },
    fetchedAt: cached?.fetchedAt ?? 0,
    request,
  });

  return request;
}

function buildSwapOptions(
  spotMeta: SpotMetaAndAssetCtxsResponse[0],
  assetContexts: SpotMetaAndAssetCtxsResponse[1],
  balances: SpotBalance[],
  detailsByTokenId: Map<string, TokenDetailsResponse | null>,
) {
  const balanceByToken = new Map<number, SpotBalance>();

  balances.forEach((balance) => {
    balanceByToken.set(balance.token, balance);
  });

  const tokenByIndex = new Map(spotMeta.tokens.map((token) => [token.index, token]));
  const usdcToken = tokenByIndex.get(0);
  const usdcBalance = balanceByToken.get(0);
  const routedOptions: Array<SwapTokenOption | null> = spotMeta.universe
    .map((pair) => {
      const [baseTokenIndex, quoteTokenIndex] = pair.tokens;

      if (quoteTokenIndex !== 0) {
        return null;
      }

      const token = tokenByIndex.get(baseTokenIndex);

      if (!token) {
        return null;
      }

      const assetContext = assetContexts[pair.index];
      const spotBalance = balanceByToken.get(baseTokenIndex);
      const tokenDetails = detailsByTokenId.get(token.tokenId);
      const rawSymbol = deriveSymbol(token.name, tokenDetails);
      const normalizedDisplay = normalizeDisplaySymbol(rawSymbol, token.fullName);
      const symbol = normalizedDisplay.symbol;
      const midPrice = tokenDetails?.midPx ?? assetContext?.midPx ?? assetContext?.markPx ?? null;
      const priceChangePercent = calculatePriceChange(
        tokenDetails?.midPx ?? tokenDetails?.markPx ?? assetContext?.midPx ?? assetContext?.markPx,
        tokenDetails?.prevDayPx ?? assetContext?.prevDayPx,
      );
      const marketCapUsd = calculateMarketCap(tokenDetails, midPrice);
      const displayName = normalizedDisplay.displayName;

      return {
        balance: spotBalance?.total ?? "0",
        balanceLabel: formatCompactAmount(spotBalance?.total ?? "0"),
        candleCoin: pair.name,
        dailyVolume: assetContext?.dayNtlVlm ?? null,
        displayName,
        initials: getInitials(symbol, displayName),
        isInWallet: Number.parseFloat(spotBalance?.total ?? "0") > 0,
        marketCapLabel: formatMarketCap(marketCapUsd),
        marketCapUsd,
        midPrice,
        priceChangeLabel: formatPriceChange(priceChangePercent),
        priceChangePercent,
        spotPairIndex: pair.index,
        symbol,
        szDecimals: token.szDecimals,
        tokenId: token.tokenId,
        tokenIndex: token.index,
        weiDecimals: token.weiDecimals,
      };
    });

  const options: SwapTokenOption[] = usdcToken
    ? (() => {
        const usdcDetails = detailsByTokenId.get(usdcToken.tokenId);
        const rawUsdcSymbol = deriveSymbol(usdcToken.name, usdcDetails);
        const normalizedUsdcDisplay = normalizeDisplaySymbol(
          rawUsdcSymbol,
          usdcToken.fullName ?? "USD Coin",
        );
        const usdcSymbol = normalizedUsdcDisplay.symbol;
        const usdcDisplayName = normalizedUsdcDisplay.displayName;
        const usdcMarketCapUsd = calculateMarketCap(usdcDetails, "1.00");
        const usdcPriceChangePercent = calculatePriceChange(
          usdcDetails?.midPx ?? usdcDetails?.markPx ?? "1.00",
          usdcDetails?.prevDayPx ?? "1.00",
        );

        return [
          {
            balance: usdcBalance?.total ?? "0",
            balanceLabel: formatCompactAmount(usdcBalance?.total ?? "0"),
            candleCoin: null,
            dailyVolume: null,
            displayName: usdcDisplayName,
            initials: getInitials(usdcSymbol, usdcDisplayName),
            isInWallet: Number.parseFloat(usdcBalance?.total ?? "0") > 0,
            marketCapLabel: formatMarketCap(usdcMarketCapUsd),
            marketCapUsd: usdcMarketCapUsd,
            midPrice: usdcDetails?.midPx ?? usdcDetails?.markPx ?? "1.00",
            priceChangeLabel: formatPriceChange(usdcPriceChangePercent),
            priceChangePercent: usdcPriceChangePercent,
            spotPairIndex: null,
            symbol: usdcSymbol,
            szDecimals: usdcToken.szDecimals,
            tokenId: usdcToken.tokenId,
            tokenIndex: usdcToken.index,
            weiDecimals: usdcToken.weiDecimals,
          },
          ...routedOptions.filter((entry): entry is SwapTokenOption => entry !== null),
        ];
      })()
    : routedOptions.filter((entry): entry is SwapTokenOption => entry !== null);

  return sortSwapOptions(options);
}

export function useHyperCoreSpot(address?: `0x${string}`): HyperCoreSpotState {
  const [balances, setBalances] = useState<SpotBalance[]>([]);
  const [swapOptions, setSwapOptions] = useState<SwapTokenOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    const cacheKey = address ?? "public";
    const force = options?.force ?? false;
    setIsLoading(true);
    setError(null);

    try {
      const [spotMetaAndAssetCtxs, spotState] = await Promise.all([
        getSpotMetaAndAssetContexts(force),
        getSpotState(address, force),
      ]);

      const [spotMeta, assetContexts] = spotMetaAndAssetCtxs;
      const routedTokenIds = new Set<string>();
      const tokenByIndex = new Map(spotMeta.tokens.map((token) => [token.index, token]));

      spotMeta.universe.forEach((pair) => {
        const [baseTokenIndex, quoteTokenIndex] = pair.tokens;
        const token = tokenByIndex.get(baseTokenIndex);

        if (quoteTokenIndex === 0 && token) {
          routedTokenIds.add(token.tokenId);
        }
      });

      const usdcToken = tokenByIndex.get(0);
      if (usdcToken) {
        routedTokenIds.add(usdcToken.tokenId);
      }

      setBalances(spotState.balances);
      const initialOptions = buildSwapOptions(spotMeta, assetContexts, spotState.balances, new Map());
      setSwapOptions(initialOptions);
      spotOptionsCache.set(cacheKey, initialOptions);
      setIsLoading(false);

      const priorityTokenIds = initialOptions
        .slice(0, 12)
        .map((option) => option.tokenId);

      void getTokenDetailsMap(priorityTokenIds)
        .then((priorityDetailsByTokenId) => {
          const detailedOptions = buildSwapOptions(
            spotMeta,
            assetContexts,
            spotState.balances,
            priorityDetailsByTokenId,
          );
          setSwapOptions(detailedOptions);
          spotOptionsCache.set(cacheKey, detailedOptions);
        })
        .catch(() => undefined);
    } catch (caughtError) {
      const cachedOptions = spotOptionsCache.get(cacheKey) ?? spotOptionsCache.get("public");

      if (cachedOptions?.length) {
        setSwapOptions(cachedOptions);
        setError(null);
      } else {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load HyperCore spot data.",
        );
      }
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
