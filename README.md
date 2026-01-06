# CreatorFi - Web3 Pay-Per-View Marketplace

Next.js application implementing a decentralized content marketplace with the x402 payment protocol for micropayments.

## Overview

CreatorFi allows creators to monetize digital content (articles, videos, audio) using crypto micropayments without intermediaries. Users pay only for specific content they want to access using their crypto wallets (no signup required).

## Features

- 🎨 **Creator Dashboard** - Upload and price digital content
- 💰 **Pay-Per-View** - Micropayments using USDC on Base/Solana
- 🔒 **x402 Protocol** - HTTP 402 payment-gated content delivery
- 🌐 **Multi-Chain** - Supports EVM (Base) and SVM (Solana) wallets
- 🔐 **Privacy First** - No email/login required, wallet-based access
- 📱 **Responsive** - Mobile-first design

## Prerequisites

- Node.js v20+ (install via [nvm](https://github.com/nvm-sh/nvm))
- pnpm v10 (install via [pnpm.io/installation](https://pnpm.io/installation))
- PostgreSQL database (recommended: [Supabase](https://supabase.com))
- Valid EVM and SVM addresses for receiving payments
- URL of a facilitator supporting the desired payment network, see [facilitator list](https://www.x402.org/ecosystem?category=facilitators)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd CreatorFi
pnpm install
```

### 2. Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions on setting up PostgreSQL with Supabase.

Quick steps:
1. Create a Supabase project
2. Copy your DATABASE_URL
3. Run migrations: `pnpm prisma migrate deploy`

### 3. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env
```

Fill in the required variables:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database"

# x402 Payment Protocol
FACILITATOR_URL="https://facilitator.x402.org"
EVM_ADDRESS="0x..."  # Your Ethereum/Base address
SVM_ADDRESS="..."    # Your Solana address

# Public merchant addresses
NEXT_PUBLIC_BASE_MERCHANT_ADDRESS="0x..."
NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS="..."

# App Configuration
NEXT_PUBLIC_HOST_URL="http://localhost:3000"
APP_NAME="CreatorFi"
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
CreatorFi/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── access/        # Content access verification (402 paywall)
│   │   └── weather/       # Example x402-protected API
│   ├── content/[id]/      # Dynamic content pages
│   ├── dashboard/         # Creator dashboard
│   └── protected/         # Example protected page
├── components/            # React components
│   ├── AccessController   # Client-side access management
│   ├── ContentPaywall     # Payment UI
│   └── Providers          # Wallet providers (Wagmi, Solana)
├── lib/                   # Utilities
│   ├── prisma.ts         # Database client
│   └── x402-client.ts    # x402 payment client
├── prisma/               # Database
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration files
├── proxy.ts              # x402 payment proxy configuration
└── scripts/              # Utility scripts
```

## x402 Payment Protocol Integration

This app demonstrates Coinbase's x402 payment protocol for HTTP 402 (Payment Required) responses.

### Key Concepts

**paymentProxy** - Protects entire page routes with payment requirements
**withX402** - Wraps individual API handlers for granular control

### Architecture

```
┌─────────────┐      402 Payment Required       ┌──────────────┐
│   Client    │ ◄──────────────────────────────┤   Server     │
│  (Browser)  │                                 │   (x402)     │
└─────────────┘                                 └──────────────┘
      │                                                │
      │  1. Request protected content                 │
      │ ──────────────────────────────────────────►   │
      │                                                │
      │  2. Return 402 + Payment Headers              │
      │ ◄──────────────────────────────────────────   │
      │                                                │
      │  3. User pays via wallet (EVM/SVM)            │
      │                                                │
      │  4. Request with payment proof                │
      │ ──────────────────────────────────────────►   │
      │                                                │
      │  5. Verify payment + Set cookie               │
      │                                                │
      │  6. Return 200 + Content                      │
      │ ◄──────────────────────────────────────────   │
```

### Protected Routes Example

See `proxy.ts` for page-level protection:
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";
import { svmPaywall } from "@x402/paywall/svm";

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const server = new x402ResourceServer(facilitatorClient);

// Register schemes
registerExactEvmScheme(server);
registerExactSvmScheme(server);

// Build paywall using builder pattern
const paywall = createPaywall()
  .withNetwork(evmPaywall)
  .withNetwork(svmPaywall)
  .withConfig({
    appName: "Next x402 Demo",
    appLogo: "/x402-icon-blue.png",
    testnet: true,
  })
  .build();

export const proxy = paymentProxy(
  {
    "/protected": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.001",
          network: "eip155:84532",
          payTo: evmAddress,
        },
        {
          scheme: "exact",
          price: "$0.001",
          network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
          payTo: svmAddress,
        },
      ],
      description: "Premium music: x402 Remix",
      mimeType: "text/html",
    },
  },
  server,
  undefined, // paywallConfig (using custom paywall instead)
  paywall,   // custom paywall provider
);

export const config = {
  matcher: ["/protected/:path*"],
};
```

### Weather API Route (using withX402)

The `/api/weather` route demonstrates the `withX402` wrapper for individual API routes:

```typescript
// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { server, paywall, evmAddress, svmAddress } from "../../../proxy";

const handler = async (_: NextRequest) => {
  return NextResponse.json({
    report: {
      weather: "sunny",
      temperature: 72,
    },
  });
};

export const GET = withX402(
  handler,
  {
    accepts: [
      {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:84532",
        payTo: evmAddress,
      },
      {
        scheme: "exact",
        price: "$0.001",
        network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
        payTo: svmAddress,
      },
    ],
    description: "Access to weather API",
    mimeType: "application/json",
  },
  server,
  undefined, // paywallConfig (using custom paywall from proxy.ts)
  paywall,
);
```

## Response Format

### Payment Required (402)

```
HTTP/1.1 402 Payment Required
Content-Type: application/json; charset=utf-8
PAYMENT-REQUIRED: <base64-encoded JSON>

{}
```

The `PAYMENT-REQUIRED` header contains base64-encoded JSON with the payment requirements.
Note: `amount` is in atomic units (e.g., 1000 = 0.001 USDC, since USDC has 6 decimals):

```json
{
  "x402Version": 2,
  "error": "Payment required",
  "resource": {
    "url": "http://localhost:3000/api/weather",
    "description": "Access to weather API",
    "mimeType": "application/json"
  },
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:84532",
      "amount": "1000",
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "payTo": "0x...",
      "maxTimeoutSeconds": 300,
      "extra": {
        "name": "USDC",
        "version": "2",
        "resourceUrl": "http://localhost:4021/weather"
      }   
    }
  ]
}
```

### Successful Response

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
PAYMENT-RESPONSE: <base64-encoded JSON>

{"report":{"weather":"sunny","temperature":72}}
```

The `PAYMENT-RESPONSE` header contains base64-encoded JSON with the settlement details:

```json
{
  "success": true,
  "transaction": "0x...",
  "network": "eip155:84532",
  "payer": "0x...",
  "requirements": {
    "scheme": "exact",
    "network": "eip155:84532",
    "amount": "1000",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "payTo": "0x...",
    "maxTimeoutSeconds": 300,
    "extra": {
      "name": "USDC",
      "version": "2",
      "resourceUrl": "http://localhost:4021/weather"
    }
  }
}
```

## paymentProxy vs withX402

The `paymentProxy` function is used to protect page routes. It can also protect API routes, however this will charge clients for failed API responses.

The `withX402` function wraps API route handlers. This is the recommended approach to protect API routes as it guarantees payment settlement only AFTER successful API responses (status < 400).

| Approach | Use Case |
|----------|----------|
| `paymentProxy` | Protecting page routes or multiple routes with a single configuration |
| `withX402` | Protecting individual API routes where you need precise control over settlement timing |

## Extending the Example

To add more protected routes, update the proxy configuration:

```typescript
export const proxy = paymentProxy(
  {
    "/protected": {
      accepts: {
        scheme: "exact",
        price: "$0.001",
        network: "eip155:84532",
        payTo: evmAddress,
      },
      description: "Access to protected content",
    },
    "/premium": {
      accepts: {
        scheme: "exact",
        price: "$0.10",
        network: "eip155:84532",
        payTo: evmAddress,
      },
      description: "Premium content access",
    },
  },
  server,
  undefined,
  paywall,
);

export const config = {
  matcher: ["/protected/:path*", "/premium/:path*"],
};
```

**Network identifiers** use [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) format, for example:
- `eip155:84532` — Base Sepolia (testnet)
- `eip155:8453` — Base Mainnet
- `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` — Solana Devnet
- `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` — Solana Mainnet

## Available Routes

### Public Routes
- `/` - Homepage with content marketplace grid
- `/dashboard/create` - Creator dashboard for uploading content

### Protected Routes (x402 Payment Required)
- `/content/[id]` - Individual content page (paywall enforced via API)
- `/protected` - Example protected page route

### API Routes
- `GET /api/access/[id]` - Content access verification (returns 402 or content)
- `GET /api/weather` - Example x402-protected API endpoint

## Database Management

```bash
# View database in browser
pnpm prisma studio

# Create new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations to production
pnpm prisma migrate deploy

# Reset database (development only)
pnpm prisma migrate reset

# Generate Prisma Client
pnpm prisma generate
```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for more details.

## Development Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:check       # Check linting without fixing
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting

# Database
pnpm prisma studio    # Open database GUI
pnpm prisma generate  # Generate Prisma Client
```

## Testing the Payment Flow

1. **Start the app**: `pnpm dev`
2. **Create content**:
   - Go to `/dashboard/create`
   - Connect your wallet
   - Fill in content details (title, price, etc.)
   - Submit
3. **View content**:
   - Navigate to the created content page
   - You'll see a paywall UI
   - Connect wallet and click "Pay"
   - After payment, content unlocks

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `DATABASE_URL` (from Supabase)
   - `FACILITATOR_URL`
   - `EVM_ADDRESS`
   - `SVM_ADDRESS`
   - `NEXT_PUBLIC_*` variables
4. Deploy

### Railway / Render

1. Connect your repository
2. Add environment variables
3. Set build command: `pnpm build`
4. Set start command: `pnpm start`

### Environment Variables for Production

Ensure these are set in your deployment platform:
- `DATABASE_URL` - Your production Supabase/PostgreSQL URL
- `NODE_ENV=production`
- All `NEXT_PUBLIC_*` variables must be set at build time

## Security Considerations

1. **Content Protection**: Content URLs and text are never exposed in HTML source before payment
2. **Payment Verification**: Uses secure HTTP-only cookies for access control
3. **Database**: Sensitive fields (`contentUrl`, `textContent`) only accessible via authenticated API
4. **Wallet Security**: No private keys stored; all transactions signed client-side

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure IP whitelisting in Supabase (if applicable)

### Payment Not Working
- Check wallet is connected
- Verify you have testnet USDC (for testnets)
- Check browser console for errors
- Ensure facilitator URL is accessible

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Payment**: x402 Protocol (@x402/next, @x402/core)
- **Wallets**: 
  - EVM: Wagmi + RainbowKit
  - Solana: @solana/wallet-adapter
- **Styling**: Tailwind CSS
- **Blockchain**: Base (EVM), Solana (SVM)

## Resources

- [PRD.md](./PRD.md) - Product Requirements Document
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide
- [x402 Protocol](https://www.x402.org) - Payment protocol docs
- [Prisma Docs](https://www.prisma.io/docs) - ORM documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
