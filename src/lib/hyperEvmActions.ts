import {
  createWalletClient,
  type Hex,
  formatEther,
  http,
  isAddress,
  parseEther,
  type TransactionReceipt,
} from "viem";

import { unlockDeviceWalletAccount } from "./deviceWallet";
import {
  HYPERCORE_HYPE_SYSTEM_ADDRESS,
  hyperEvmChain,
  hyperEvmClient,
} from "./hyperEvm";

type SendNativeHypeInput = {
  amount: string;
  authenticationPrompt?: string;
  to: `0x${string}`;
};

type SubmittedHyperEvmTransaction = {
  amountWei: bigint;
  from: `0x${string}`;
  hash: Hex;
  receipt: TransactionReceipt;
};

function parseAmountToWei(amount: string) {
  const trimmed = amount.trim();

  if (!trimmed) {
    throw new Error("Enter a HYPE amount first.");
  }

  let amountWei: bigint;

  try {
    amountWei = parseEther(trimmed);
  } catch {
    throw new Error("Enter a valid HYPE amount.");
  }

  if (amountWei <= 0n) {
    throw new Error("Amount must be greater than zero.");
  }

  return amountWei;
}

function formatInsufficientFundsMessage(
  balanceWei: bigint,
  amountWei: bigint,
  feeWei: bigint,
) {
  const spendable = Number.parseFloat(formatEther(balanceWei));
  const requested = Number.parseFloat(formatEther(amountWei));
  const estimatedFee = Number.parseFloat(formatEther(feeWei));

  return `Not enough HYPE for this transaction. You have ${spendable.toFixed(4)} HYPE, you tried to send ${requested.toFixed(4)} HYPE, and the estimated network fee is about ${estimatedFee.toFixed(6)} HYPE.`;
}

export async function sendNativeHype({
  amount,
  authenticationPrompt = "Unlock HYPA HYPA to send HYPE.",
  to,
}: SendNativeHypeInput): Promise<SubmittedHyperEvmTransaction> {
  if (!isAddress(to)) {
    throw new Error("Enter a valid HyperEVM wallet address.");
  }

  const amountWei = parseAmountToWei(amount);
  const account = await unlockDeviceWalletAccount(authenticationPrompt);
  const walletClient = createWalletClient({
    account,
    chain: hyperEvmChain,
    transport: http(hyperEvmChain.rpcUrls.default.http[0]),
  });
  const [balanceWei, gasEstimate, feesPerGas] = await Promise.all([
    hyperEvmClient.getBalance({ address: account.address }),
    hyperEvmClient.estimateGas({
      account: account.address,
      to,
      value: amountWei,
    }),
    hyperEvmClient.estimateFeesPerGas(),
  ]);
  const maxFeePerGas = feesPerGas.maxFeePerGas ?? feesPerGas.gasPrice;

  if (!maxFeePerGas) {
    throw new Error("Failed to estimate current HyperEVM gas fees.");
  }

  const totalRequiredWei = amountWei + gasEstimate * maxFeePerGas;

  if (balanceWei < totalRequiredWei) {
    throw new Error(
      formatInsufficientFundsMessage(balanceWei, amountWei, gasEstimate * maxFeePerGas),
    );
  }

  const hash = await walletClient.sendTransaction({
    account,
    to,
    value: amountWei,
  });
  const receipt = await hyperEvmClient.waitForTransactionReceipt({ hash });

  if (receipt.status !== "success") {
    throw new Error("The HYPE transfer was submitted but did not succeed onchain.");
  }

  return {
    amountWei,
    from: account.address,
    hash,
    receipt,
  };
}

export async function moveHypeToHyperCoreSpot(amount: string) {
  return sendNativeHype({
    amount,
    authenticationPrompt: "Unlock HYPA HYPA to move HYPE into HyperCore spot.",
    to: HYPERCORE_HYPE_SYSTEM_ADDRESS,
  });
}
