import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// helper BigInt
function toJSON<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

function parseProductId(rawId: string): bigint | null {
  if (!/^\d+$/.test(rawId)) {
    return null;
  }

  return BigInt(rawId);
}

// =======================
// GET BY ID
// =======================
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseProductId(rawId);

    if (id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stocks: {
          orderBy: [{ date: "desc" }, { id: "desc" }],
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: toJSON(product),
      meta: {
        totalStocks: product.stocks.length,
      },
    });
  } catch (error: unknown) {
    console.error("GET PRODUCT ERROR:", error);

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

// =======================
// UPDATE (PUT)
// =======================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseProductId(rawId);

    if (id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );
    }

    const body: { name?: string; image?: string } = await req.json();

    // optional validation
    if (!body.name && !body.image) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one field (name/image) is required",
        },
        { status: 400 },
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        image: body.image,
      },
    });

    return NextResponse.json({
      success: true,
      data: toJSON(product),
    });
  } catch (error: unknown) {
    console.error("UPDATE PRODUCT ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 },
        );
      }

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

// =======================
// DELETE
// =======================
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseProductId(rawId);

    if (id === null) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );
    }

    const stockCount = await prisma.stock.count({
      where: { product_id: id },
    });

    if (stockCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Product cannot be deleted because it still has ${stockCount} stock record(s).`,
        },
        { status: 409 },
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE PRODUCT ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 },
        );
      }

      if (error.code === "P2003") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product cannot be deleted because it is still referenced by related stock data.",
          },
          { status: 409 },
        );
      }

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
