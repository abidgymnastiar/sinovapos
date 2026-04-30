import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limitParam = Number(searchParams.get("limit") ?? "10");

    const allowedLimits = [10, 20, 30, 40];
    const limit = allowedLimits.includes(limitParam) ? limitParam : 10;

    const skip = (page - 1) * limit;

    const total = await prisma.product.count();

    const products = await prisma.product.findMany({
      orderBy: { id: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: toJSON(products),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

// CREATE
export async function POST(req: Request) {
  try {
    const body: { name?: string; image?: string } = await req.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        image: body.image,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: toJSON(product),
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("CREATE PRODUCT ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}