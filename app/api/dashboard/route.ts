import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// helper BigInt
function toJSON<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    const [totalProduk, totalPenjualan, produkTerlaris] = await Promise.all([
      prisma.product.count(),
      prisma.stock.aggregate({
        _sum: {
          sold: true,
        },
      }),
      prisma.stock.groupBy({
        by: ["product_id"],
        _sum: {
          sold: true,
        },
        orderBy: {
          _sum: {
            sold: "desc",
          },
        },
        take: 1,
      }),
    ]);

    let produkTerlarisDetail = null;

    if (produkTerlaris.length > 0) {
      const productId = produkTerlaris[0].product_id;

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      produkTerlarisDetail = product
        ? {
            ...product,
            total_sold: produkTerlaris[0]._sum.sold ?? 0,
          }
        : null;
    }

    return NextResponse.json(
      toJSON({
        total_produk: totalProduk,
        total_penjualan: totalPenjualan._sum.sold ?? 0,
        produk_terlaris: produkTerlarisDetail,
      }),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
