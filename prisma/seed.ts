import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma"
import { seedProduct } from "./seeds/product.seed"
import { seedStock } from "./seeds/stock.seed"

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter })

async function main() {
  await seedProduct(prisma) // ✅ OK
  await seedStock(prisma)   // ✅ OK
}

main()
  .catch((e) => {
    console.error("❌ Seeder error:", e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })