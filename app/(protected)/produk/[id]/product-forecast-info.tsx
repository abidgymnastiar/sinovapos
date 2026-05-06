type ForecastInfoItem = {
  date: string;
  forecast?: number;
};

type ProductForecastInfoProps = {
  forecastDetails: ForecastInfoItem[];
  forecastNotice: string | null;
  isLoading: boolean;
  error: string | null;
  hasChartData: boolean;
};

const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export function ProductForecastInfo({
  forecastDetails,
  forecastNotice,
  isLoading,
  error,
  hasChartData,
}: ProductForecastInfoProps) {
  const forecastStartDate = forecastDetails[0]?.date;
  const forecastEndDate = forecastDetails[forecastDetails.length - 1]?.date;
  const forecastTotal = forecastDetails.reduce(
    (sum, item) => sum + (item.forecast ?? 0),
    0,
  );

  return (
    <>
      {forecastDetails.length > 0 && forecastStartDate && forecastEndDate ? (
        <section className="mt-4 rounded-lg border bg-muted/35 p-4 text-sm text-foreground">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Prediksi berikutnya
              </p>
              <p className="mt-1 font-medium">
                {fullDateFormatter.format(new Date(forecastStartDate))}
                {" - "}
                {fullDateFormatter.format(new Date(forecastEndDate))}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Total prediksi
              </p>
              <p className="mt-1 font-semibold">
                {numberFormatter.format(forecastTotal)}
              </p>
              <p className="text-xs text-muted-foreground">
                {forecastDetails.length} data
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
            {forecastDetails.map((item) => (
              <div
                key={item.date}
                className="rounded-md border bg-background px-3 py-2 shadow-xs"
              >
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {shortDateFormatter.format(new Date(item.date))}
                </p>
                <p className="mt-1 font-semibold">
                  {item.forecast !== undefined
                    ? numberFormatter.format(item.forecast)
                    : "-"}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading && !error && forecastNotice ? (
        <div className="mt-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {forecastNotice}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Loading chart data...
        </div>
      ) : error ? (
        <div className="mt-4 text-center text-sm text-destructive">
          {error}
        </div>
      ) : !hasChartData ? (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          No sales data available for this product.
        </div>
      ) : null}
    </>
  );
}
