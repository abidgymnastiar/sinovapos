import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SoldPerProductPerDay = {
  date: string;
  product_id: bigint;
  product_name: string;
  sold: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const productId = searchParams.get("productId");
  const days = Number(searchParams.get("days") ?? 90);

  try {
    const productFilter = productId
      ? `AND p.id = ${Number(productId)}`
      : `AND p.id = (
          SELECT product_id
          FROM Stock s2
          WHERE s2.date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
          GROUP BY product_id
          ORDER BY SUM(s2.sold) DESC
          LIMIT 1
        )`;

    const result = await prisma.$queryRawUnsafe<SoldPerProductPerDay[]>(`
      SELECT 
        DATE(s.date) as date,
        p.id as product_id,
        p.name as product_name,
        COALESCE(SUM(s.sold), 0) as sold
      FROM Stock s
      JOIN Product p ON p.id = s.product_id
      WHERE s.date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
      ${productFilter}
      GROUP BY DATE(s.date), p.id, p.name
      ORDER BY date ASC
    `);

    // 🔥 FIX BigInt
    const formatted = result.map((item) => ({
      date: item.date,
      product_id: Number(item.product_id), // ← ini penting
      product_name: item.product_name,
      sold: item.sold,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product sold data",
      },
      { status: 500 },
    );
  }
}
