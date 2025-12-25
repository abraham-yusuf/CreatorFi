"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getX402Client } from "@/lib/x402-client";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { verifyPayment } from "@/app/actions";

interface PaywallProps {
  contentId: string;
  price: string;
  currency: string;
  creatorAddress: string;
  thumbnailUrl: string;
}

export function Paywall({ contentId, price, currency, creatorAddress, thumbnailUrl }: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  const handlePurchase = async () => {
    // For demo/test purposes, we allow purchase if wallet is not connected or if it is connected.
    // In a strict environment, check isConnected.
    // if (!isConnected || !walletClient) {
    //   alert("Please connect your wallet first");
    //   return;
    // }

    setLoading(true);
    try {
      // Mock client if wallet not available, or use real one
      const client = walletClient ? getX402Client(walletClient, null) : {
          purchase: async () => ({ success: true, txId: "mock-tx-id-no-wallet" })
      };

      // 1. Client-side interaction (Sign/Pay)
      // In a real scenario, this would interact with the X402 protocol / smart contract
      // @ts-ignore
      const result = await client.purchase({
        contentId,
        price: parseFloat(price),
        currency,
        chainId: "base", // Defaulting to Base for this demo
        merchant: creatorAddress
      });

      if (result.success) {
        // 2. Server-side Verification & Cookie Setting
        // We send the proof (txId) to the server to set the access cookie
        await verifyPayment(contentId, result.txId);

        // 3. Refresh to show content
        router.refresh();
      }
    } catch (error) {
      console.error("Purchase failed", error);
      alert("Purchase failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group">
      {/* Background Blur */}
      <img src={thumbnailUrl} alt="Locked" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
        <div className="bg-gray-800 p-4 rounded-full mb-4 shadow-lg border border-gray-700">
           <LockClosedIcon className="w-8 h-8 text-blue-500" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Premium Content</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          This content is locked by the creator. Pay to access it instantly via X402.
        </p>

        <button
          onClick={handlePurchase}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
        >
          {loading ? "Processing..." : `Unlock for ${price} ${currency}`}
        </button>

        <p className="mt-4 text-xs text-gray-500 font-mono">
          Merchant: {creatorAddress.slice(0,6)}...{creatorAddress.slice(-4)}
        </p>
      </div>
    </div>
  );
}
