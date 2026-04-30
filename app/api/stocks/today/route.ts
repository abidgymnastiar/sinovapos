import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import {
  getStockDateRange,
  getTodayStockDate,
  STOCK_INCLUDE,
  toJSON,
} from "../_helpers/stock";

export async function GET() {
  try {
    const today = getTodayStockDate();

    const stocks = await prisma.stock.findMany({
      where: {
        date: getStockDateRange(today),
      },
      orderBy: { id: "desc" },
      include: STOCK_INCLUDE,
    });

    const summary = stocks.reduce(
      (total, stock) => ({
        closingStock: total.closingStock + (stock.closing_stock ?? 0),
        openingStock: total.openingStock + stock.opening_stock,
        sold: total.sold + stock.sold,
      }),
      {
        closingStock: 0,
        openingStock: 0,
        sold: 0,
      },
    );

    return NextResponse.json({
      success: true,
      data: toJSON(stocks),
      meta: {
        date: today.toISOString().slice(0, 10),
        total: stocks.length,
        totalClosingStock: summary.closingStock,
        totalOpeningStock: summary.openingStock,
        totalSold: summary.sold,
      },
    });
  } catch (error: unknown) {
    console.error("GET TODAY STOCK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch stock",
      },
      { status: 500 },
    );
  }
}
