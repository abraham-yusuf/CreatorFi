/**
 * Helper script to initialize the server-side wallet.
 * Run via: npx tsx scripts/init-wallet.ts
 */
import { getCoinbaseServerWallet } from "../lib/coinbase-wallet";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

/**
 * Main function to execute wallet initialization.
 */
async function main() {
  try {
    console.log("Initializing Server Wallets...");

    // We do NOT check for keys here anymore, because `getCoinbaseServerWallet` handles the fallback.

    const { evmAddress, solanaKeypair } = await getCoinbaseServerWallet();

    console.log("Wallets initialized.");

    // EVM Address
    console.log(`\n=== EVM (Base) Address ===\n${evmAddress}`);

    // SVM Address
    console.log(`\n=== SVM (Solana) Address ===\n${solanaKeypair.publicKey.toBase58()}`);

    console.log("\nPlease add these to your .env.local file as:");
    console.log(`NEXT_PUBLIC_BASE_MERCHANT_ADDRESS=${evmAddress}`);
    console.log(`NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS=${solanaKeypair.publicKey.toBase58()}`);

  } catch (error) {
    console.error("Error initializing wallet:", error);
  }
}

main();
