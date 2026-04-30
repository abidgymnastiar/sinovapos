"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

type CustomButtonProps = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "destructive";
};

export function CustomButton({
  label,
  icon,
  onClick,
  variant = "outline",
}: CustomButtonProps) {
  return (
    <Button variant={variant} size="sm" onClick={onClick}>
      {icon && <span className="mr-2">{icon}</span>}
      <span className="hidden lg:inline">{label}</span>
    </Button>
  );
}