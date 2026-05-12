import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  console.log(JSON.stringify(users, null, 2));
  console.error(`Toplam: ${users.length} kullanıcı`);
} finally {
  await prisma.$disconnect();
}
