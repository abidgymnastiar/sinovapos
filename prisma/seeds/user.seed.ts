import bcrypt from "bcrypt";

import { PrismaClient } from "../../generated/prisma";

const seedUser = {
  name: process.env.SEED_USER_NAME ?? "Administrator",
  email: (process.env.SEED_USER_EMAIL ?? "admin").toLowerCase(),
  password: process.env.SEED_USER_PASSWORD ?? "1234567",
};

export async function seedUserLogin(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash(seedUser.password, 12);
  const now = new Date();

  await prisma.user.upsert({
    where: {
      email: seedUser.email,
    },
    update: {
      name: seedUser.name,
      password: hashedPassword,
      updated_at: now,
    },
    create: {
      name: seedUser.name,
      email: seedUser.email,
      password: hashedPassword,
      created_at: now,
      updated_at: now,
    },
  });

  console.log(`✅ User login seeded: ${seedUser.email}`);
}
