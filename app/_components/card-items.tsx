"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

type CardItemProps = {
  title: string;
  value: string;
  trend: "up" | "down";
  percentage: string;
  description: string;
  footer: string;
};

export function CardItem({
  title,
  value,
  trend,
  percentage,
  description,
  footer,
}: CardItemProps) {
  const isUp = trend === "up";
  const Icon = isUp ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>

        <CardTitle className="font-mono text-2xl font-semibold tabular-nums tracking-tight @[250px]/card:text-3xl">
          {value}
        </CardTitle>

        <CardAction>
          <Badge variant="outline">
            <Icon />
            {percentage}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex gap-2 font-medium">
          {description}
          <Icon className="size-4" />
        </div>
        <div className="text-muted-foreground">{footer}</div>
      </CardFooter>
    </Card>
  );
}
