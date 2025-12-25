"use client";

import { useState } from "react";
import { UnifiedWalletButton } from "./UnifiedWalletButton";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">
            X
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hidden sm:block">
            X402 Creator Platform
          </span>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 sm:hidden">
            X402
          </span>
        </div>

        {/* Desktop Wallet Button */}
        <div className="hidden md:block">
          <UnifiedWalletButton />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#0a0a0a] border-b border-gray-800 p-4 shadow-2xl animate-fade-in-down">
          <div className="flex flex-col gap-4">
             <div className="p-4 border border-gray-800 rounded-xl bg-gray-900/50">
                <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-bold">Connect</p>
                <div className="flex justify-center">
                    <UnifiedWalletButton />
                </div>
             </div>
             {/* Placeholder for future links */}
             {/* <nav className="flex flex-col gap-2">
                 <a href="#" className="p-2 text-gray-300 hover:bg-gray-800 rounded">Home</a>
             </nav> */}
          </div>
        </div>
      )}
    </header>
  );
}
