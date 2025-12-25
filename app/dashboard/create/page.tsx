"use client";

import { createContent } from "@/app/actions";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { UnifiedWalletButton } from "@/components/UnifiedWalletButton";

export default function CreateContentPage() {
  const { address } = useAccount();
  const { publicKey } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    if (address) setWalletAddress(address);
    else if (publicKey) setWalletAddress(publicKey.toBase58());
    else setWalletAddress("");
  }, [address, publicKey]);

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Connect Wallet to Create Content</h1>
        <UnifiedWalletButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Content</h1>

        <form action={createContent} className="space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
          <input type="hidden" name="walletAddress" value={walletAddress} />

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input name="title" required className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="My Awesome Content" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea name="description" required rows={3} className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="What is this content about?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (USDC)</label>
              <input name="price" type="number" step="0.01" required className="w-full bg-black border border-gray-700 rounded-lg p-3 font-mono" placeholder="5.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select name="type" className="w-full bg-black border border-gray-700 rounded-lg p-3">
                <option value="ARTICLE">Article</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
             <input name="thumbnailUrl" type="url" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-gray-400" placeholder="https://..." />
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Content URL (Video/Audio)</label>
             <input name="contentUrl" type="url" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-gray-400" placeholder="https://..." />
             <p className="text-xs text-gray-500 mt-1">Leave blank if Article</p>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Body (Article Text)</label>
             <textarea name="body" rows={6} className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Write your article here..." />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
            Publish Content
          </button>
        </form>
      </div>
    </div>
  );
}
