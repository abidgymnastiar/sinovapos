"use client";

import * as React from "react";
import { EllipsisVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ActionMenuItem = {
  disabled?: boolean;
  label: string;
  onSelect?: () => void;
  separatorBefore?: boolean;
  variant?: "default" | "destructive";
};

type ActionMenuProps = {
  contentClassName?: string;
  items: ActionMenuItem[];
  label?: string;
};

export function ActionMenu({
  contentClassName = "w-40",
  items,
  label = "Buka menu aksi",
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <EllipsisVerticalIcon />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        {items.map((item) => (
          <React.Fragment key={item.label}>
            {item.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              disabled={item.disabled}
              onSelect={() => item.onSelect?.()}
              variant={item.variant}
            >
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
