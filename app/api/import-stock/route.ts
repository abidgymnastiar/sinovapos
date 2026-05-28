import type { Prisma } from "@/generated/prisma";
import { parseStockExcel } from "@/lib/excel/parse-stock-excel";
import { now } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ImportStockResponse = {
  success: boolean;
  imported: number;
  skipped: number;
  duplicates: number;
  errors: string[];
};

const ALLOWED_EXTENSIONS = new Set([".xlsx", ".xls"]);

function createImportResponse(
  response: ImportStockResponse,
  status: number = 200,
) {
  return NextResponse.json(response, { status });
}

function createEmptyResponse(
  errors: string[],
  status: number,
): NextResponse<ImportStockResponse> {
  return createImportResponse(
    {
      duplicates: 0,
      errors,
      imported: 0,
      skipped: 0,
      success: false,
    },
    status,
  );
}

function getFileExtension(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return filename.slice(lastDotIndex).toLowerCase();
}

function normalizeProductName(productName: string) {
  return productName.trim().toLowerCase();
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createStockKey(productId: bigint, date: Date) {
  return `${productId.toString()}|${toDateKey(date)}`;
}

function randomIntInclusive(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createStockNumbers(sold: number) {
  let opening_stock = randomIntInclusive(20, 60);

  if (sold > opening_stock) {
    opening_stock = sold + randomIntInclusive(10, 50);
  }

  return {
    closing_stock: opening_stock - sold,
    opening_stock,
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get("file");

    if (!uploadedFile || typeof uploadedFile === "string") {
      return createEmptyResponse(["File wajib ada"], 400);
    }

    if (uploadedFile.size === 0) {
      return createEmptyResponse(["File tidak boleh kosong"], 400);
    }

    const extension = getFileExtension(uploadedFile.name);

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return createEmptyResponse(
        ["Ekstensi file harus .xlsx atau .xls"],
        400,
      );
    }

    const parseResult = parseStockExcel(await uploadedFile.arrayBuffer());

    if (parseResult.fatalErrors.length > 0) {
      return createEmptyResponse(parseResult.fatalErrors, 400);
    }

    const errors = [...parseResult.errors];
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
    const productMap = new Map<string, bigint>();

    products.forEach((product) => {
      const productKey = normalizeProductName(product.name);

      if (!productMap.has(productKey)) {
        productMap.set(productKey, product.id);
      }
    });

    const candidateRows: {
      date: Date;
      productId: bigint;
      sold: number;
      stockKey: string;
    }[] = [];

    for (const row of parseResult.rows) {
      const productId = productMap.get(normalizeProductName(row.productName));

      if (productId === undefined) {
        errors.push(
          `Baris ${row.rowNumber}: Produk '${row.productName}' tidak ditemukan`,
        );
        continue;
      }

      candidateRows.push({
        date: row.date,
        productId,
        sold: row.sold,
        stockKey: createStockKey(productId, row.date),
      });
    }

    const productIds = Array.from(
      new Set(candidateRows.map((row) => row.productId)),
    );
    const dates = Array.from(
      new Map(candidateRows.map((row) => [toDateKey(row.date), row.date]))
        .values(),
    );
    const existingStocks =
      productIds.length > 0 && dates.length > 0
        ? await prisma.stock.findMany({
            select: {
              date: true,
              product_id: true,
            },
            where: {
              date: {
                in: dates,
              },
              product_id: {
                in: productIds,
              },
            },
          })
        : [];
    const existingStockKeys = new Set(
      existingStocks.map((stock) => createStockKey(stock.product_id, stock.date)),
    );
    const pendingStockKeys = new Set<string>();
    const stocksToInsert: Prisma.StockCreateManyInput[] = [];
    let duplicates = 0;

    for (const row of candidateRows) {
      if (existingStockKeys.has(row.stockKey) || pendingStockKeys.has(row.stockKey)) {
        duplicates += 1;
        continue;
      }

      pendingStockKeys.add(row.stockKey);

      const { closing_stock, opening_stock } = createStockNumbers(row.sold);
      const currentDate = now();

      stocksToInsert.push({
        closing_stock,
        created_at: currentDate,
        date: row.date,
        opening_stock,
        product_id: row.productId,
        sold: row.sold,
        updated_at: currentDate,
      });
    }

    const result =
      stocksToInsert.length > 0
        ? await prisma.stock.createMany({
            data: stocksToInsert,
          })
        : { count: 0 };

    return createImportResponse({
      duplicates,
      errors,
      imported: result.count,
      skipped: errors.length + duplicates,
      success: true,
    });
  } catch (error: unknown) {
    console.error("IMPORT STOCK ERROR:", error);

    return createEmptyResponse(
      [error instanceof Error ? error.message : "Internal Server Error"],
      500,
    );
  }
}
