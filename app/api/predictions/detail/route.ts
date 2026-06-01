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

  return "Gagal memuat detail prediksi";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));
  const productId = Number(searchParams.get("product_id"));

  if (!month || month < 1 || month > 12 || !year || !productId) {
    return NextResponse.json(
      {
        data: null,
        message: "Bulan, tahun, dan produk wajib dipilih.",
        status: "error",
      },
      { status: 400 },
    );
  }

  try {
    const url = new URL("/predictions/detail", BASE_FORECAST_URL);
    url.searchParams.set("month", String(month));
    url.searchParams.set("year", String(year));
    url.searchParams.set("product_id", String(productId));

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });
    const payload = await readPredictionPayload(response);

    if (!response.ok) {
      const message = getPredictionErrorMessage(payload);

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

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("[Prediction Detail API] Proxy error:", error);

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
