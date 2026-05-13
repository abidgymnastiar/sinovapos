import { RetrainCard } from "./retrain-card";

export default function SettingPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Setting</h1>
        <p className="text-muted-foreground">Kelola pengaturan aplikasi.</p>
      </div>

      <div className="px-4 lg:px-6">
        <RetrainCard />
      </div>
    </div>
  );
}
