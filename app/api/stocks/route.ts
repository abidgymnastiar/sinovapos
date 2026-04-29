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

// GET ALL
export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { date: "desc" },
      include: { product: true },
    });

    return NextResponse.json(toJSON(stocks));
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch stocks" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    // hitung sold
    const sold =
      body.closing_stock !== undefined
        ? body.opening_stock - body.closing_stock
        : null;

    const stock = await prisma.stock.create({
      data: {
        product_id: BigInt(body.product_id),
        date: new Date(body.date),
        opening_stock: body.opening_stock,
        closing_stock: body.closing_stock,
        sold: sold ?? 0, // default prisma but kita kontrol logic
      },
    });

    return NextResponse.json(toJSON(stock), { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create stock" },
      { status: 500 }
    );
  }
}