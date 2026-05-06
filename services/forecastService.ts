import { api } from "@/lib/axios";
import { isAxiosError } from "axios";

export type ForecastItem = {
  date: string;
  prediction: number;
};

export type ForecastData = {
  productId: number;
  name: string;
  steps: number;
  forecasts: ForecastItem[];
};

export type ForecastResponse = {
  status: string;
  message: string;
  data: ForecastData;
};

type ForecastErrorResponse = {
  detail?: string;
  message?: string;
};

export class ForecastApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ForecastApiError";
    this.status = status;
  }
}

function getForecastErrorMessage(data: unknown) {
  if (data && typeof data === "object") {
    const payload = data as ForecastErrorResponse;

    return payload.detail ?? payload.message;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return null;
}

/**
 * Get forecast data for a specific product
 * @param productId - The product ID to get forecast for
 * @returns Forecast data for the product
 */
export const getProductForecast = async (
  productId: string | number,
): Promise<ForecastData> => {
  try {
    const res = await api.get<ForecastResponse>(`/forecast/${productId}`);

    return res.data.data;
  } catch (error) {
    if (isAxiosError<ForecastErrorResponse>(error)) {
      throw new ForecastApiError(
        getForecastErrorMessage(error.response?.data) ??
          "Failed to load forecast data",
        error.response?.status,
      );
    }

    throw error;
  }
};

/**
 * Get forecast data for multiple products
 * @param productIds - Array of product IDs
 * @returns Array of forecast data for each product
 */
export const getMultipleProductForecasts = async (
  productIds: (string | number)[],
): Promise<ForecastData[]> => {
  const results = await Promise.all(
    productIds.map((id) => getProductForecast(id)),
  );
  return results;
};
