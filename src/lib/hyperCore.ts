const INFO_ENDPOINT = "https://api.hyperliquid.xyz/info";

export type SpotMetaToken = {
  evmContract: string | null;
  fullName: string | null;
  index: number;
  isCanonical: boolean;
  name: string;
  szDecimals: number;
  tokenId: string;
  weiDecimals: number;
};

export type SpotMetaPair = {
  index: number;
  isCanonical: boolean;
  name: string;
  tokens: [number, number];
};

export type SpotAssetContext = {
  dayNtlVlm?: string;
  markPx?: string;
  midPx?: string | null;
  prevDayPx?: string;
};

export type SpotBalance = {
  coin: string;
  entryNtl: string;
  hold: string;
  token: number;
  total: string;
};

export type SpotMetaResponse = {
  tokens: SpotMetaToken[];
  universe: SpotMetaPair[];
};

export type SpotMetaAndAssetCtxsResponse = [SpotMetaResponse, SpotAssetContext[]];

export type SpotClearinghouseStateResponse = {
  balances: SpotBalance[];
};

export type TokenDetailsResponse = {
  circulatingSupply?: string;
  deployGas?: string;
  deployTime?: string;
  deployer?: string;
  genesis?: {
    userBalances?: Array<[string, string]>;
  };
  markPx?: string;
  maxSupply?: string;
  midPx?: string;
  name?: string;
  nonCirculatingUserBalances?: Array<[string, string]>;
  prevDayPx?: string;
  seededUsdc?: string;
  totalSupply?: string;
};

export type CandleSnapshotItem = {
  T: number;
  c: string;
  h: string;
  i: string;
  l: string;
  n: number;
  o: string;
  s: string;
  t: number;
  v: string;
};

export type Delegation = {
  amount: string;
  lockedUntilTimestamp: number;
  validator: string;
};

export type DelegatorSummary = {
  delegated: string;
  nPendingWithdrawals: number;
  totalPendingWithdrawal: string;
  undelegated: string;
};

export type DelegatorReward = {
  delta: {
    rewards: {
      amount: string;
      validator: string;
    };
  };
  hash: string;
  time: number;
};

export type DelegatorHistoryItem = {
  delta: {
    delegate?: {
      amount: string;
      isUndelegate: boolean;
      validator: string;
    };
    unstake?: {
      amount: string;
    };
  };
  hash: string;
  time: number;
};

export type UserFeesResponse = {
  activeReferralDiscount: string;
  dailyUserVlm: Array<{ date: string; exchange: string; userAdd: string; userCross: string }>;
  feeSchedule: {
    add: string;
    cross: string;
  };
  userCrossRate: string;
  userAddRate: string;
  activeStakingDiscount?:
    | {
        bpsOfMaxSupply: string;
        discount: string;
      }
    | string
    | null;
  stakingLink?:
    | {
        stakingUser: string;
        type: string;
      }
    | string
    | null;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function postHyperCoreInfo<T>(body: Record<string, unknown>): Promise<T> {
  let lastStatus: number | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(INFO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    lastStatus = response.status;

    if (response.status !== 429 || attempt === 2) {
      break;
    }

    await wait(500 * (attempt + 1));
  }

  throw new Error(`HyperCore info request failed with status ${lastStatus ?? "unknown"}.`);
}

export function formatCompactAmount(rawValue: string, maximumFractionDigits = 4) {
  const parsed = Number.parseFloat(rawValue);

  if (!Number.isFinite(parsed)) {
    return rawValue;
  }

  if (Math.abs(parsed) >= 1000) {
    return parsed.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  return parsed.toLocaleString(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });
}

export function formatUtcDate(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
  });
}
