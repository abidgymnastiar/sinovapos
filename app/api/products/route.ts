import { Prisma } from "@/generated/prisma/client";
import { now } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import {
  isProductImageValidationError,
  parseProductPayload,
  toJSON,
} from "./_helpers/product";

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
    const body = await parseProductPayload(req);

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const currentDate = now();
    const product = await prisma.product.create({
      data: {
        created_at: currentDate,
        image: body.image,
        name: body.name.trim(),
        updated_at: currentDate,
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

    if (isProductImageValidationError(error)) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }

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
