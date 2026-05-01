import { Prisma } from "@/generated/prisma/client";
import { now } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import {
  getStockDateRange,
  parseProductId,
  parseStockDate,
  STOCK_INCLUDE,
  toJSON,
} from "../_helpers/stock";

function parseStockId(rawId: string): bigint | null {
  if (!/^\d+$/.test(rawId)) {
    return null;
  }

  return BigInt(rawId);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseStockId(rawId);

    if (id === null) {
      return NextResponse.json(
        { message: "ID penjualan tidak valid" },
        { status: 400 },
      );
    }

    const body: {
      closing_stock?: number | null;
      date?: string;
      opening_stock?: number;
      product_id?: string;
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
      body.closing_stock === undefined || body.closing_stock === null
        ? null
        : Number(body.closing_stock);

    if (productId === null || stockDate === null) {
      return NextResponse.json(
        { message: "Product ID atau tanggal tidak valid" },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(openingStock) ||
      openingStock < 0 ||
      (closingStock !== null &&
        (!Number.isInteger(closingStock) || closingStock < 0))
    ) {
      return NextResponse.json(
        { message: "Stok harus berupa angka bulat dan tidak boleh negatif" },
        { status: 400 },
      );
    }

    if (closingStock !== null && closingStock > openingStock) {
      return NextResponse.json(
        { message: "Stok akhir tidak boleh lebih besar dari stok awal" },
        { status: 400 },
      );
    }

    const [existingStock, product] = await Promise.all([
      prisma.stock.findUnique({
        where: { id },
        select: { created_at: true },
      }),
      prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      }),
    ]);

    if (!existingStock) {
      return NextResponse.json(
        { message: "Data penjualan tidak ditemukan" },
        { status: 404 },
      );
    }

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const duplicateStock = await prisma.stock.findFirst({
      where: {
        id: { not: id },
        product_id: productId,
        date: getStockDateRange(stockDate),
      },
      include: STOCK_INCLUDE,
    });

    if (duplicateStock) {
      return NextResponse.json(
        {
          message:
            "Penjualan produk ini untuk tanggal tersebut sudah pernah ditambahkan",
          data: toJSON(duplicateStock),
        },
        { status: 409 },
      );
    }

    const currentDate = now();
    const stock = await prisma.stock.update({
      where: { id },
      data: {
        ...(existingStock.created_at ? {} : { created_at: currentDate }),
        closing_stock: closingStock,
        date: stockDate,
        opening_stock: openingStock,
        product_id: productId,
        sold: closingStock === null ? 0 : openingStock - closingStock,
        updated_at: currentDate,
      },
      include: STOCK_INCLUDE,
    });

    return NextResponse.json(toJSON(stock));
  } catch (error: unknown) {
    console.error("UPDATE STOCK ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Data penjualan tidak ditemukan" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update stock" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseStockId(rawId);

    if (id === null) {
      return NextResponse.json(
        { message: "ID penjualan tidak valid" },
        { status: 400 },
      );
    }

    await prisma.stock.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Data penjualan berhasil dihapus",
      success: true,
    });
  } catch (error: unknown) {
    console.error("DELETE STOCK ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Data penjualan tidak ditemukan" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete stock" },
      { status: 500 },
    );
  }
}
