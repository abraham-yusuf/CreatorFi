# x402 Payment Protocol Integration Guide

This guide explains how CreatorFi integrates with the Coinbase x402 payment protocol for decentralized content micropayments.

## What is x402?

x402 is a payment protocol that extends HTTP with a standardized "402 Payment Required" status code. It enables seamless cryptocurrency micropayments for digital content without requiring user accounts or subscriptions.

## Architecture Overview

```
┌─────────────────┐
│   User Browser  │
│  (Web3 Wallet)  │
└────────┬────────┘
         │
         │ 1. Request content
         ▼
┌─────────────────┐      402 Required       ┌──────────────────┐
│   Next.js App   │◄────────────────────────│  @x402/next      │
│   (Frontend)    │                         │  (Middleware)    │
└────────┬────────┘                         └──────────────────┘
         │                                           │
         │ 2. Payment via wallet                     │
         │    (EVM or SVM)                          │
         ▼                                           ▼
┌─────────────────┐                         ┌──────────────────┐
│   Facilitator   │─────────Verify─────────►│   Blockchain     │
│   (x402 Server) │                         │   (Base/Solana)  │
└─────────────────┘                         └──────────────────┘
         │
         │ 3. Set access cookie
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
```

## Key Components

### 1. Payment Proxy (`proxy.ts`)

The main x402 configuration file that sets up payment requirements for routes.

```typescript
import { paymentProxy } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient({ 
  url: process.env.FACILITATOR_URL 
});

// Create resource server
const server = new x402ResourceServer(facilitatorClient);

// Register payment schemes
registerExactEvmScheme(server);  // Ethereum/Base
registerExactSvmScheme(server);  // Solana

// Configure protected routes
export const proxy = paymentProxy(
  {
    "/protected": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.001",
          network: "eip155:84532", // Base Sepolia
          payTo: evmAddress,
        },
        {
          scheme: "exact",
          price: "$0.001",
          network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", // Solana Devnet
          payTo: svmAddress,
        },
      ],
      description: "Premium content access",
      mimeType: "text/html",
    },
  },
  server,
  undefined,
  paywall,
);
```

### 2. API Route Protection

Use `withX402` to protect individual API endpoints:

```typescript
// app/api/access/[id]/route.ts
import { withX402 } from "@x402/next";

const handler = async (req: NextRequest) => {
  // Your API logic
  return NextResponse.json({ data: "protected content" });
};

export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.01",
        network: "eip155:84532",
        payTo: merchantAddress,
      }
    ],
    description: "Access to content",
    mimeType: "application/json",
  },
  server,
  undefined,
  paywall,
);
```

### 3. Client-Side Payment Flow

The client handles payment requests and wallet interactions:

```typescript
// components/ContentPaywall.tsx
import { getX402Client } from "@/lib/x402-client";

// Initialize client with wallet adapters
const client = getX402Client(evmWalletClient, solanaWalletAdapter);

// Make payment
const result = await client.purchase({
  contentId,
  price,
  currency: "USDC",
  network: selectedNetwork, // "evm" or "svm"
});

// After payment, verify and set cookie
await verifyPayment(contentId, result.txId);
```

## Payment Flow Sequence

### 1. Initial Request (Unpaid)

```http
GET /api/access/abc123 HTTP/1.1
Host: creatorfi.example
```

**Response:**
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
PAYMENT-REQUIRED: <base64-encoded-payment-info>

{ "error": "Payment Required" }
```

**Decoded PAYMENT-REQUIRED header:**
```json
{
  "x402Version": 2,
  "error": "Payment required",
  "resource": {
    "url": "https://creatorfi.example/api/access/abc123",
    "description": "Premium video content",
    "mimeType": "application/json"
  },
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:84532",
      "amount": "1000000",  // 1 USDC (6 decimals)
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "maxTimeoutSeconds": 300
    }
  ]
}
```

### 2. User Makes Payment

User connects wallet and signs transaction:
- For EVM: USDC transfer via smart contract
- For SVM: SPL token transfer

Transaction is broadcast to blockchain and confirmed.

### 3. Payment Verification

```typescript
// Server action (app/actions.ts)
export async function verifyPayment(contentId: string, txId: string) {
  // In production: verify txId on-chain
  
  // Set secure HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(`x402-access-${contentId}`, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
  
  return { success: true };
}
```

### 4. Subsequent Request (Paid)

```http
GET /api/access/abc123 HTTP/1.1
Host: creatorfi.example
Cookie: x402-access-abc123=true
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
PAYMENT-RESPONSE: <base64-encoded-settlement>

{
  "type": "VIDEO",
  "data": "https://cdn.example.com/video/abc123.mp4"
}
```

## Database Integration

### Content Schema

```prisma
model Content {
  id             String   @id @default(cuid())
  title          String
  price          Decimal  @default(0)
  currency       String   @default("USDC")
  
  // Protected fields (only via API after payment)
  contentUrl     String?
  textContent    String?
  
  // x402 payment recipient
  creatorAddress String   // Wallet address for direct payments
  
  creatorId      String
  creator        User     @relation(fields: [creatorId], references: [id])
}
```

The `creatorAddress` field enables direct peer-to-peer payments from consumers to creators, bypassing intermediaries.

## Network Configuration

### Supported Networks

| Network | CAIP-2 ID | Type | Currency |
|---------|-----------|------|----------|
| Base Sepolia | `eip155:84532` | Testnet | USDC |
| Base Mainnet | `eip155:8453` | Mainnet | USDC |
| Solana Devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | Testnet | USDC |
| Solana Mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | Mainnet | USDC |

### Environment Variables

```env
# x402 Configuration
FACILITATOR_URL=https://facilitator.x402.org
EVM_ADDRESS=0x...  # Your Base wallet
SVM_ADDRESS=...    # Your Solana wallet

# Public merchant addresses (client-side)
NEXT_PUBLIC_BASE_MERCHANT_ADDRESS=0x...
NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS=...
```

## Price Configuration

Prices are specified in USD using the `$` prefix:

```typescript
price: "$0.001"  // 0.1 cent
price: "$0.01"   // 1 cent
price: "$1.00"   // 1 dollar
price: "$5.50"   // 5 dollars 50 cents
```

The facilitator converts USD to token amounts based on:
- Asset decimals (USDC = 6 decimals)
- Current exchange rates
- Network gas fees

## Security Considerations

### 1. Content Protection

✅ **Good**: Content URLs never in HTML source
```typescript
// Server-side only
const content = await prisma.content.findUnique({
  where: { id },
  select: { id: true, title: true, price: true }
  // NOT selecting contentUrl or textContent
});
```

❌ **Bad**: Exposing URLs before payment
```typescript
// DON'T DO THIS
<div data-video-url={content.contentUrl}></div>
```

### 2. Cookie Security

```typescript
cookieStore.set(`x402-access-${contentId}`, "true", {
  httpOnly: true,        // Prevents JavaScript access
  secure: true,          // HTTPS only (production)
  sameSite: "strict",    // CSRF protection
  maxAge: 604800,        // 1 week expiry
});
```

### 3. On-Chain Verification (Production)

For production, verify transactions on-chain:

```typescript
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

async function verifyEvmTransaction(txHash: string, expectedAmount: bigint) {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });
  
  const receipt = await client.getTransactionReceipt({ hash: txHash });
  // Verify receipt details match payment requirements
  
  return receipt.status === 'success';
}
```

## Testing

### Local Testing

1. **Use testnet networks**:
   - Base Sepolia (EVM)
   - Solana Devnet (SVM)

2. **Get testnet tokens**:
   - Base Sepolia: [Bridge faucet](https://bridge.base.org)
   - Solana Devnet: `solana airdrop 1`

3. **Test payment flow**:
   ```bash
   pnpm dev
   # Navigate to /content/[id]
   # Connect wallet
   # Make test payment
   ```

### Integration Tests

```typescript
// Example test (Jest/Vitest)
describe('x402 Payment Flow', () => {
  it('should return 402 without payment', async () => {
    const response = await fetch('/api/access/test-id');
    expect(response.status).toBe(402);
    expect(response.headers.get('PAYMENT-REQUIRED')).toBeDefined();
  });
  
  it('should return content with valid payment cookie', async () => {
    const response = await fetch('/api/access/test-id', {
      headers: {
        Cookie: 'x402-access-test-id=true'
      }
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
  });
});
```

## Troubleshooting

### Issue: 402 but payment doesn't unlock content

**Check:**
- Cookie is being set correctly (check DevTools > Application > Cookies)
- Cookie name matches format: `x402-access-${contentId}`
- Cookie domain is correct

### Issue: Transaction succeeds but server returns 402

**Check:**
- `verifyPayment()` server action is being called
- Server action completes successfully
- Page refreshes after payment

### Issue: Wallet prompts but transaction fails

**Check:**
- Sufficient balance (including gas fees)
- Correct network selected
- Token approval granted (for ERC20)
- Recipient address is valid

## Best Practices

1. **Always use HTTPS in production** - Required for secure cookies
2. **Implement retry logic** - Network requests can fail
3. **Show clear error messages** - Help users understand issues
4. **Log payment attempts** - For debugging and analytics
5. **Set reasonable timeouts** - `maxTimeoutSeconds: 300` (5 minutes)
6. **Test on testnets first** - Avoid real money losses
7. **Monitor facilitator health** - Have fallback mechanisms

## Resources

- [x402 Protocol Specification](https://www.x402.org/spec)
- [x402 JavaScript SDK](https://github.com/coinbase/x402-js)
- [Facilitator List](https://www.x402.org/ecosystem?category=facilitators)
- [CAIP-2 Network IDs](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md)

## Support

For x402-specific issues:
- GitHub: [@x402/next](https://github.com/coinbase/x402-js)
- Documentation: [x402.org](https://www.x402.org)

For CreatorFi implementation:
- See [README.md](./README.md)
- Review [PRD.md](./PRD.md)
