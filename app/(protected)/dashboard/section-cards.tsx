import { CardItem } from "@/app/_components/card-items";
import type { DashboardSummary } from "@/services/dashboardService";

type CardData = {
  title: string;
  value: string;
  percentage: string;
  description: string;
  footer: string;
};

type SectionCardsProps = {
  data: DashboardSummary;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function getCards(data: DashboardSummary): CardData[] {
  return [
    {
      title: "Total Produk",
      value: formatNumber(data.total_produk),
      percentage: "",
      description: "Jumlah produk yang terdaftar",
      footer: "Diambil dari data produk",
    },
    {
      title: "Total Penjualan",
      value: formatNumber(data.total_penjualan),
      percentage: "",
      description: "Total produk terjual",
      footer: "Akumulasi dari data penjualan",
    },
    {
      title: "Produk Terlaris",
      value: data.produk_terlaris?.name ?? "-",
      percentage: "",
      description: `${formatNumber(data.produk_terlaris?.total_sold ?? 0)} terjual`,
      footer: "Berdasarkan jumlah sold tertinggi",
    },
    {
      title: "Prediksi Penjualan",
      value: "400",
      percentage: "",
      description: "Perkiraan penjualan berikutnya",
      footer: "Berdasarkan analisis historis",
    },
  ];
}

export function SectionCards({ data }: SectionCardsProps) {
  const cards = getCards(data);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((item, index) => (
        <CardItem key={index} {...item} />
      ))}
    </div>
  );
}
