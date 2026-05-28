import * as XLSX from "xlsx";

export type ParsedStockExcelRow = {
  rowNumber: number;
  date: Date;
  productName: string;
  sold: number;
};

export type ParseStockExcelResult = {
  rows: ParsedStockExcelRow[];
  errors: string[];
  fatalErrors: string[];
};

type ExcelCell = string | number | boolean | Date | null | undefined;

const REQUIRED_COLUMNS = ["Tanggal", "Nama Produk", "Jumlah Terjual"] as const;

function normalizeColumnName(value: ExcelCell) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function cellToText(value: ExcelCell) {
  return String(value ?? "").trim();
}

function isRowEmpty(row: ExcelCell[]) {
  return row.every((cell) => cellToText(cell) === "");
}

function buildHeaderMap(row: ExcelCell[]) {
  const headerMap = new Map<string, number>();

  row.forEach((cell, index) => {
    const header = normalizeColumnName(cell);

    if (header && !headerMap.has(header)) {
      headerMap.set(header, index);
    }
  });

  return headerMap;
}

function createDateOnly(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseExcelDate(value: ExcelCell) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return createDateOnly(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate(),
    );
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (!parsed) {
      return null;
    }

    return createDateOnly(parsed.y, parsed.m, parsed.d);
  }

  const rawDate = cellToText(value);

  if (!rawDate) {
    return null;
  }

  const isoMatch = rawDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  if (isoMatch) {
    return createDateOnly(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3]),
    );
  }

  const indonesianDateMatch = rawDate.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/,
  );

  if (indonesianDateMatch) {
    const year = Number(indonesianDateMatch[3]);

    return createDateOnly(
      year < 100 ? 2000 + year : year,
      Number(indonesianDateMatch[2]),
      Number(indonesianDateMatch[1]),
    );
  }

  const fallbackDate = new Date(rawDate);

  if (Number.isNaN(fallbackDate.getTime())) {
    return null;
  }

  return createDateOnly(
    fallbackDate.getFullYear(),
    fallbackDate.getMonth() + 1,
    fallbackDate.getDate(),
  );
}

function parseSold(value: ExcelCell) {
  if (typeof value !== "number" && !cellToText(value)) {
    return null;
  }

  const sold = typeof value === "number" ? value : Number(cellToText(value));

  if (!Number.isFinite(sold) || !Number.isInteger(sold)) {
    return null;
  }

  return sold;
}

export function parseStockExcel(buffer: ArrayBuffer): ParseStockExcelResult {
  const workbook = XLSX.read(buffer, {
    cellDates: true,
    type: "array",
  });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return {
      errors: [],
      fatalErrors: ["File Excel tidak memiliki worksheet"],
      rows: [],
    };
  }

  const worksheet = workbook.Sheets[sheetName];
  const sheetRows = XLSX.utils.sheet_to_json<ExcelCell[]>(worksheet, {
    blankrows: false,
    defval: "",
    header: 1,
    raw: true,
  });

  const headerRowIndex = sheetRows.findIndex((row) => {
    if (isRowEmpty(row)) {
      return false;
    }

    const headerMap = buildHeaderMap(row);

    return REQUIRED_COLUMNS.every((column) =>
      headerMap.has(normalizeColumnName(column)),
    );
  });

  if (headerRowIndex === -1) {
    const firstContentRow = sheetRows.find((row) => !isRowEmpty(row));

    if (!firstContentRow) {
      return {
        errors: [],
        fatalErrors: ["File Excel kosong"],
        rows: [],
      };
    }

    const headerMap = buildHeaderMap(firstContentRow);
    const missingColumns = REQUIRED_COLUMNS.filter(
      (column) => !headerMap.has(normalizeColumnName(column)),
    );

    return {
      errors: [],
      fatalErrors: [
        `Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}`,
      ],
      rows: [],
    };
  }

  const headerMap = buildHeaderMap(sheetRows[headerRowIndex]);
  const dateColumnIndex = headerMap.get(normalizeColumnName("Tanggal"));
  const productColumnIndex = headerMap.get(normalizeColumnName("Nama Produk"));
  const soldColumnIndex = headerMap.get(normalizeColumnName("Jumlah Terjual"));

  if (
    dateColumnIndex === undefined ||
    productColumnIndex === undefined ||
    soldColumnIndex === undefined
  ) {
    return {
      errors: [],
      fatalErrors: ["Kolom wajib tidak ditemukan"],
      rows: [],
    };
  }

  const rows: ParsedStockExcelRow[] = [];
  const errors: string[] = [];

  for (let index = headerRowIndex + 1; index < sheetRows.length; index += 1) {
    const row = sheetRows[index];

    if (isRowEmpty(row)) {
      continue;
    }

    const rowNumber = index + 1;
    const productName = cellToText(row[productColumnIndex]);
    const date = parseExcelDate(row[dateColumnIndex]);
    const sold = parseSold(row[soldColumnIndex]);
    const rowErrors: string[] = [];

    if (!productName) {
      rowErrors.push("Nama Produk tidak boleh kosong");
    }

    if (!date) {
      rowErrors.push("Tanggal harus valid Date");
    }

    if (sold === null) {
      rowErrors.push("Jumlah Terjual harus angka");
    } else if (sold < 0) {
      rowErrors.push("Jumlah Terjual tidak boleh minus");
    }

    if (rowErrors.length > 0 || date === null || sold === null || sold < 0) {
      errors.push(`Baris ${rowNumber}: ${rowErrors.join(", ")}`);
      continue;
    }

    rows.push({
      date,
      productName,
      rowNumber,
      sold,
    });
  }

  return {
    errors,
    fatalErrors: [],
    rows,
  };
}
