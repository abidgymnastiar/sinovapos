import { CardItem } from "@/app/_components/card-items";

const data: {
  title: string;
  value: string;
  trend: "up" | "down";
  percentage: string;
  description: string;
  footer: string;
}[] = [
  {
    title: "Total Revenue",
    value: "$1,250.00",
    trend: "up",
    percentage: "+12.5%",
    description: "Trending up this month",
    footer: "Visitors for the last 6 months",
  },
  {
    title: "New Customers",
    value: "1,234",
    trend: "down",
    percentage: "-20%",
    description: "Down 20% this period",
    footer: "Acquisition needs attention",
  },
  {
    title: "Active Accounts",
    value: "45,678",
    trend: "up",
    percentage: "+12.5%",
    description: "Strong user retention",
    footer: "Engagement exceed targets",
  },
  {
    title: "Growth Rate",
    value: "4.5%",
    trend: "up",
    percentage: "+4.5%",
    description: "Steady performance increase",
    footer: "Meets growth projections",
  },
];

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.map((item, index) => (
        <CardItem key={index} {...item} />
      ))}
    </div>
  );
}
