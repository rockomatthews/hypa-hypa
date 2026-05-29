import { createPublicClient, defineChain, formatEther, http } from "viem";

export const hyperEvmChain = defineChain({
  id: 999,
  name: "HyperEVM",
  nativeCurrency: {
    decimals: 18,
    name: "HYPE",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid.xyz/evm"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hypurrscan",
      url: "https://hypurrscan.io",
    },
  },
});

export const hyperEvmClient = createPublicClient({
  chain: hyperEvmChain,
  transport: http(),
});

export function formatHypeBalance(balance: bigint) {
  const asNumber = Number.parseFloat(formatEther(balance));

  if (!Number.isFinite(asNumber)) {
    return "0.00";
  }

  if (asNumber >= 1000) {
    return asNumber.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  return asNumber.toFixed(4);
}
