export const STOCK_INCLUDE = {
  product: true,
} as const;

const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function toJSON<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );
}

export function parseProductId(rawId: string) {
  if (!/^\d+$/.test(rawId)) {
    return null;
  }

  return BigInt(rawId);
}

function getDateKeyInJakarta(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

export function parseStockDate(rawDate: string) {
  const trimmedDate = rawDate.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
    return new Date(`${trimmedDate}T00:00:00.000Z`);
  }

  const date = new Date(trimmedDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const dateKey = getDateKeyInJakarta(date);

  return dateKey ? new Date(`${dateKey}T00:00:00.000Z`) : null;
}

export function getTodayStockDate() {
  const dateKey = getDateKeyInJakarta(new Date());

  if (!dateKey) {
    throw new Error("Failed to resolve today's date");
  }

  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function getNextDate(date: Date) {
  return new Date(date.getTime() + DAY_IN_MS);
}

export function getStockDateRange(date: Date) {
  return {
    gte: date,
    lt: getNextDate(date),
  };
}
