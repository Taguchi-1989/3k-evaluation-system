import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma