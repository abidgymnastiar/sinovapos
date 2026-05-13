import { NextResponse } from "next/server";

const BASE_FORECAST_URL =
  process.env.FORECAST_API_URL ?? "http://127.0.0.1:8001/";

async function readTrainPayload(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getTrainMessage(payload: unknown) {
  if (payload && typeof payload === "object") {
    const data = payload as { detail?: string; message?: string };

    return data.detail ?? data.message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return "Gagal menjalankan retrain model.";
}

function getSuccessPayload(payload: unknown) {
  if (payload && typeof payload === "object") {
    return payload;
  }

  if (typeof payload === "string" && payload.trim()) {
    return {
      message: payload,
      success: true,
    };
  }

  return {
    message: "Retrain model berhasil dijalankan.",
    success: true,
  };
}

export async function POST() {
  try {
    const url = new URL("/train/", BASE_FORECAST_URL).toString();
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      method: "POST",
    });

    const payload = await readTrainPayload(response);

    if (!response.ok) {
      const message = getTrainMessage(payload);

      return NextResponse.json(
        { detail: message, message, success: false },
        { status: response.status },
      );
    }

    return NextResponse.json(getSuccessPayload(payload), {
      status: 200,
    });
  } catch (error) {
    console.error("[Train API] Proxy error:", error);

    return NextResponse.json(
      {
        message: "Training service unavailable",
        success: false,
      },
      { status: 502 },
    );
  }
}
