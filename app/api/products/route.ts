import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const PRODUCT_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "products",
);
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function toJSON<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

function getImageExtension(file: File) {
  const mimeExtension = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  }[file.type];

  if (mimeExtension) {
    return mimeExtension;
  }

  return path.extname(file.name).toLowerCase();
}

function isContentType(req: Request, contentType: string) {
  return req.headers.get("content-type")?.includes(contentType) ?? false;
}

async function saveProductImage(file: File) {
  if (file.size === 0) {
    return undefined;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Image harus JPG, PNG, atau WEBP");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran image maksimal 2MB");
  }

  await mkdir(PRODUCT_UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}${getImageExtension(file)}`;
  const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/products/${filename}`;
}

async function parseProductPayload(req: Request) {
  if (isContentType(req, "multipart/form-data")) {
    const formData = await req.formData();
    const name = formData.get("name");
    const image = formData.get("image");

    return {
      name: typeof name === "string" ? name : undefined,
      image: image instanceof File ? await saveProductImage(image) : undefined,
    };
  }

  const body: { name?: string; image?: string } = await req.json();

  return {
    name: body.name,
    image: body.image,
  };
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
    const body = await parseProductPayload(req);

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
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

    if (
      error instanceof Error &&
      (error.message === "Image harus JPG, PNG, atau WEBP" ||
        error.message === "Ukuran image maksimal 2MB")
    ) {
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
