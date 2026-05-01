import { prisma } from "@/lib/prisma";
import { now } from "@/lib/date";
import { NextResponse } from "next/server";
import {
  parseProductId,
  parseStockDate,
  STOCK_INCLUDE,
  getStockDateRange,
  toJSON,
} from "./_helpers/stock";

// GET ALL
export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { date: "desc" },
      include: STOCK_INCLUDE,
    });

    return NextResponse.json(toJSON(stocks));
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch stocks" },
      { status: 500 },
    );
  }
}

// CREATE (harian)
export async function POST(req: Request) {
  try {
    const body: {
      product_id: string;
      date: string;
      opening_stock: number;
      closing_stock?: number;
    } = await req.json();

    if (!body.product_id || !body.date || body.opening_stock === undefined) {
      return NextResponse.json(
        { message: "Invalid input" },
        { status: 400 },
      );
    }

    const productId = parseProductId(body.product_id);
    const stockDate = parseStockDate(body.date);
    const openingStock = Number(body.opening_stock);
    const closingStock =
      body.closing_stock === undefined ? undefined : Number(body.closing_stock);

    if (productId === null || stockDate === null) {
      return NextResponse.json(
        { message: "Product ID atau tanggal tidak valid" },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(openingStock) ||
      openingStock < 0 ||
      (closingStock !== undefined &&
        (!Number.isInteger(closingStock) || closingStock < 0))
    ) {
      return NextResponse.json(
        { message: "Stok harus berupa angka bulat dan tidak boleh negatif" },
        { status: 400 },
      );
    }

    if (closingStock !== undefined && closingStock > openingStock) {
      return NextResponse.json(
        { message: "Stok akhir tidak boleh lebih besar dari stok awal" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const existingStock = await prisma.stock.findFirst({
      where: {
        product_id: productId,
        date: getStockDateRange(stockDate),
      },
      include: STOCK_INCLUDE,
    });

    if (existingStock) {
      return NextResponse.json(
        {
          message:
            "Penjualan produk ini untuk tanggal tersebut sudah pernah ditambahkan",
          data: toJSON(existingStock),
        },
        { status: 409 },
      );
    }

    // hitung sold
    const sold =
      closingStock !== undefined ? openingStock - closingStock : null;

    const currentDate = now();
    const stock = await prisma.stock.create({
      data: {
        created_at: currentDate,
        closing_stock: closingStock,
        date: stockDate,
        opening_stock: openingStock,
        product_id: productId,
        sold: sold ?? 0, // default prisma but kita kontrol logic
        updated_at: currentDate,
      },
      include: STOCK_INCLUDE,
    });

    return NextResponse.json(toJSON(stock), { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create stock" },
      { status: 500 },
    );
  }
}
