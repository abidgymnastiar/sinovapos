import { PredictionDetailChart } from "./prediction-detail-chart";
import { PredictionGenerateCard } from "./prediction-generate-card";

export function PredictionView() {
  return (
    <>
      <PredictionGenerateCard />
      <PredictionDetailChart />
    </>
  );
}
