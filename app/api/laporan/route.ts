import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import {
  getNextDate,
  getTodayStockDate,
  parseStockDate,
  toJSON,
} from "../stocks/_helpers/stock";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const WEEKEND_DAY_INDEXES = new Set([0, 6]);

type SoldValue = number | "-";
type ReportRow = Record<string, SoldValue | string | number | bigint> & {
  nama_produk: string;
  product_id: bigint;
  total_sold: number;
};

type DateColumn = {
  date: string;
  day: string;
  is_tanggal_merah: boolean;
  is_visible: boolean;
  is_weekend: boolean;
  key: string;
  label: string;
  reason: string | null;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function getMonthStart(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
  );
}

function getNextMonthStart(monthStart: Date) {
  return new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  );
}

function getMonthEnd(nextMonthStart: Date) {
  return new Date(nextMonthStart.getTime() - DAY_IN_MS);
}

function parseBoolean(value: string | null) {
  return value === "true" || value === "1";
}

function parseMonth(rawMonth: string) {
  const match = rawMonth.trim().match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return null;
  }

  return new Date(Date.UTC(year, monthIndex, 1));
}

function getRequestedMonthStart(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawMonth = searchParams.get("month");

  if (rawMonth) {
    return parseMonth(rawMonth);
  }

  const rawDate =
    searchParams.get("date") ?? searchParams.get("startDate") ?? "";

  if (rawDate) {
    const parsedDate = parseStockDate(rawDate);

    return parsedDate ? getMonthStart(parsedDate) : null;
  }

  return getMonthStart(getTodayStockDate());
}

function getAdditionalTanggalMerah(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawDates = searchParams.get("tanggalMerah");

  if (!rawDates) {
    return new Set<string>();
  }

  const dates = rawDates
    .split(",")
    .map((rawDate) => parseStockDate(rawDate))
    .filter((date): date is Date => date !== null)
    .map(toDateKey);

  return new Set(dates);
}

function getMonthDateColumns(
  monthStart: Date,
  nextMonthStart: Date,
  additionalTanggalMerah: Set<string>,
  includeWeekend: boolean,
  includeTanggalMerah: boolean,
) {
  const columns: DateColumn[] = [];

  for (
    let date = monthStart;
    date.getTime() < nextMonthStart.getTime();
    date = getNextDate(date)
  ) {
    const dateKey = toDateKey(date);
    const dayIndex = date.getUTCDay();
    const isWeekend = WEEKEND_DAY_INDEXES.has(dayIndex);
    const isAdditionalTanggalMerah = additionalTanggalMerah.has(dateKey);
    const dayLabel = DAY_LABELS[dayIndex];
    const label = String(date.getUTCDate()).padStart(2, "0");
    const reason = isWeekend
      ? dayLabel
      : isAdditionalTanggalMerah
        ? "Tanggal merah"
        : null;

    columns.push({
      date: dateKey,
      day: dayLabel,
      is_tanggal_merah: isAdditionalTanggalMerah,
      is_visible:
        (includeWeekend || !isWeekend) &&
        (includeTanggalMerah || !isAdditionalTanggalMerah),
      is_weekend: isWeekend,
      key: `tgl_${label}`,
      label,
      reason,
    });
  }

  return columns;
}

export async function GET(req: Request) {
  try {
    const monthStart = getRequestedMonthStart(req);

    if (!monthStart) {
      return NextResponse.json(
        { success: false, message: "Bulan laporan tidak valid" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const includeWeekend = parseBoolean(searchParams.get("includeWeekend"));
    const includeTanggalMerah = parseBoolean(
      searchParams.get("includeTanggalMerah"),
    );
    const additionalTanggalMerah = getAdditionalTanggalMerah(req);
    const nextMonthStart = getNextMonthStart(monthStart);
    const monthEnd = getMonthEnd(nextMonthStart);
    const dateColumns = getMonthDateColumns(
      monthStart,
      nextMonthStart,
      additionalTanggalMerah,
      includeWeekend,
      includeTanggalMerah,
    );
    const visibleDateColumns = dateColumns.filter(
      (column) => column.is_visible,
    );

    const [products, stocks] = await Promise.all([
      prisma.product.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.stock.findMany({
        where: {
          date: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        orderBy: { date: "asc" },
        select: {
          product_id: true,
          date: true,
          sold: true,
        },
      }),
    ]);

    const soldByProductDate = new Map<bigint, Map<string, number>>();

    for (const stock of stocks) {
      const dateKey = toDateKey(stock.date);
      const productSold = soldByProductDate.get(stock.product_id) ?? new Map();
      const currentSold = productSold.get(dateKey) ?? 0;

      productSold.set(dateKey, currentSold + stock.sold);
      soldByProductDate.set(stock.product_id, productSold);
    }

    const report = products.map((product, index) => {
      const productSold = soldByProductDate.get(product.id);
      const row: ReportRow = {
        nama_produk: product.name,
        no: index + 1,
        product_id: product.id,
        total_sold: 0,
      };

      for (const column of visibleDateColumns) {
        const sold = productSold?.has(column.date)
          ? productSold.get(column.date) ?? 0
          : "-";

        row[column.key] = sold;

        if (typeof sold === "number") {
          row.total_sold += sold;
        }
      }

      return row;
    });

    return NextResponse.json({
      success: true,
      data: toJSON(report),
      meta: {
        columns: [
          {
            key: "nama_produk",
            label: "Produk",
          },
          ...visibleDateColumns.map((column) => ({
            date: column.date,
            day: column.day,
            is_tanggal_merah: column.is_tanggal_merah,
            is_weekend: column.is_weekend,
            key: column.key,
            label: column.label,
          })),
        ],
        excluded_dates: dateColumns
          .filter((column) => !column.is_visible)
          .map((column) => ({
            date: column.date,
            day: column.day,
            is_tanggal_merah: column.is_tanggal_merah,
            is_weekend: column.is_weekend,
            key: column.key,
            label: column.label,
            reason: column.reason,
          })),
        include_tanggal_merah: includeTanggalMerah,
        include_weekend: includeWeekend,
        month: toMonthKey(monthStart),
        month_end: toDateKey(monthEnd),
        month_start: toDateKey(monthStart),
      },
    });
  } catch (error: unknown) {
    console.error("GET REPORT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch report",
      },
      { status: 500 },
    );
  }
}
