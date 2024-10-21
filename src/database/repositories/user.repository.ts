import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsersWithRawQuery = async () => {
  const users =
    await prisma.$queryRaw`SELECT * FROM User WHERE deletedAt = null ORDER BY createdAt DESC`;
  return users;
};
