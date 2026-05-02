import { PrismaClient } from "../../generated/prisma";

export async function seedProduct(prisma: PrismaClient) {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [{ name: "Indomie" }, { name: "Aqua" }],
  });

  console.log("✅ Product seeded");
}
