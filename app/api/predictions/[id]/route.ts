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

  return "Failed to load prediction data";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, message: "Product ID is required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL(`/predictions/${id}`, BASE_FORECAST_URL).toString();
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
        { success: false, message, detail: message },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("[Prediction Product API] Proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Prediction service unavailable" },
      { status: 502 },
    );
  }
}
