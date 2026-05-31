import {
  createWalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  formatEther,
  http,
  isAddress,
  parseAbiParameters,
  parseUnits,
  type Hex,
} from "viem";

import { unlockDeviceWalletAccount } from "./deviceWallet";
import { HYPERCORE_CORE_WRITER_ADDRESS, hyperEvmChain, hyperEvmClient } from "./hyperEvm";

const CORE_WRITER_ABI = [
  {
    inputs: [{ name: "data", type: "bytes" }],
    name: "sendRawAction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

type PlaceSpotOrderInput = {
  amount: string;
  asset: number;
  authenticationPrompt?: string;
  isBuy: boolean;
  limitPrice: string;
};

type StakingAmountInput = {
  amount: string;
  authenticationPrompt?: string;
};

type TokenDelegateInput = {
  amount: string;
  authenticationPrompt?: string;
  isUndelegate?: boolean;
  validator: `0x${string}`;
};

function buildRawAction(actionId: number, encodedAction: Hex): Hex {
  const prefix = `0x01${actionId.toString(16).padStart(6, "0")}` as Hex;
  return `${prefix}${encodedAction.slice(2)}` as Hex;
}

async function submitRawCoreAction(
  rawAction: Hex,
  authenticationPrompt: string,
) {
  const account = await unlockDeviceWalletAccount(authenticationPrompt);
  const walletClient = createWalletClient({
    account,
    chain: hyperEvmChain,
    transport: http(hyperEvmChain.rpcUrls.default.http[0]),
  });
  const data = encodeFunctionData({
    abi: CORE_WRITER_ABI,
    functionName: "sendRawAction",
    args: [rawAction],
  });
  const hash = await walletClient.sendTransaction({
    account,
    data,
    to: HYPERCORE_CORE_WRITER_ADDRESS,
  });
  const receipt = await hyperEvmClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error("The HyperCore action transaction did not succeed onchain.");
  }

  return {
    from: account.address,
    hash,
    receipt,
  };
}

function parseCoreUnits(value: string, fieldName: string) {
  try {
    const parsed = parseUnits(value, 8);

    if (parsed <= 0n) {
      throw new Error();
    }

    return parsed;
  } catch {
    throw new Error(`Enter a valid ${fieldName} amount.`);
  }
}

function parseCoreWeiAmount(value: string, fieldName: string) {
  return parseCoreUnits(value, fieldName);
}

export async function placeHyperCoreSpotOrder({
  amount,
  asset,
  authenticationPrompt = "Unlock HYPA HYPA to submit a HyperCore swap.",
  isBuy,
  limitPrice,
}: PlaceSpotOrderInput) {
  const limitPx = parseCoreUnits(limitPrice, "price");
  const size = parseCoreUnits(amount, "size");
  const encodedAction = encodeAbiParameters(
    parseAbiParameters(
      "uint32 asset, bool isBuy, uint64 limitPx, uint64 sz, bool reduceOnly, uint8 encodedTif, uint128 cloid",
    ),
    [asset, isBuy, limitPx, size, false, 3, 0n],
  );
  const result = await submitRawCoreAction(buildRawAction(1, encodedAction), authenticationPrompt);

  return {
    ...result,
    amount,
    estimatedValueUsd: Number.parseFloat(limitPrice) * Number.parseFloat(amount),
    summary: `${isBuy ? "Buy" : "Sell"} ${amount} at limit ${limitPrice}`,
  };
}

export async function depositSpotHypeToStaking({
  amount,
  authenticationPrompt = "Unlock HYPA HYPA to move HYPE into staking.",
}: StakingAmountInput) {
  const wei = parseCoreWeiAmount(amount, "staking deposit");
  const encodedAction = encodeAbiParameters(parseAbiParameters("uint64 wei"), [wei]);
  const result = await submitRawCoreAction(buildRawAction(4, encodedAction), authenticationPrompt);

  return {
    ...result,
    amount,
    summary: `Moved ${amount} HYPE from HyperCore spot into staking.`,
  };
}

export async function withdrawStakingToSpotQueue({
  amount,
  authenticationPrompt = "Unlock HYPA HYPA to queue a staking withdrawal.",
}: StakingAmountInput) {
  const wei = parseCoreWeiAmount(amount, "staking withdrawal");
  const encodedAction = encodeAbiParameters(parseAbiParameters("uint64 wei"), [wei]);
  const result = await submitRawCoreAction(buildRawAction(5, encodedAction), authenticationPrompt);

  return {
    ...result,
    amount,
    summary: `Queued ${amount} HYPE to move from staking back to spot after the unstaking delay.`,
  };
}

export async function tokenDelegate({
  amount,
  authenticationPrompt = "Unlock HYPA HYPA to delegate stake.",
  isUndelegate = false,
  validator,
}: TokenDelegateInput) {
  if (!isAddress(validator)) {
    throw new Error("Enter a valid validator address.");
  }

  const wei = parseCoreWeiAmount(amount, isUndelegate ? "undelegation" : "delegation");
  const encodedAction = encodeAbiParameters(
    parseAbiParameters("address validator, uint64 wei, bool isUndelegate"),
    [validator, wei, isUndelegate],
  );
  const result = await submitRawCoreAction(buildRawAction(3, encodedAction), authenticationPrompt);

  return {
    ...result,
    amount,
    summary: `${isUndelegate ? "Undelegated" : "Delegated"} ${amount} HYPE ${isUndelegate ? "from" : "to"} ${validator}.`,
  };
}

export function describePendingCoreAction(hash: Hex) {
  return `HyperCore action submitted in EVM tx ${hash}. CoreWriter actions are processed after the HyperEVM block, so balances can take a few seconds to update.`;
}

export function formatActionFeeHint(gasCostWei: bigint) {
  return Number.parseFloat(formatEther(gasCostWei)).toFixed(6);
}
