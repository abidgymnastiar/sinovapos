import { ChartItem, TimeRange } from "./chart-types";

export function filterChartData(
  data: ChartItem[],
  timeRange: TimeRange,
): ChartItem[] {
  const referenceDate = new Date("2024-06-30");

  const daysMap: Record<TimeRange, number> = {
    "90d": 90,
    "30d": 30,
    "7d": 7,
  };

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysMap[timeRange]);

  return data.filter((item) => new Date(item.date) >= startDate);
}
