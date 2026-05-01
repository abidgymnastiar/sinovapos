import { Prisma } from "@/generated/prisma/client";
import { now } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import {
  isProductImageValidationError,
  parseProductPayload,
  toJSON,
} from "../_helpers/product";

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

    const body = await parseProductPayload(req);
    const data: Prisma.ProductUpdateInput = {};

    if (body.name !== undefined) {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          { success: false, message: "Nama produk wajib diisi." },
          { status: 400 },
        );
      }

      data.name = name;
    }

    if (body.image !== undefined) {
      data.image = body.image;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal satu field produk harus dikirim.",
        },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { created_at: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    const currentDate = now();

    if (!existingProduct.created_at) {
      data.created_at = currentDate;
    }

    data.updated_at = currentDate;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: toJSON(product),
    });
  } catch (error: unknown) {
    console.error("UPDATE PRODUCT ERROR:", error);

    if (isProductImageValidationError(error)) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

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
