import { NextResponse } from "next/server";

const BASE_FORECAST_URL =
  process.env.FORECAST_API_URL ?? "http://127.0.0.1:8001/";

async function readPredictionPayload(response: Response) {
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

function getPredictionErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object") {
    const data = payload as { detail?: string; message?: string };

    return data.detail ?? data.message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return "Gagal menjalankan prediksi";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const payload = body as {
    forecast_month?: unknown;
    forecast_year?: unknown;
  } | null;
  const forecastMonth = Number(payload?.forecast_month);
  const forecastYear = Number(payload?.forecast_year);

  if (
    !forecastMonth ||
    forecastMonth < 1 ||
    forecastMonth > 12 ||
    !forecastYear
  ) {
    return NextResponse.json(
      {
        data: null,
        message: "Bulan dan tahun wajib dipilih.",
        status: "error",
      },
      { status: 400 },
    );
  }

  try {
    const url = new URL("/predictions/generate", BASE_FORECAST_URL);
    const response = await fetch(url, {
      body: JSON.stringify({
        forecast_month: forecastMonth,
        forecast_year: forecastYear,
      }),
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      method: "POST",
    });
    const predictionPayload = await readPredictionPayload(response);

    if (!response.ok) {
      const message = getPredictionErrorMessage(predictionPayload);

      return NextResponse.json(
        {
          data: null,
          detail: message,
          message,
          status: "error",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(predictionPayload, { status: 200 });
  } catch (error) {
    console.error("[Prediction Generate API] Proxy error:", error);

    return NextResponse.json(
      {
        data: null,
        message: "Prediction service unavailable",
        status: "error",
      },
      { status: 502 },
    );
  }
}
