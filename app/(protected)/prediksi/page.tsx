import { CalendarDaysIcon, PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function PrediksiPage() {
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1);
  const currentYear = String(currentDate.getFullYear());

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Prediksi Penjualan</CardTitle>
            <CardDescription>
              Perbarui model prediksi menggunakan data penjualan terbaru.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 border-t pt-4 lg:grid-cols-[minmax(0,1fr)_14rem_10rem_auto] lg:items-end">
            <p className="text-sm text-muted-foreground">
              Jalankan training setelah data penjualan diperbarui.
            </p>

            <div className="grid gap-2">
              <Label htmlFor="prediction-month">Bulan Prediksi</Label>
              <Select defaultValue={currentMonth}>
                <SelectTrigger id="prediction-month" className="w-full">
                  <CalendarDaysIcon />
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={String(index + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prediction-year">Tahun</Label>
              <Input
                id="prediction-year"
                defaultValue={currentYear}
                inputMode="numeric"
                max={2100}
                min={2000}
                type="number"
              />
            </div>

            <Button type="button" className="w-full lg:w-fit">
              <PlayIcon />
              Train Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
