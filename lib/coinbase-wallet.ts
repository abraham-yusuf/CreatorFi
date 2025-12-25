import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { Keypair } from "@solana/web3.js";
import fs from "fs";
import path from "path";
import bs58 from "bs58";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const WALLET_FILE = path.resolve(process.cwd(), "wallet-seed.json");

interface WalletData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cdpWalletData?: any; // Data from Wallet.export()
  evmPrivateKey?: string; // Fallback for local dev
  solanaSecretKey: string; // Base58 encoded secret key
}

/**
 * Initializes the Coinbase SDK and loads/creates a server-side wallet.
 * Persists the wallet data to a local JSON file.
 *
 * @returns An object containing the EVM address and Solana Keypair.
 */
export async function getCoinbaseServerWallet() {
  let cdpWallet: Wallet | null = null;
  let evmAddress: string;
  let solanaKeypair: Keypair;

  const hasCdpKeys = process.env.COINBASE_API_KEY_NAME && process.env.COINBASE_API_KEY_PRIVATE_KEY;

  if (hasCdpKeys) {
    try {
      Coinbase.configureFromJson();
    } catch (e) {
      console.warn("Failed to configure Coinbase SDK, falling back to local keys.", e);
    }
  }

  if (fs.existsSync(WALLET_FILE)) {
    console.log("Loading existing wallets from:", WALLET_FILE);
    const fileContent = fs.readFileSync(WALLET_FILE, "utf-8");
    const data: WalletData = JSON.parse(fileContent);

    // Load EVM Wallet
    if (data.cdpWalletData && hasCdpKeys) {
      try {
        cdpWallet = await Wallet.import(data.cdpWalletData);
        evmAddress = (await cdpWallet.getDefaultAddress()).getId();
      } catch {
         console.warn("Failed to import CDP wallet, checking for local key...");
         if (data.evmPrivateKey) {
             const account = privateKeyToAccount(data.evmPrivateKey as `0x${string}`);
             evmAddress = account.address;
         } else {
             throw new Error("CDP Import failed and no local key found.");
         }
      }
    } else if (data.evmPrivateKey) {
        const account = privateKeyToAccount(data.evmPrivateKey as `0x${string}`);
        evmAddress = account.address;
    } else {
        // Should not happen if file exists and valid
        throw new Error("Invalid wallet file format");
    }

    // Load SVM Wallet
    const secretKey = bs58.decode(data.solanaSecretKey);
    solanaKeypair = Keypair.fromSecretKey(secretKey);

  } else {
    console.log("Creating new wallets...");

    // Create SVM Wallet (Solana Web3.js)
    solanaKeypair = Keypair.generate();
    const solanaSecret = bs58.encode(solanaKeypair.secretKey);
    const walletData: WalletData = { solanaSecretKey: solanaSecret };

    // Create EVM Wallet
    if (hasCdpKeys) {
        try {
            console.log("Attempting to create CDP Wallet...");
            cdpWallet = await Wallet.create();
            const cdpData = await cdpWallet.export();
            evmAddress = (await cdpWallet.getDefaultAddress()).getId();
            walletData.cdpWalletData = cdpData;
        } catch (e) {
            console.warn("CDP Wallet creation failed (likely auth), falling back to local viem key.", e);
            const pk = generatePrivateKey();
            const account = privateKeyToAccount(pk);
            evmAddress = account.address;
            walletData.evmPrivateKey = pk;
        }
    } else {
        console.log("No CDP keys found. Generating local EVM key via Viem...");
        const pk = generatePrivateKey();
        const account = privateKeyToAccount(pk);
        evmAddress = account.address;
        walletData.evmPrivateKey = pk;
    }

    fs.writeFileSync(WALLET_FILE, JSON.stringify(walletData, null, 2));
    console.log("Wallets saved to:", WALLET_FILE);
  }

  return {
    cdpWallet, // Might be null if using local key
    evmAddress,
    solanaKeypair
  };
}
