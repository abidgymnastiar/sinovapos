import { isAxiosError } from "axios";

import { api } from "@/lib/axios";

export type PredictionDetailPoint = {
  date: string;
  predicted_sales: number;
};

export type PredictionDetailProduct = {
  accuracy: number | null;
  alpha: number | null;
  beta: number | null;
  mape: number | null;
  predictions: PredictionDetailPoint[];
  product_id: number;
  product_name: string;
};

export type GeneratedPredictionProduct = PredictionDetailProduct;

export type GeneratedPredictionData = {
  forecast_month: number;
  forecast_year: number;
  generated_at: string | null;
  products: GeneratedPredictionProduct[];
};

export type PredictionDetailData = {
  forecast_month: number;
  forecast_year: number;
  generated_at: string | null;
  product: PredictionDetailProduct;
};

export type PredictionDetailParams = {
  month: number;
  productId: string | number;
  year: number;
};

export type GeneratePredictionParams = {
  month: number;
  year: number;
};

type PredictionDetailResponse = {
  data: PredictionDetailData | null;
  message: string;
  status: string;
};

type GeneratePredictionEnvelope = {
  data?: GeneratedPredictionData | null;
  message?: string;
  status?: string;
};

type PredictionErrorResponse = {
  detail?: string;
  message?: string;
};

export class PredictionApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PredictionApiError";
    this.status = status;
  }
}

function getPredictionErrorMessage(data: unknown) {
  if (data && typeof data === "object") {
    const payload = data as PredictionErrorResponse;

    return payload.detail ?? payload.message;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return null;
}

function normalizeGeneratedPredictionPayload(
  payload: GeneratedPredictionData | GeneratePredictionEnvelope,
) {
  if ("products" in payload) {
    return payload;
  }

  if (payload.data) {
    return payload.data;
  }

  throw new PredictionApiError(
    payload.message || "Data prediksi belum tersedia",
  );
}

export async function generatePrediction({
  month,
  year,
}: GeneratePredictionParams): Promise<GeneratedPredictionData> {
  try {
    const response = await api.post<
      GeneratedPredictionData | GeneratePredictionEnvelope
    >("/predictions/generate", {
      forecast_month: month,
      forecast_year: year,
    });

    return normalizeGeneratedPredictionPayload(response.data);
  } catch (error) {
    if (isAxiosError<PredictionErrorResponse>(error)) {
      throw new PredictionApiError(
        getPredictionErrorMessage(error.response?.data) ??
          "Gagal menjalankan prediksi",
        error.response?.status,
      );
    }

    throw error;
  }
}

export async function getPredictionDetail({
  month,
  productId,
  year,
}: PredictionDetailParams): Promise<PredictionDetailData> {
  try {
    const response = await api.get<PredictionDetailResponse>(
      "/predictions/detail",
      {
        params: {
          month,
          product_id: productId,
          year,
        },
      },
    );

    if (!response.data.data) {
      throw new PredictionApiError(
        response.data.message || "Data prediksi belum tersedia",
      );
    }

    return response.data.data;
  } catch (error) {
    if (isAxiosError<PredictionErrorResponse>(error)) {
      throw new PredictionApiError(
        getPredictionErrorMessage(error.response?.data) ??
          "Gagal memuat detail prediksi",
        error.response?.status,
      );
    }

    throw error;
  }
}
