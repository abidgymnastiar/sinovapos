import { PrismaClient } from "../../generated/prisma";

const TEMPURA_PRODUCT_NAME = "Nasi Ayam Goreng";

const tempuraSalesData = [
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 5 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 5 },
  { opening_stock: 22, sold: 8 },
  { opening_stock: 22, sold: 8 },
  { opening_stock: 22, sold: 8 },
  { opening_stock: 22, sold: 8 },
  { opening_stock: 22, sold: 4 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 9 },
  { opening_stock: 22, sold: 4 },
  { opening_stock: 22, sold: 4 },
  { opening_stock: 22, sold: 5 },
];

function isWeekend(date: Date) {
  const day = date.getDay();

  return day === 0 || day === 6;
}

function createStockDate(workdayIndex: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  let foundWorkdays = 0;

  while (true) {
    if (!isWeekend(date)) {
      if (foundWorkdays === workdayIndex) {
        return new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
        );
      }

      foundWorkdays += 1;
    }

    date.setDate(date.getDate() - 1);
  }
}

export async function seedTempuraSales(prisma: PrismaClient) {
  const tempuraProduct = await prisma.product.findFirst({
    where: {
      name: TEMPURA_PRODUCT_NAME,
    },
  });

  if (!tempuraProduct) {
    throw new Error(`Produk ${TEMPURA_PRODUCT_NAME} tidak ditemukan`);
  }

  await prisma.stock.deleteMany({
    where: {
      product_id: tempuraProduct.id,
    },
  });

  await prisma.stock.createMany({
    data: tempuraSalesData.map((item, index) => ({
      product_id: tempuraProduct.id,
      date: createStockDate(index),
      opening_stock: item.opening_stock,
      closing_stock: item.opening_stock - item.sold,
      sold: item.sold,
    })),
  });

  console.log(`✅ Tempura sales seeded (${tempuraSalesData.length} data)`);
}
