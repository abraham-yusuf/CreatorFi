import { toClientEvmSigner } from "@x402/evm";
import { toClientSvmSigner } from "@x402/svm";

// Mocking the Client interface based on user requirements
// since the installed @x402/core version 2 does not export 'Client'.
/**
 * A mock client for the X402 protocol.
 */
class X402Client {
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: any[] = [];

  /**
   * Creates a new X402Client.
   *
   * @param config - The client configuration.
   * @param config.projectId - The project ID.
   */
  constructor({ projectId }: { projectId: string }) {
    this.projectId = projectId;
  }

  /**
   * Registers a plugin.
   *
   * @param plugin - The plugin to register.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerPlugin(plugin: any) {
    this.plugins.push(plugin);
  }

  /**
   * Simulates a purchase.
   *
   * @param params - The purchase parameters.
   * @returns The transaction result.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async purchase(params: any) {
    console.log("X402 Client Purchase Triggered:", params);

    // Simulate async network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here we would use the registered plugins (signers) to execute the transaction
    return { success: true, txId: "mock-tx-id" };
  }
}

/**
 * Initialize the X402 Client.
 * Adapts the available @x402/evm and @x402/svm helpers to the requested structure.
 *
 * @param evmWalletClient - The EVM wallet client (Viem).
 * @param solanaWalletAdapter - The Solana wallet adapter.
 * @returns The initialized X402 Client.
 */
export function getX402Client(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evmWalletClient: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solanaWalletAdapter: any,
) {
  // Merchant addresses from Env
  const evmMerchant = process.env.NEXT_PUBLIC_BASE_MERCHANT_ADDRESS;
  const solMerchant = process.env.NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS;

  const client = new X402Client({
    projectId: process.env.NEXT_PUBLIC_X402_PROJECT_ID || "demo-project",
  });

  // Register EVM Signer
  if (evmWalletClient && evmMerchant) {
    try {
      const signer = toClientEvmSigner(evmWalletClient);
      client.registerPlugin({ type: "evm", signer, merchant: evmMerchant });
    } catch (e) {
      console.warn("Failed to create EVM signer", e);
    }
  }

  // Register SVM Signer
  if (solanaWalletAdapter && solMerchant) {
    try {
      const signer = toClientSvmSigner(solanaWalletAdapter);
      client.registerPlugin({ type: "svm", signer, merchant: solMerchant });
    } catch (e) {
      console.warn("Failed to create SVM signer", e);
    }
  }

  return client;
}
