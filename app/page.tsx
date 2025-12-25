"use client";

import Image from "next/image";
import { UnifiedWalletButton } from "@/components/UnifiedWalletButton";
import { ContentPaywall } from "@/components/ContentPaywall";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-purple-500/30">

      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">X</div>
             <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
               X402 Creator Platform
             </span>
          </div>
          <UnifiedWalletButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero / Intro */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Monetize Any Content. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Any Chain. Instantly.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the first unified payment protocol for EVM and SVM.
            Connect your wallet and unlock premium content below.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* Item 1: Base (EVM) Article */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-800">
                    BASE NETWORK
                </span>
                <span className="text-sm text-gray-400">Article</span>
            </div>

            <ContentPaywall
                contentId="article-001"
                price={5}
                currency="USDC"
                chainId="base"
                contentType="article"
            >
                <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
                    <h2 className="text-3xl font-bold mb-6 text-white">The Future of Cross-Chain Payments</h2>
                    <div className="prose prose-invert max-w-none">
                        <p className="lead text-xl text-gray-300 mb-4">
                            Interoperability has long been the holy grail of blockchain technology.
                            With the advent of protocols like X402, we are finally seeing a bridge that doesn't just transfer tokens, but transfers value and access.
                        </p>
                        <p className="text-gray-400">
                            By leveraging server-side wallets powered by Coinbase CDP, creators can now abstract away the complexity of chain management.
                            The user simply pays in their preferred currency, and the protocol handles the verification and access control logic seamlessly...
                        </p>
                        <p className="text-gray-400 mt-4">
                            (This is the premium content you unlocked! You can now read the full analysis.)
                        </p>
                    </div>
                </div>
            </ContentPaywall>
          </div>

          {/* Item 2: Solana (SVM) Video */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-400 text-xs font-bold border border-purple-800">
                    SOLANA NETWORK
                </span>
                <span className="text-sm text-gray-400">Video</span>
            </div>

            <ContentPaywall
                contentId="video-001"
                price={0.1}
                currency="SOL"
                chainId="solana"
                contentType="video"
                thumbnailUrl="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000&auto=format&fit=crop"
            >
                <div className="bg-black rounded-xl overflow-hidden border border-gray-800 aspect-video relative">
                    {/* Simulated Unlocked Video Player */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4 animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-white text-xl font-bold">Content Unlocked!</h3>
                            <p className="text-gray-400 mt-2">The video would play here.</p>
                        </div>
                    </div>
                </div>
            </ContentPaywall>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>&copy; 2024 X402 Demo. Powered by Coinbase CDP & Solana.</p>
        </footer>

      </main>
    </div>
  );
}
