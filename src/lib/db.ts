import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const db = new PrismaClient().$extends(withAccelerate());

const globalForPrisma = global as unknown as { prisma: typeof db }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db