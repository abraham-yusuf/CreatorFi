#!/usr/bin/env node
/**
 * Database Connection Validator
 * 
 * This script validates the database connection and schema setup.
 * Run with: node scripts/validate-db.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function validateDatabase() {
  console.log('🔍 Validating database connection...\n')

  try {
    // Test 1: Database connection
    console.log('✅ Test 1: Connecting to database...')
    await prisma.$connect()
    console.log('   Connected successfully!\n')

    // Test 2: Check if tables exist
    console.log('✅ Test 2: Checking tables...')
    const userCount = await prisma.user.count()
    const contentCount = await prisma.content.count()
    console.log(`   Found ${userCount} users and ${contentCount} content items\n`)

    // Test 3: Verify schema structure
    console.log('✅ Test 3: Verifying schema structure...')
    
    // Create a test user (will fail if schema is wrong)
    const testWallet = `0xtest${Date.now()}`
    const testUser = await prisma.user.create({
      data: {
        walletAddress: testWallet,
        username: 'Test Validator',
      }
    })
    console.log('   User model structure: OK')

    // Create test content
    const testContent = await prisma.content.create({
      data: {
        title: 'Test Content',
        description: 'Validation test',
        type: 'ARTICLE',
        price: 1.0,
        currency: 'USDC',
        thumbnailUrl: 'https://example.com/test.jpg',
        textContent: 'Test article content',
        creatorId: testUser.id,
        creatorAddress: testUser.walletAddress,
      }
    })
    console.log('   Content model structure: OK\n')

    // Test 4: Verify x402 compatibility fields
    console.log('✅ Test 4: Verifying x402 compatibility...')
    const content = await prisma.content.findUnique({
      where: { id: testContent.id },
      include: { creator: true }
    })
    
    if (!content.creatorAddress) {
      throw new Error('Missing creatorAddress field (required for x402)')
    }
    console.log('   creatorAddress field: OK')
    console.log(`   Creator wallet: ${content.creatorAddress}\n`)

    // Clean up test data
    console.log('🧹 Cleaning up test data...')
    await prisma.content.delete({ where: { id: testContent.id } })
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log('   Cleaned up successfully\n')

    // Success
    console.log('🎉 All validation tests passed!')
    console.log('✅ Database is properly configured for CreatorFi with x402 protocol\n')
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Ensure DATABASE_URL is set in your .env file')
    console.error('2. Run: pnpm prisma migrate deploy')
    console.error('3. Check your database connection\n')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validateDatabase()
