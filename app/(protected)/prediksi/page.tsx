import { PredictionView } from "./prediction-view";

export default function PrediksiPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <PredictionView />
      </div>
    </div>
  );
}
