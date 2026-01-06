# Database Setup Guide

This guide explains how to set up the PostgreSQL database for CreatorFi using Supabase.

## Overview

CreatorFi uses PostgreSQL as its database, managed through Prisma ORM. The application supports Supabase for easy PostgreSQL hosting with additional features like real-time subscriptions (optional).

## Prerequisites

- [Supabase account](https://supabase.com) (free tier available)
- Node.js v20+
- pnpm v10

## Quick Setup with Supabase

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `creatorfi` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

### 2. Get Your Database URL

1. After project creation, go to **Project Settings** > **Database**
2. Scroll to **Connection string** section
3. Choose **URI** format
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supabase connection string:
   ```env
   # Database (Supabase PostgreSQL)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

   # X402 Payment Configuration
   FACILITATOR_URL=https://facilitator.x402.org
   EVM_ADDRESS=your_ethereum_address
   SVM_ADDRESS=your_solana_address

   # Public merchant addresses for client-side payments
   NEXT_PUBLIC_BASE_MERCHANT_ADDRESS=your_base_merchant_address
   NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS=your_solana_merchant_address
   
   # App Configuration
   NEXT_PUBLIC_HOST_URL=http://localhost:3000
   APP_NAME="CreatorFi"
   APP_LOGO="/x402-icon-blue.png"
   ```

### 4. Run Database Migrations

Apply the database schema:

```bash
pnpm prisma migrate deploy
```

Or for development with migration generation:

```bash
pnpm prisma migrate dev
```

### 5. Generate Prisma Client

```bash
pnpm prisma generate
```

This is automatically run during `pnpm install` via the `postinstall` script.

### 6. (Optional) Seed Test Data

Run the seed script to populate with sample content:

```bash
node scripts/seed-test.cjs
```

or

```bash
npx tsx scripts/seed-test.ts
```

## Database Schema

The database includes two main tables:

### User Table
- `id` - Unique identifier (CUID)
- `walletAddress` - Ethereum/Solana wallet address (unique)
- `username` - Optional display name
- `createdAt` - Timestamp

### Content Table
- `id` - Unique identifier (CUID)
- `title` - Content title
- `description` - Content description
- `thumbnailUrl` - Preview image URL
- `type` - Content type (ARTICLE, VIDEO, AUDIO)
- `price` - Price in USDC (Decimal)
- `currency` - Payment currency (default: USDC)
- `contentUrl` - URL for video/audio files (private, only via API)
- `textContent` - Article body text (private, only via API)
- `creatorId` - Foreign key to User
- `creatorAddress` - Creator wallet address (for x402 payments)
- `createdAt` - Timestamp

## x402 Payment Protocol Integration

The database is designed to work seamlessly with the x402 payment protocol:

1. **Creator Address Storage**: Each content stores `creatorAddress` for direct peer-to-peer payments
2. **Access Control**: Payment verification uses cookies (`x402-access-[contentId]`)
3. **Privacy**: Protected content (`contentUrl`, `textContent`) is only accessible after payment verification
4. **Multi-chain Support**: Supports both EVM (Ethereum/Base) and SVM (Solana) payments

### Payment Flow
1. User views content metadata (free)
2. Client checks payment via `/api/access/[id]`
3. API returns 402 if unpaid, with x402 payment headers
4. User pays via x402 protocol (EVM or SVM)
5. Payment verified, cookie set
6. Content unlocked and delivered

## Prisma Studio (Database GUI)

View and edit your database data:

```bash
pnpm prisma studio
```

Opens at `http://localhost:5555`

## Useful Commands

```bash
# View current database schema
pnpm prisma db pull

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Create a new migration
pnpm prisma migrate dev --name your_migration_name

# Format Prisma schema
pnpm prisma format

# Validate schema
pnpm prisma validate
```

## Alternative: Local PostgreSQL

If you prefer local development:

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb creatorfi
   ```
3. Update `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/creatorfi"
   ```
4. Run migrations as above

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check if your IP is allowed in Supabase (Project Settings > Database > Connection pooling)
- Ensure password is correctly escaped in the URL

### Migration Errors
- Make sure DATABASE_URL is set before running migrations
- Check Supabase project is active and not paused
- Try `pnpm prisma migrate reset` to start fresh (development only)

### Schema Sync Issues
```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

## Security Notes

1. **Never commit `.env`** - It contains sensitive credentials
2. **Use connection pooling** for production (Supabase provides this)
3. **Enable Row Level Security (RLS)** in Supabase for additional protection
4. **Rotate database passwords** regularly in production

## Production Deployment

For production on Vercel/Railway/etc:

1. Add `DATABASE_URL` to your platform's environment variables
2. Run migrations as part of build:
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && next build"
     }
   }
   ```
3. Consider using Supabase connection pooling for better performance

## Support

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [x402 Protocol Docs](https://www.x402.org)
