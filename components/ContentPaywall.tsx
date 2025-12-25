"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getX402Client } from "../lib/x402-client";
import { LockClosedIcon, PlayIcon } from "@heroicons/react/24/solid";

interface ContentPaywallProps {
  contentId: string;
  price: number;
  currency: string;
  chainId: "base" | "solana";
  contentType: "article" | "video" | "audio";
  children: ReactNode;
  thumbnailUrl?: string; // For video/audio placeholder
}

export function ContentPaywall({
  contentId,
  price,
  currency,
  chainId,
  contentType,
  children,
  thumbnailUrl,
}: ContentPaywallProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // EVM Hooks
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
  const { data: evmWalletClient } = useWalletClient();

  // SVM Hooks
  const { publicKey: solPublicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  // Construct adapter-like object for X402 if needed (depending on plugin requirements)
  const solanaAdapter = solPublicKey ? {
      publicKey: solPublicKey,
      signTransaction,
      signAllTransactions,
  } : null;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      console.log(`Initiating purchase for ${contentId} on ${chainId}...`);

      const client = getX402Client(evmWalletClient, solanaAdapter);

      if (chainId === "base" && !isEvmConnected) {
        alert("Please connect your Base wallet first.");
        setLoading(false);
        return;
      }
      if (chainId === "solana" && !solPublicKey) {
        alert("Please connect your Solana wallet first.");
        setLoading(false);
        return;
      }

      // Execute purchase via the X402 Client (Mock or Real)
      const result = await client.purchase({ contentId, price, currency, chainId });

      if (result.success) {
        setIsUnlocked(true);
        console.log("Purchase successful!", result.txId);
      } else {
        throw new Error("Transaction failed");
      }

      setLoading(false);

    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. See console.");
      setLoading(false);
    }
  };

  if (isUnlocked) {
    return <div className="animate-fade-in">{children}</div>;
  }

  // Locked State Rendering
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-xl group">

      {/* Content Preview / Blur Wrapper */}
      <div className="relative">
        {contentType === "article" && (
            <div className="p-6 h-64 overflow-hidden relative">
                <h3 className="text-2xl font-bold text-gray-100 mb-4">Exclusive Analysis</h3>
                <p className="text-gray-300">
                    In the rapidly evolving landscape of Web3, protocols like X402 are redefining how creators monetize content.
                    This article dives deep into the technical architecture...
                </p>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900 backdrop-blur-[2px] mt-24" />
            </div>
        )}

        {contentType === "video" && (
            <div className="aspect-video bg-gray-800 relative flex items-center justify-center">
                {thumbnailUrl && <img src={thumbnailUrl} alt="Locked Video" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                <div className="z-10 bg-black/50 p-4 rounded-full backdrop-blur-sm">
                    <PlayIcon className="h-12 w-12 text-white/80" />
                </div>
            </div>
        )}

        {contentType === "audio" && (
             <div className="p-6 bg-gray-800 flex items-center gap-4">
                 <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <PlayIcon className="h-6 w-6 text-white" />
                 </div>
                 <div className="flex-1">
                     <div className="h-2 bg-gray-600 rounded full w-full mb-2"></div>
                     <p className="text-sm text-gray-400">Preview: 0:10 / 4:20</p>
                 </div>
             </div>
        )}

        {/* Lock Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px] opacity-100 transition-opacity">
            <LockClosedIcon className="h-12 w-12 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
            <p className="text-gray-300 mb-6">Unlock to verify access</p>

            <button
                onClick={handlePurchase}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Processing..." : `Buy for ${price} ${currency}`}
            </button>
            <p className="mt-4 text-xs text-gray-400">
                via {chainId === "base" ? "Base (EVM)" : "Solana (SVM)"}
            </p>
        </div>
      </div>
    </div>
  );
}
