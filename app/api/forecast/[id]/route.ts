import { NextResponse } from "next/server";

const BASE_FORECAST_URL =
  process.env.FORECAST_API_URL ?? "http://127.0.0.1:8001/";

async function readForecastPayload(response: Response) {
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

function getForecastErrorMessage(payload: unknown) {
  if (payload && typeof payload === "object") {
    const data = payload as { detail?: string; message?: string };

    return data.detail ?? data.message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return "Failed to load forecast data";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log(`[Forecast API] Received request for product ID: ${id}`);

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, message: "Product ID is required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL(`/forecast/${id}`, BASE_FORECAST_URL).toString();
    console.log(`[Forecast API] Calling: ${url}`);

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const payload = await readForecastPayload(response);
      const message = getForecastErrorMessage(payload);
      const log = response.status >= 500 ? console.error : console.warn;

      log(`[Forecast API] Error: ${response.status} - ${message}`);

      return NextResponse.json(
        { success: false, message, detail: message },
        { status: response.status },
      );
    }

    const data = await readForecastPayload(response);
    console.log(`[Forecast API] Success for product ${id}`);

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("[Forecast API] Proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Forecast service unavailable" },
      { status: 502 },
    );
  }
}
