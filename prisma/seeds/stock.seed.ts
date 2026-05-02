import { PrismaClient } from "../../generated/prisma";

export async function seedStock(prisma: PrismaClient) {
  await prisma.stock.deleteMany();

  const products = await prisma.product.findMany();

  const today = new Date();

  const stockData: {
    product_id: bigint;
    date: Date;
    opening_stock: number;
    closing_stock: number;
    sold: number;
  }[] = [];

  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    for (const product of products) {
      const opening = 100 + Math.floor(Math.random() * 50);

      const sold =
        product.name === "Indomie"
          ? Math.floor(Math.random() * 80)
          : Math.floor(Math.random() * 40);

      const closing = opening - sold;

      stockData.push({
        product_id: product.id,
        date: date,
        opening_stock: opening,
        closing_stock: closing,
        sold,
      });
    }
  }

  await prisma.stock.createMany({
    data: stockData,
  });

  console.log("✅ Stock seeded (90 hari)");
}
