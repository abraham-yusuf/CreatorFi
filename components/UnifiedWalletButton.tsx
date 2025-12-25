"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";

export function UnifiedWalletButton() {
  const [networkType, setNetworkType] = useState<"evm" | "svm">("evm");

  return (
    <div className="flex items-center gap-4">
      {/* Network Toggle (Simplified for demo) */}
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setNetworkType("evm")}
          className={`px-3 py-1 text-sm rounded-md transition-colors font-medium ${
            networkType === "evm"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Base
        </button>
        <button
          onClick={() => setNetworkType("svm")}
          className={`px-3 py-1 text-sm rounded-md transition-colors font-medium ${
            networkType === "svm"
              ? "bg-purple-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Solana
        </button>
      </div>

      {/* Wallet Connect Buttons */}
      <div className={networkType === "evm" ? "block" : "hidden"}>
        <ConnectButton
           chainStatus="icon"
           showBalance={false}
        />
      </div>
      <div className={networkType === "svm" ? "block" : "hidden"}>
        <WalletMultiButton style={{ backgroundColor: '#512da8' }} />
      </div>
    </div>
  );
}
