import { isAxiosError } from "axios";

import { api } from "@/lib/axios";

export type TrainResponse = {
  detail?: string;
  message?: string;
  status?: string;
  success?: boolean;
  [key: string]: unknown;
};

type TrainErrorResponse = {
  detail?: string;
  message?: string;
};

export class TrainingApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TrainingApiError";
    this.status = status;
  }
}

function getTrainingMessage(data: unknown) {
  if (data && typeof data === "object") {
    const payload = data as TrainErrorResponse;

    return payload.detail ?? payload.message;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return null;
}

export function getTrainingResponseMessage(response: TrainResponse) {
  return getTrainingMessage(response) ?? "Retrain model berhasil dijalankan.";
}

export const retrainModel = async (): Promise<TrainResponse> => {
  try {
    const res = await api.post<TrainResponse>("/train");

    return res.data;
  } catch (error) {
    if (isAxiosError<TrainErrorResponse>(error)) {
      throw new TrainingApiError(
        getTrainingMessage(error.response?.data) ??
          "Gagal menjalankan retrain model.",
        error.response?.status,
      );
    }

    throw error;
  }
};
