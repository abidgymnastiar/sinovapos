import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// helper BigInt serializer (tanpa any)
function toJSON<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

// GET ALL
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // page
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

    // limit dari UI
    const limitParam = Number(searchParams.get("limit") ?? "10");

    // whitelist limit
    const allowedLimits = [10, 20, 30, 40];
    const limit = allowedLimits.includes(limitParam) ? limitParam : 10;

    const skip = (page - 1) * limit;

    const total = await prisma.product.count();

    const products = await prisma.product.findMany({
      orderBy: { id: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json(
      toJSON({
        data: products,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
    );
  } catch (error: unknown) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

// CREATE
export async function POST(req: Request) {
  try {
    const body: { name?: string; image?: string } = await req.json();

    // validasi
    if (!body.name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        image: body.image,
      },
    });

    return NextResponse.json(toJSON(product), { status: 201 });
  } catch (error: unknown) {
    console.error("CREATE PRODUCT ERROR:", error);

    // handle error prisma (optional tapi bagus)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 },
    );
  }
}
