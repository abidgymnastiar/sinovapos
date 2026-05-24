import { PrismaClient } from "../../generated/prisma";

export async function seedProduct(prisma: PrismaClient) {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      // { name: "Indomie" },
      // { name: "Aqua" },
      { name: "Nasi Ayam Goreng" },
      { name: "Nasi Ayam Rempah" },
      { name: "Nasi Goreng" },
      { name: "Risol" },
      { name: "Tempura" },
    ],
  });

  console.log("✅ Product seeded");
}
