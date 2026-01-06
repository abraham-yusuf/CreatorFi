# CreatorFi Setup Checklist

This checklist ensures you have everything configured correctly for the CreatorFi platform with x402 payment protocol.

## Prerequisites Checklist

- [ ] Node.js v20+ installed
- [ ] pnpm v10 installed
- [ ] Git installed
- [ ] Supabase account created (or local PostgreSQL installed)
- [ ] EVM wallet address (for Base/Ethereum)
- [ ] Solana wallet address

## Initial Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd CreatorFi
pnpm install
```
- [ ] Repository cloned
- [ ] Dependencies installed successfully

### 2. Database Setup

#### Option A: Supabase (Recommended)
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get your DATABASE_URL from Project Settings > Database
# 3. Add to .env file
```
- [ ] Supabase project created
- [ ] DATABASE_URL obtained
- [ ] DATABASE_URL added to .env

#### Option B: Local PostgreSQL
```bash
createdb creatorfi
```
- [ ] Local PostgreSQL installed
- [ ] Database created
- [ ] DATABASE_URL configured in .env

### 3. Environment Configuration
```bash
cp env.example .env
```

Edit `.env` and fill in:

**Required Variables:**
- [ ] `DATABASE_URL` - Your PostgreSQL connection string
- [ ] `FACILITATOR_URL` - x402 facilitator endpoint
- [ ] `EVM_ADDRESS` - Your Ethereum/Base wallet address
- [ ] `SVM_ADDRESS` - Your Solana wallet address
- [ ] `NEXT_PUBLIC_BASE_MERCHANT_ADDRESS` - EVM merchant address
- [ ] `NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS` - SVM merchant address

**Optional Variables:**
- [ ] `NEXT_PUBLIC_X402_PROJECT_ID` - x402 project identifier
- [ ] `APP_NAME` - Your app name (default: CreatorFi)
- [ ] `APP_LOGO` - Logo path (default: /x402-icon-blue.png)
- [ ] `NEXT_PUBLIC_HOST_URL` - Your app URL

### 4. Database Migration
```bash
pnpm db:migrate
```
- [ ] Migrations run successfully
- [ ] Tables created in database

### 5. Validate Setup
```bash
pnpm db:validate
```
- [ ] Database connection successful
- [ ] Schema validation passed
- [ ] x402 compatibility verified

### 6. (Optional) Seed Test Data
```bash
pnpm db:seed
```
- [ ] Test data seeded successfully

### 7. Start Development Server
```bash
pnpm dev
```
- [ ] Server started on http://localhost:3000
- [ ] No errors in console

## Verification Tests

### Test 1: Homepage Access
- [ ] Open http://localhost:3000
- [ ] Homepage loads without errors
- [ ] Content grid displays (may be empty)

### Test 2: Creator Dashboard
- [ ] Navigate to /dashboard/create
- [ ] Wallet connection button appears
- [ ] Connect wallet successfully
- [ ] Upload form is functional

### Test 3: Create Content
- [ ] Fill in content details
  - Title
  - Description
  - Type (Article/Video/Audio)
  - Price
  - Thumbnail URL
  - Content URL or Body text
- [ ] Submit form
- [ ] Redirect to homepage
- [ ] New content appears in grid

### Test 4: Payment Flow (x402 Protocol)
- [ ] Click on created content
- [ ] Content page loads with metadata
- [ ] Paywall UI displays (if not already paid)
- [ ] Connect wallet
- [ ] Click "Pay" button
- [ ] Wallet prompts for transaction signature
- [ ] Transaction confirmed
- [ ] Content unlocks automatically
- [ ] Protected content displays (video/audio/article)

### Test 5: x402 API Protection
- [ ] Open http://localhost:3000/api/weather (without payment)
- [ ] Receives 402 Payment Required response
- [ ] PAYMENT-REQUIRED header present
- [ ] Make payment via client
- [ ] API returns 200 OK with data
- [ ] PAYMENT-RESPONSE header present

### Test 6: Database Operations
```bash
# Open Prisma Studio
pnpm db:studio
```
- [ ] Prisma Studio opens at http://localhost:5555
- [ ] User table visible
- [ ] Content table visible
- [ ] Data matches what was created

## Troubleshooting Checklist

### Database Connection Issues
- [ ] DATABASE_URL format is correct
- [ ] Database server is running
- [ ] Firewall allows connection
- [ ] Credentials are valid
- [ ] IP is whitelisted (for Supabase)

### Build Errors
- [ ] All dependencies installed
- [ ] Prisma client generated (`pnpm prisma generate`)
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] No syntax errors in modified files

### Payment Not Working
- [ ] Wallet is connected
- [ ] Correct network selected (Base Sepolia for testnet)
- [ ] Sufficient balance (testnet USDC)
- [ ] FACILITATOR_URL is accessible
- [ ] Merchant addresses are valid
- [ ] Browser console shows no errors

### x402 Protocol Issues
- [ ] `@x402/*` packages installed correctly
- [ ] proxy.ts configuration is valid
- [ ] EVM and SVM schemes registered
- [ ] Paywall initialized properly
- [ ] Server started without errors

## Production Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Database backed up
- [ ] Environment variables documented
- [ ] Secrets rotation plan in place

### Deployment Platform (Vercel/Railway/Render)
- [ ] Project connected to Git
- [ ] Environment variables configured
- [ ] Build command set: `pnpm build`
- [ ] Start command set: `pnpm start`
- [ ] DATABASE_URL points to production database
- [ ] NODE_ENV=production

### Post-deployment
- [ ] Production URL accessible
- [ ] Database migrations applied
- [ ] Homepage loads correctly
- [ ] Payment flow works on production
- [ ] SSL/TLS certificate valid
- [ ] No console errors

### Monitoring
- [ ] Error tracking configured
- [ ] Database monitoring enabled
- [ ] Payment transaction logs reviewed
- [ ] Performance metrics collected

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No secrets committed to repository
- [ ] Database credentials rotated regularly
- [ ] Connection strings use SSL/TLS
- [ ] Content URLs protected (not in HTML source)
- [ ] HTTP-only cookies for access control
- [ ] Input validation on all forms
- [ ] CORS configured properly
- [ ] Rate limiting configured (production)
- [ ] Wallet signature verification implemented

## Performance Checklist

- [ ] Database indexes created (schema has @@index)
- [ ] Prisma query optimization reviewed
- [ ] Image optimization enabled (Next.js Image)
- [ ] Static generation used where possible
- [ ] API response caching configured
- [ ] CDN configured for static assets

## Documentation Checklist

- [x] README.md complete
- [x] DATABASE_SETUP.md created
- [x] PRD.md available
- [x] env.example up to date
- [ ] API documentation created (if needed)
- [ ] Deployment guide created (if needed)

---

## Need Help?

- **Database Issues**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **x402 Protocol**: Visit [x402.org](https://www.x402.org)
- **Prisma**: Check [Prisma Docs](https://www.prisma.io/docs)
- **Next.js**: Review [Next.js Docs](https://nextjs.org/docs)

## Support Commands

```bash
# View logs
pnpm dev 2>&1 | tee logs.txt

# Check database connection
pnpm db:validate

# View database
pnpm db:studio

# Reset database (development only!)
pnpm prisma migrate reset

# Format all code
pnpm format

# Lint code
pnpm lint
```

---

**Last Updated**: 2026-01-06
**Version**: 1.0.0
