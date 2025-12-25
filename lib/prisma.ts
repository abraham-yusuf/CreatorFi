import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // Pass datasourceUrl explicitly as checking the schema.prisma generated client
  // might not have it if we stripped it for validation reasons in this specific env.
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
